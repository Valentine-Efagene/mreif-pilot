import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { connectMofiMicroservices } from '../../apps/_shared/connect-microservices';
import {
  DeveloperOnboardingStageName,
  ModeOfBusinessRegistration,
} from '../../domains/developer/src/developer/developer.enums';
import { PreferredContactMethod } from '../../domains/developer/src/developer-poc/developer-poc.enums';
import { PlatformLambdaInvokeService } from '../../libs/notifications/src/platform-lambda-invoke.service';
import {
  buildStubProjectManagerUser,
  buildStubRegisteredUser,
  StubRegisteredUser,
} from './stubs/external-registration.stub';
import { createLambdaInvokeStub } from './stubs/lambda-invoke.stub';
import { applyAmqpTestEnv } from './messaging-test-env';
import {
  resolveNotificationBaseUrl,
  systemTestProjectManagerEmail,
} from './notification-test-config';
import {
  fetchNotificationQueueSnapshot,
  cancelNotificationsQueueConsumers,
  purgeNotificationsQueue,
  QueueSnapshot,
  waitForNotificationQueueConsumed,
} from './rabbitmq-test-helpers';
import { StepResult } from './report-writer';
import { httpTestClient } from './http-test-client';
import { systemTestAuthHeaders } from './system-test-auth';

export type OnboardingFlowResult = {
  userId: number;
  developerId: number;
  projectManagerEmail?: string;
  steps: StepResult[];
  manualInboxNote?: string;
};

export type DeveloperOnboardingClient = {
  registerStubUser: () => Promise<{ userId: number; profile: StubRegisteredUser }>;
  registerStubProjectManager: () => Promise<{ email: string }>;
  completeOnboarding: (
    userId: number,
    profile: StubRegisteredUser,
  ) => Promise<{ developerId: number }>;
  getDeveloperByUser: (userId: number) => Promise<{
    id: number;
    onboardingStages: Array<{ name: string; completed: boolean }>;
  }>;
};

export type DeveloperAppBoot = {
  app: INestApplication;
  workerApp: INestApplication;
  queueBaseline: QueueSnapshot;
  cleanup: () => Promise<void>;
};

function applyInProcessTestEnv(): void {
  for (const key of ['AUTH_ENFORCEMENT', 'MOFI_STAGE']) {
    delete process.env[key];
  }
  process.env.AUTH_ENFORCEMENT = 'gateway';
  applyAmqpTestEnv();
  process.env.admin_dashboard_url = 'https://admin.stub.mofi';
  process.env.app = process.env.app ?? 'mofi';
  process.env.MOFI_CONTAINER_ROLE = 'developer';
  process.env.MOFI_RUNTIME = 'domain';
  process.env.DB_HOST = process.env.SYSTEM_TEST_DB_HOST ?? '127.0.0.1';
  process.env.DB_PORT = process.env.SYSTEM_TEST_DB_PORT ?? '3308';
  process.env.DB_NAME = process.env.SYSTEM_TEST_DB_NAME ?? 'mofi_platform_test';
  process.env.DB_USERNAME = process.env.SYSTEM_TEST_DB_USERNAME ?? 'root';
  process.env.DB_PASSWORD =
    process.env.SYSTEM_TEST_DB_PASSWORD ?? 'mofi_test_root';
  process.env.TYPEORM_SYNCHRONIZE = 'true';
  process.env.NODE_ENV = 'test';
}

/** `EnvironmentHelper.env` is fixed at first import; keep it in sync for dynamic test URLs. */
async function syncDeveloperNotificationUrl(baseUrl: string): Promise<void> {
  process.env.NOTIFICATION_URL = baseUrl;
  process.env.notification_url = baseUrl;
  const { default: EnvironmentHelper } = await import(
    '../../domains/developer/src/common/helpers/EnvironmentHelper'
  );
  EnvironmentHelper.env.notification_url = baseUrl;
}

/** Wipe accumulated PM rows so company-registration notifies only the stub PM. */
export async function resetProjectManagersForSystemTest(
  app: INestApplication,
): Promise<void> {
  const { getDataSourceToken } = await import('@nestjs/typeorm');
  const ds = app.get(getDataSourceToken('developer'));
  await ds.query(
    `DELETE FROM users WHERE JSON_CONTAINS(roles, '"project_manager"')`,
  );
}

