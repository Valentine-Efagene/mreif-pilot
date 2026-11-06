export default class EnvironmentHelper {
    public static env = {
        AGENT_DASHBOARD_URL: process.env.AGENT_DASHBOARD_URL,
        ADMIN_DASHBOARD_URL: process.env.ADMIN_DASHBOARD_URL,
        NOTIFICATION_URL: process.env.NOTIFICATION_URL,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_NAME_TEST: process.env.DB_NAME_TEST,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
    }
}