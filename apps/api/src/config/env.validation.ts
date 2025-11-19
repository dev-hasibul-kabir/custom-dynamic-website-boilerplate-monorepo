import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, validateSync } from 'class-validator';

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
}

export function validate(config: Record<string, unknown>) {
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
