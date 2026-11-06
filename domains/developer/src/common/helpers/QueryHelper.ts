import { Raw } from 'typeorm';

export default class QueryHelper {

    public static JsonArrayContains(value: string | string[]) {
        return Raw((alias) => `JSON_CONTAINS(${alias}, :value)`, {
            value: JSON.stringify(value),
        });
    }
}
