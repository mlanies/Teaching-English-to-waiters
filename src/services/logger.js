// Система логирования

export class Logger {
  constructor(env) {
    this.env = env;
  }

  info(message, data = {}) {
    this.log('INFO', message, data);
  }

  error(message, error = null, data = {}) {
    this.log('ERROR', message, { ...data, error: error?.message, stack: error?.stack });
  }

  warn(message, data = {}) {
    this.log('WARN', message, data);
  }

  debug(message, data = {}) {
    if (this.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data);
    }
  }

  private log(level, message, data) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    console.log(`[${timestamp}] ${level}: ${message}`, data);
    
    // В будущем можно добавить отправку в внешние системы логирования
    // await this.env.LOGS.put(`log:${timestamp}`, JSON.stringify(logEntry));
  }
}

export function createLogger(env) {
  return new Logger(env);
}
