import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@qshelter/nest-auth';
import { isLocalAuthEnforcement } from './auth-enforcement';
import { MofiAuthorizerGuard } from './mofi-authorizer.guard';

function buildAuthProviders(): Provider[] {
  if (!isLocalAuthEnforcement()) {
    return [MofiAuthorizerGuard];
  }
  return [
    MofiAuthorizerGuard,
    {
      provide: APP_GUARD,
      useClass: MofiAuthorizerGuard,
    },
  ];
}

@Global()
@Module({})
export class MofiAuthModule {
  static forRoot(): DynamicModule {
    return {
      module: MofiAuthModule,
      imports: [AuthModule],
      providers: buildAuthProviders(),
      exports: [AuthModule, MofiAuthorizerGuard],
    };
  }
}
