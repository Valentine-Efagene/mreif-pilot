export type AuthEnforcement = 'gateway' | 'local';

/**
 * gateway — JWT validated by API Gateway custom authorizer; Nest uses @qshelter/nest-auth only.
 * local — npm run start:dev without Gateway; optional MofiAuthorizerGuard mirrors authorizer public routes.
 */
export function getAuthEnforcement(): AuthEnforcement {
  const explicit = process.env.AUTH_ENFORCEMENT?.toLowerCase();
  if (explicit === 'gateway' || explicit === 'local') {
    return explicit;
  }
  if (process.env.MOFI_STAGE || process.env.NODE_ENV === 'production') {
    return 'gateway';
  }
  return 'local';
}

export function isGatewayAuthEnforcement(): boolean {
  return getAuthEnforcement() === 'gateway';
}

export function isLocalAuthEnforcement(): boolean {
  return getAuthEnforcement() === 'local';
}
