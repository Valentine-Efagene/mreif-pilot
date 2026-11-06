import { Role } from '../../user/user.enums';
import RoleCheckerMiddleware from './RoleCheckerMiddleware';

export default class AdminRoleCheckerMiddleware extends RoleCheckerMiddleware {
  protected allowedRoles: Role[] = [Role.ADMIN];
}
