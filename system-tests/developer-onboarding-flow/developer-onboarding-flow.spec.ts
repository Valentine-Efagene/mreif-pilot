import * as path from 'path';
import {
  bootInProcessDeveloperApp,
  createHttpClient,
  createInProcessClient,
  resetProjectManagersForSystemTest as resetProjectManagersInProcess,
  runDeveloperOnboardingFlow,
} from '../support/developer-onboarding.harness';
import {
  fetchNotificationQueueSnapshot,
  purgeNotificationsQueue,
} from '../support/valkey-bull-test-helpers';
import {
  SystemTestReport,
  writeScenarioReport,
} from '../support/report-writer';
import { resetProjectManagersForSystemTest } from '../support/system-test-mysql';
import {
  isSystemTestsEnabled,
  resolveSystemTestMode,
} from '../support/system-test-gate';

const scenarioDir = path.join(__dirname);
const scenarioName = 'developer-onboarding-flow';

const describeFn = isSystemTestsEnabled() ? describe : describe.skip;

describeFn(scenarioName, () => {
  const mode = resolveSystemTestMode();

  it(
    'runs the developer onboarding system flow',
    async () => {
      expect(mode).not.toBeNull();

      const startedAt = new Date().toISOString();
      const report: SystemTestReport = {
        scenario: scenarioName,
        mode: mode!,
        startedAt,
        finishedAt: '',
        status: 'failed',
        steps: [],
        notes: [],
      };

      let cleanup: (() => Promise<void>) | undefined;

      try {
        if (mode === 'in-process') {
          const booted = await bootInProcessDeveloperApp();
          cleanup = booted.cleanup;
          await resetProjectManagersInProcess(booted.app);
          const client = createInProcessClient(booted.app);
          const flow = await runDeveloperOnboardingFlow(client, {
            queueBaseline: booted.queueBaseline,
            expectedNotificationMessages: 1,
          });
          report.steps = flow.steps;
          report.notes?.push(
            `developerId=${flow.developerId}, userId=${flow.userId}, pm=${flow.projectManagerEmail}, notificationUrl=${process.env.notification_url}`,
          );
          if (flow.manualInboxNote) {
            report.notes?.push(flow.manualInboxNote);
          }
        } else {
          const baseUrl = process.env.MOFI_PLATFORM_API_URL!;
          await resetProjectManagersForSystemTest();
          await purgeNotificationsQueue();
          const queueBaseline = await fetchNotificationQueueSnapshot();

          const client = createHttpClient(baseUrl);
          const flow = await runDeveloperOnboardingFlow(client, {
            queueBaseline,
            expectedNotificationMessages: 1,
          });
          report.steps = flow.steps;
          report.notes?.push(
            `platform=${baseUrl}, developerId=${flow.developerId}, userId=${flow.userId}, pm=${flow.projectManagerEmail}`,
          );
          if (flow.manualInboxNote) {
            report.notes?.push(flow.manualInboxNote);
          }
        }

        report.status = 'passed';
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        report.steps.push({
          name: 'Unhandled error',
          status: 'failed',
          detail: message,
        });
        report.status = 'failed';
        throw err;
      } finally {
        report.finishedAt = new Date().toISOString();
        writeScenarioReport(scenarioDir, report);
        await cleanup?.();
      }
    },
    240_000,
  );
});
