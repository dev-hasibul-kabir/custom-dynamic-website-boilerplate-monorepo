import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
// System modules
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './config/env';
import { DbModule } from './db/db.module';
import { UtilityModule } from './util/utility.module';

// Application modules
import { AuthorizationModule } from '@/common/authorization/authorization.module';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { FolderModule } from './modules/folder/folder.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_DATABASE_HOST'),
          port: config.get('REDIS_DATABASE_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_DATABASE_URL'),
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        user: configService.get('MONGO_DATABASE_USERNAME'),
        pass: configService.get('MONGO_DATABASE_PASSWORD'),
        authSource: configService.get('MONGO_DATABASE_AUTHSOURCE'),
        connectionFactory: (connection: unknown) => {
          if (connection && typeof connection === 'object' && 'on' in connection) {
            (connection as { on: (event: string, callback: () => void) => void }).on(
              'connected',
              () => {
                console.debug('MongoDB successfully connected!');
              },
            );
          }

          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    DbModule,
    UtilityModule,
    AuthorizationModule,
    HealthModule,
    AuthModule,
    UserModule,
    FolderModule,
  ],
  providers: [TransformInterceptor],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
