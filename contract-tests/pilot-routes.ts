/**
 * Pilot route contract derived from MofixQshelter_admin/src/redux/services/api.ts
 * and MOFI API Gateway base paths. Used to guard regressions during Lambda → ECS migration.
 */
export const PILOT_ROUTE_CONTRACT: Array<{ method: string; path: string }> = [
  { method: 'POST', path: '/uploader/document' },
  { method: 'POST', path: '/uploader/document/presign' },
  { method: 'POST', path: '/uploader/document/bundle' },
  { method: 'POST', path: '/uploader/document/create-presigned-post' },
  { method: 'POST', path: '/pmb/pmbs/' },
  { method: 'PATCH', path: '/pmb/pmbs/:id' },
  { method: 'DELETE', path: '/pmb/pmbs/:id' },
  { method: 'POST', path: '/pmb/pmbs/:id/toggle-listing' },
  { method: 'PUT', path: '/pmb/pmbs/:pmbId/assign-admin' },
  { method: 'POST', path: '/pmb/pmbs/paginate' },
  { method: 'GET', path: '/pmb/pmbs/:id' },
  { method: 'GET', path: '/pmb/pmbs/:id/staff' },
  { method: 'GET', path: '/rsa/rsas/:id' },
  { method: 'GET', path: '/rsa/rsas/by-mortgage/:id' },
  { method: 'POST', path: '/rsa/rsas/:id/update-status' },
  { method: 'PUT', path: '/rsa/api/approve/rsa-application/:id' },
  { method: 'PUT', path: '/rsa/api/decline/rsa-application/:id' },
  { method: 'PUT', path: '/rsa/api/approve/document/:id' },
  { method: 'PUT', path: '/rsa/api/decline/document/:id' },
  { method: 'POST', path: '/developer/proposed-developments/paginate' },
  { method: 'GET', path: '/developer/proposed-developments/:id' },
  { method: 'GET', path: '/developer/developers/:id' },
  { method: 'PATCH', path: '/developer/developers/:id' },
  { method: 'GET', path: '/agent/agents/:id' },
  { method: 'GET', path: '/agent/agents/by-user/:id' },
  { method: 'POST', path: '/agent/agents/:id/update-status' },
  { method: 'GET', path: '/cooperative/cooperatives/names' },
  { method: 'POST', path: '/cooperative/auth/login' },
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/agent/health' },
];

export const DOMAIN_BASE_PATHS = [
  'agent',
  'pmb',
  'rsa',
  'developer',
  'uploader',
  'cooperative',
] as const;
