const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const logDir = '../logs';	

let logger;

// Can't use fs logs since heroku provides a read-only fs
if (process.env.HEROKU_DEPLOY === 'true') {
  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
      ),
    defaultMeta: { service: 'joke-bot' },
    transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
        )
    })
    ]
  });
} else {
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
   fs.mkdirSync(logDir);
  }

  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
      ),
    defaultMeta: { service: 'joke-bot' },
    transports: [
    new transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
    new transports.File({ filename: `${logDir}/combined.log` })
    ]
  });
}

module.exports = logger;



