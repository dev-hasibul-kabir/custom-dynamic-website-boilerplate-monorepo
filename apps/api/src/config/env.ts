// Environment validation will happen when this module is imported
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV?: NodeEnv = NodeEnv.Development;

  @IsString()
  @IsOptional()
  HOST?: string = '0.0.0.0';

  @IsString()
  @IsOptional()
  PORT?: string = '5002';

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsString()
  @IsOptional()
  REDIS_PORT?: string;

  @IsString()
  @IsOptional()
  MONGO_DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  MONGO_DB_USERNAME?: string;

  @IsString()
  @IsOptional()
  MONGO_DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  MONGO_DB_AUTHSOURCE?: string;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  // Email configuration - Server 1
  @IsString()
  @IsOptional()
  EMAIL_SERVER_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_1?: string;

  // Email configuration - Server 2
  @IsString()
  @IsOptional()
  EMAIL_SERVER_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_2?: string;

  // Email configuration - Server 3
  @IsString()
  @IsOptional()
  EMAIL_SERVER_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_3?: string;
}

function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map(error => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      })
      .join('\n');
    console.error('❌ Environment validation failed:\n', errorMessages);
    process.exit(1);
  }

  return validatedConfig;
}

// Validate and export
const env = validate(process.env);

// Export individual environment variables for easy access
export const nodeEnv = env.NODE_ENV;
export const host = env.HOST;
export const port = env.PORT;
export const databaseUrl = env.DATABASE_URL;
export const jwtSecret = env.JWT_SECRET;
export const redisHost = env.REDIS_HOST;
export const redisPort = env.REDIS_PORT;
export const mongoDatabaseUrl = env.MONGO_DATABASE_URL;
export const mongoDbUsername = env.MONGO_DB_USERNAME;
export const mongoDbPassword = env.MONGO_DB_PASSWORD;
export const mongoDbAuthSource = env.MONGO_DB_AUTHSOURCE;
export const corsOrigins = env.CORS_ORIGINS;

// Email configuration exports
export const emailServer1 = env.EMAIL_SERVER_1;
export const emailPort1 = env.EMAIL_PORT_1;
export const emailUsername1 = env.EMAIL_USERNAME_1;
export const emailPassword1 = env.EMAIL_PASSWORD_1;
export const emailSender1 = env.EMAIL_SENDER_1;

export const emailServer2 = env.EMAIL_SERVER_2;
export const emailPort2 = env.EMAIL_PORT_2;
export const emailUsername2 = env.EMAIL_USERNAME_2;
export const emailPassword2 = env.EMAIL_PASSWORD_2;
export const emailSender2 = env.EMAIL_SENDER_2;

export const emailServer3 = env.EMAIL_SERVER_3;
export const emailPort3 = env.EMAIL_PORT_3;
export const emailUsername3 = env.EMAIL_USERNAME_3;
export const emailPassword3 = env.EMAIL_PASSWORD_3;
export const emailSender3 = env.EMAIL_SENDER_3;

// Export the validate function for use in ConfigModule
export { validate };
