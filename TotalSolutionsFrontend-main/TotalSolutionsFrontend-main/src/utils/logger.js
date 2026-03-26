// Frontend Logger
const logger = {
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data);
  },
  info: (message, data) => {
    console.info(`[INFO] ${message}`, data);
  },
  debug: (message, data) => {
    console.debug(`[DEBUG] ${message}`, data);
  }
};

export default logger;
