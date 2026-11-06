export default class EnvironmentHelper {
    public static env = {
        developer_dashboard_url: process.env.developer_dashboard_url,
        admin_dashboard_url: process.env.admin_dashboard_url,
        notification_url: process.env.notification_url,
        notification_arn: process.env.notification_arn,
        db_host: process.env.db_host,
        db_name: process.env.db_name,
        db_name_test: process.env.db_name_test,
        db_port: process.env.db_port,
        db_username: process.env.db_username,
        db_password: process.env.db_password,
    }
}