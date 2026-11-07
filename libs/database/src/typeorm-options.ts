import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CustomNamingStrategy } from '../../../domains/pmb/src/common/helpers/CustomNamingStrategy';

export function buildTypeOrmOptions(
  config: ConfigService,
  connectionName: string,
  entities: Function[],
): TypeOrmModuleOptions {
  const host = config.get<string>('DB_HOST', '127.0.0.1');
  const isLocal = host === '127.0.0.1' || host === 'localhost';

  return {
    name: connectionName,
    type: 'mysql',
    host,
    port: config.get<number>('DB_PORT', 3306),
    username: config.get<string>('DB_USERNAME', 'root'),
    password: config.get<string>('DB_PASSWORD', ''),
    database: config.get<string>('DB_NAME', 'qshelter-dev'),
    entities,
    synchronize:
      config.get('TYPEORM_SYNCHRONIZE') === 'true' ||
      (isLocal && config.get('NODE_ENV') !== 'production'),
    namingStrategy: new CustomNamingStrategy(),
    logging: config.get('TYPEORM_LOGGING') === 'true',
  };
}