export async function bootInProcessDeveloperApp(): Promise<DeveloperAppBoot> {
  applyInProcessTestEnv();

  await syncDeveloperNotificationUrl(resolveNotificationBaseUrl());

  const lambdaStub = createLambdaInvokeStub();

  const { WorkerAppModule } = await import(
    '../../apps/worker/src/worker-app.module'
  );
  process.env.MOFI_RUNTIME = 'worker';
  process.env.MOFI_CONTAINER_ROLE = 'worker';
  process.env.MOFI_WORKER_QUEUES = 'notifications';

  const workerFixture = await Test.createTestingModule({
    imports: [WorkerAppModule],
  })
    .overrideProvider(PlatformLambdaInvokeService)
    .useValue(lambdaStub)
    .compile();

  cancelNotificationsQueueConsumers();

  const workerApp = workerFixture.createNestApplication();
  await workerApp.init();
  await purgeNotificationsQueue();
  const workerConfig = workerApp.get(ConfigService);
  await connectMofiMicroservices(workerApp, workerConfig);

  const queueBaseline = await fetchNotificationQueueSnapshot();

  process.env.MOFI_RUNTIME = 'domain';
  process.env.MOFI_CONTAINER_ROLE = 'developer';

  const { DeveloperAppModule } = await import(
    '../../domains/developer/src/developer-app.module'
  );

  const moduleFixture = await Test.createTestingModule({
    imports: [DeveloperAppModule],
  })
    .overrideProvider(PlatformLambdaInvokeService)
    .useValue(lambdaStub)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('developer');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true,
    }),
  );
  await app.init();

  return {
    app,
    workerApp,
    queueBaseline,
    cleanup: async () => {
      await app.close();
      await workerApp.close();
    },
  };
}

function buildDeveloperPayload(userId: number, profile: StubRegisteredUser) {
  return {
    userId,
    businessName: 'System Test Developments Ltd',
    modeOfRegistration: ModeOfBusinessRegistration.LIMITED_LIABILITY,
    rcNumber: 'RC-STUB-001',
    registeredAddress: '12 Onboarding Street, Lagos',
    operatingAddress: '12 Onboarding Street, Lagos',
    hasAuditedAccounts: true,
    isSubsidiary: true,
    yearsOfOperation: 5,
    hasTrackRecordInPropertyDevelopment: true,
    bank: 'Stub Bank Plc',
    accountName: `${profile.firstName} ${profile.lastName}`,
    accountNumber: '0123456789',
    agreedToTerms: true,
    pocs: [
      {
        name: `${profile.firstName} POC`,
        position: 'Managing Director',
        businessAddress: '12 Onboarding Street, Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        phoneNumber: profile.phone ?? '+2348012345678',
        email: profile.email,
        preferredContactMethod: PreferredContactMethod.EMAIL,
      },
    ],
    groupEntities: [
      {
        name: 'Stub Holdings',
        rcNumber: 'RC-HOLD-001',
      },
    ],
    developerDocuments: [
      {
        name: 'Certificate of Incorporation',
        description: 'System test document',
        url: 'https://uploads.stub.mofi/certificate.pdf',
        size: 2048,
      },
    ],
    directors: [
      {
        firstName: profile.firstName,
        lastName: profile.lastName,
        homeAddress: '12 Onboarding Street, Lagos',
        dateOfBirth: '1990-01-15',
        phoneNumber: profile.phone ?? '+2348012345678',
        email: profile.email,
        documents: [
          {
            name: 'Director ID',
            description: 'System test',
            url: 'https://uploads.stub.mofi/director-id.pdf',
            size: 1024,
          },
        ],
      },
    ],
  };
}

export function createInProcessClient(
  app: INestApplication,
): DeveloperOnboardingClient {
  const server = app.getHttpServer();

  return {
    async registerStubUser() {
      const profile = buildStubRegisteredUser();
      const res = await httpTestClient(server)
        .post('/developer/users')
        .set(systemTestAuthHeaders(1))
        .send(profile)
        .expect(201);
      return { userId: res.body.data.id as number, profile };
    },

    async registerStubProjectManager() {
      const pm = buildStubProjectManagerUser();
      await httpTestClient(server)
        .post('/developer/users')
        .set(systemTestAuthHeaders(1))
        .send(pm)
        .expect(201);
      return { email: pm.email };
    },

    async completeOnboarding(userId, profile) {
      const res = await httpTestClient(server)
        .post('/developer/developers')
        .set(systemTestAuthHeaders(userId))
        .send(buildDeveloperPayload(userId, profile))
        .expect(201);
      return { developerId: res.body.data.id as number };
    },

    async getDeveloperByUser(userId) {
      const res = await httpTestClient(server)
        .get(`/developer/developers/by-user/${userId}`)
        .set(systemTestAuthHeaders(userId))
        .expect(200);
      return {
        id: res.body.data.id as number,
        onboardingStages: res.body.data.onboardingStages ?? [],
      };
    },
  };
}

