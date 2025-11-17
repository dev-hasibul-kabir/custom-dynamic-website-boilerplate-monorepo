// Re-export validated environment variables
// The validation happens in env.mjs and will exit if validation fails
import validatedEnv from './env.mjs';
import type { EnvVariables } from '../types/env.js';

const envVariables: EnvVariables = {
  ENV: validatedEnv.NODE_ENV as EnvVariables['ENV'],
  HOST: validatedEnv.HOST,
  PORT: validatedEnv.PORT,
  JWT_SECRET: validatedEnv.JWT_SECRET,
  ATTACHMENT_DIRECTORY: validatedEnv.ATTACHMENT_FOLDER_PATH,
  ATTACHMENT_FOLDER_PATH: validatedEnv.ATTACHMENT_FOLDER_PATH,
  PUBLIC_URL: validatedEnv.PUBLIC_URL,
  LOCAL_URL: validatedEnv.LOCAL_URL,
  LOG_DIR_PATH: validatedEnv.LOG_DIR_PATH,
};

export default envVariables;

