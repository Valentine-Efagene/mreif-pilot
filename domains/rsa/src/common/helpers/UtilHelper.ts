export default class UtilHelper {
    public static verifyDomain(domain: string, email: string) {
        const emailDomain = email.split('@')[1];
        return emailDomain === domain;
    }

    public static toEnum<T>(enumType: T, value: string): T[keyof T] | undefined {
        return (Object.values(enumType) as unknown as string[]).includes(value)
            ? (value as T[keyof T])
            : undefined;
    }
}