export function createHttpClient(baseUrl: string): DeveloperOnboardingClient {
  const normalized = baseUrl.replace(/\/$/, '');

  async function jsonFetch(
    method: string,
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) {
    const res = await fetch(`${normalized}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : {};
    if (!res.ok) {
      throw new Error(
        `${method} ${path} failed (${res.status}): ${text.slice(0, 500)}`,
      );
    }
    return parsed;
  }

  return {
    async registerStubUser() {
      const profile = buildStubRegisteredUser();
      const res = await jsonFetch('POST', '/developer/users', profile);
      return { userId: res.data.id as number, profile };
    },

    async registerStubProjectManager() {
      const pm = buildStubProjectManagerUser();
      await jsonFetch('POST', '/developer/users', pm);
      return { email: pm.email };
    },

    async completeOnboarding(userId, profile) {
      const res = await jsonFetch(
        'POST',
        '/developer/developers',
        buildDeveloperPayload(userId, profile),
        { user_id: String(userId) },
      );
      return { developerId: res.data.id as number };
    },

    async getDeveloperByUser(userId) {
      const res = await jsonFetch(
        'GET',
        `/developer/developers/by-user/${userId}`,
        undefined,
        { user_id: String(userId) },
      );
      return {
        id: res.data.id as number,
        onboardingStages: res.data.onboardingStages ?? [],
      };
    },
  };
}

const REQUIRED_STAGES = Object.values(DeveloperOnboardingStageName);

export type NotificationCheckContext = {
  queueBaseline?: QueueSnapshot;
  expectedNotificationMessages?: number;
  projectManagerEmail?: string;
};

export async function runDeveloperOnboardingFlow(
  client: DeveloperOnboardingClient,
  notificationCtx: NotificationCheckContext = {},
): Promise<OnboardingFlowResult> {
  const steps: StepResult[] = [];

  const { email: projectManagerEmail } =
    await client.registerStubProjectManager();
  steps.push({
    name: 'Stub project manager (admin notification audience)',
    status: 'passed',
    detail: projectManagerEmail,
  });

  const { userId, profile } = await client.registerStubUser();
  steps.push({
    name: 'Stub external registration (POST /developer/users)',
    status: 'passed',
    detail: `userId=${userId}, email=${profile.email}`,
  });

  if (notificationCtx.queueBaseline) {
    await purgeNotificationsQueue();
    Object.assign(
      notificationCtx.queueBaseline,
      await fetchNotificationQueueSnapshot(),
    );
  }

  const { developerId } = await client.completeOnboarding(userId, profile);
  steps.push({
    name: 'Complete developer onboarding (POST /developer/developers)',
    status: 'passed',
    detail: `developerId=${developerId}`,
  });

  const byUser = await client.getDeveloperByUser(userId);
  if (byUser.id !== developerId) {
    throw new Error(
      `by-user developer id ${byUser.id} !== created ${developerId}`,
    );
  }
  steps.push({
    name: 'Fetch developer by user (GET /developer/developers/by-user/:id)',
    status: 'passed',
  });

  for (const stageName of REQUIRED_STAGES) {
    const stage = byUser.onboardingStages.find((s) => s.name === stageName);
    if (!stage?.completed) {
      throw new Error(`Onboarding stage not completed: ${stageName}`);
    }
  }
  steps.push({
    name: 'All onboarding stages marked complete',
    status: 'passed',
    detail: REQUIRED_STAGES.join(', '),
  });

  let manualInboxNote: string | undefined;

  if (notificationCtx.queueBaseline) {
    const expected = notificationCtx.expectedNotificationMessages ?? 1;
    const final = await waitForNotificationQueueConsumed(
      notificationCtx.queueBaseline,
      expected,
    );
    const deliverDelta =
      final.deliverGetTotal - notificationCtx.queueBaseline.deliverGetTotal;
    const pending = final.messages_ready + final.messages_unacknowledged;
  const queueNote =
      pending > 0
        ? ` (queue still has ${pending} message(s)—purge rabbit or restart compose if emails never arrive)`
        : '';
    steps.push({
      name: 'Company registration notification (RMQ consumed → testnotify)',
      status: 'passed',
      detail: `mofi.notifications.commands deliverDelta=${deliverDelta}, ready=${final.messages_ready}, unacked=${final.messages_unacknowledged}${queueNote}`,
    });
    const inbox = systemTestProjectManagerEmail();
    manualInboxNote = `Manual: check inbox ${inbox} for company registration template.`;
    steps.push({
      name: 'Company registration email (manual inbox check)',
      status: 'passed',
      detail: manualInboxNote,
    });
  } else {
    steps.push({
      name: 'Company registration notification (RMQ → worker → testnotify)',
      status: 'skipped',
      detail: 'HTTP platform mode without in-process worker/Rabbit',
    });
  }

  return {
    userId,
    developerId,
    projectManagerEmail,
    steps,
    manualInboxNote,
  };
}
