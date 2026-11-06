export default class UtilHelper {
    public static verifyDomain(domain: string, email: string) {
        const emailDomain = email.split('@')[1];
        return emailDomain === domain;
    }
}
