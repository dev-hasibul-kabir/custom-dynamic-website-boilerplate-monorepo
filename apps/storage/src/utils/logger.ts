import { errorLogger, debugLogger, infoLogger } from '../config/winston.js';
import envVariables from './env.js';
import constants from './constants.js';

interface Logger {
  debug: (tag: string, data?: unknown) => void;
  info: (tag: string, data?: unknown) => void;
  error: (tag: string, error: unknown) => void;
}

const logger: Logger = {
  debug: (tag: string, data?: unknown) => {
    if (envVariables.ENV === constants.DEV || envVariables.ENV === constants.STAG) {
      debugLogger.debug(tag, { tag, data });
    }
  },

  info: (tag: string, data?: unknown) => {
    infoLogger.info(tag, { tag, data });
  },

  error: (tag: string, error: unknown) => {
    if (error instanceof Error) {
      errorLogger.error(error.message, { tag, data: { ...error } });
    } else {
      errorLogger.error(tag, { tag, data: error });
    }
  },
};

export default logger;
