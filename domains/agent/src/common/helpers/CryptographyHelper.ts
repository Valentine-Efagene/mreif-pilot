import { User } from "../../user/user.entity";

export default class CryptographyHelper {
  public static generateReferralCode(name: string, user: User, limit: number) {
    let _name = name.toLocaleLowerCase()
    _name = name.replace(' ', '')

    if (_name.length > limit) {
      _name = _name.slice(0, limit)
    }

    return `${_name?.toLocaleLowerCase()}${user.id}`
  }
}
