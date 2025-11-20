export interface EnvVariables {
  ENV: 'development' | 'production' | 'test';
  HOST?: string;
  PORT?: number;
  JWT_SECRET: string;
  ATTACHMENT_FOLDER_PATH: string;
  PUBLIC_URL: string;
  LOCAL_URL: string;
  LOG_DIR_PATH: string;
}

