import { faker } from '@faker-js/faker';

/**
 * Stand-in for the legacy onboarding/register service (not hosted in this repo).
 * Production users arrive with an auth identity; here we seed a local `User` row
 * via the domain API so downstream onboarding can bind `userId`.
 */
export type StubRegisteredUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
};

export function buildStubRegisteredUser(
  overrides: Partial<StubRegisteredUser> = {},
): StubRegisteredUser {
  const id = faker.string.alphanumeric(8).toLowerCase();
  return {
    firstName: overrides.firstName ?? 'System',
    lastName: overrides.lastName ?? `Test${id}`,
    email: overrides.email ?? `developer-onboarding+${id}@system-tests.mofi`,
    phone: overrides.phone ?? '+2348012345678',
    roles: overrides.roles ?? ['developer'],
  };
}

export function buildStubProjectManagerUser(): StubRegisteredUser {
  const id = faker.string.alphanumeric(6).toLowerCase();
  return {
    firstName: 'PM',
    lastName: `Manager${id}`,
    email: `pm+${id}@system-tests.mofi`,
    phone: '+2348099999999',
    roles: ['project_manager'],
  };
}
