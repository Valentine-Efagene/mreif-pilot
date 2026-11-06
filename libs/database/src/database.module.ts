import { Global, Module } from '@nestjs/common';
import { normalizeMofiEnv } from './normalize-env';

normalizeMofiEnv();

/** Env normalization only — each domain registers its own TypeORM connection. */
@Global()
@Module({})
export class DatabaseModule {}
