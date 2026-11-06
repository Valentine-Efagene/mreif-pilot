export default class TypeHelper {
    public static toEnum<T>(enumType: T, value: string): T[keyof T] | undefined {
        return (Object.values(enumType) as unknown as string[]).includes(value)
            ? (value as T[keyof T])
            : undefined;
    }
}
