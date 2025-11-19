import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
// System modules
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbModule } from './db/db.module';
import { UtilityModule } from './util/utility.module';
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from './config/env.validation';

// Application modules
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { FolderModule } from './modules/folder/folder.module';
import { HealthModule } from './modules/health/health.module';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { AuthorizationModule } from '@/common/authorization/authorization.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_DATABASE_URL'),
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
        user: configService.get('MONGO_DB_USERNAME'),
        pass: configService.get('MONGO_DB_PASSWORD'),
        authSource: configService.get('MONGO_DB_AUTHSOURCE'),
        connectionFactory: connection => {
          connection.on('connected', () => {
            console.debug('MongoDB successfully connected!');
          });

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
