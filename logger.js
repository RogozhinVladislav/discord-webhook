const winston = require('winston');

module.exports = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: 'error.json', level: 'error' }),
        new winston.transports.File({ filename: 'combined.json' }),
    ],
});