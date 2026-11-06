import { IMySqlError } from "../common.type";

export default class ExceptionHelper {
    public static isMySqlError(exception: any): exception is IMySqlError {
        if (exception.code) {
            return true
        }

        return false
    }
}
