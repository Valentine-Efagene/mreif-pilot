/** Unsigned JWT-shaped token; local `MofiAuthorizerGuard` decodes without verifying. */
export function systemTestAuthHeaders(
  userId = 1,
): Record<string, string> {
  const header = Buffer.from(
    JSON.stringify({ alg: 'none', typ: 'JWT' }),
  ).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ user_id: userId, roles: ['developer'] }),
  ).toString('base64url');
  return {
    Authorization: `Bearer ${header}.${payload}.`,
    user_id: String(userId),
  };
}
