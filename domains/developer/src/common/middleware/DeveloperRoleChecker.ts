import { Role } from '../../user/user.enums';
import RoleCheckerMiddleware from './RoleCheckerMiddleware';

export default class DeveloperRoleCheckerMiddleware extends RoleCheckerMiddleware {
  protected allowedRoles: Role[] = [Role.DEVELOPER, Role.ADMIN];
}
