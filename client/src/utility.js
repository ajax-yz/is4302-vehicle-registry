export class Utility {
  static isAuthorized(role, allowedRoles) {
    return allowedRoles.indexOf(role) != -1;
  }
}
