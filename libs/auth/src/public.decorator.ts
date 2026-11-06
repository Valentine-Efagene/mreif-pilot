import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'mofi:isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const DOMAIN_GUARD_KEY = 'mofi:domainRolesGuard';
/** Apply nest-auth / local RolesGuard on handlers in this domain module. */
export const DomainRolesGuard = () => SetMetadata(DOMAIN_GUARD_KEY, true);
