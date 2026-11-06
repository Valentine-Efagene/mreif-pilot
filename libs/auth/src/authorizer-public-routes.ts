/**
 * Paths treated as public by the API Gateway custom authorizer.
 * Source of truth for local AUTH_ENFORCEMENT=local guard only; production relies on Gateway.
 */
export const AUTHORIZER_PUBLIC_PATHS: readonly string[] = [
  '/health',
  '/agent/health',
  '/pmb/health',
  '/rsa/health',
  '/developer/health',
  '/uploader/health',
  '/cooperative/health',
  '/pmb/pmbs/names',
  '/developer/developers/names',
  '/cooperative/cooperatives/names',
  '/cooperative/auth/login',
];

export function isAuthorizerPublicPath(path: string): boolean {
  return AUTHORIZER_PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}
