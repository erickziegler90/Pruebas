const { createLogger, transports, format } = require('winston');
const logger = createLogger({
    format: format.combine(format.timestamp(), format.printf((info) => {
        return `${info.timestamp} - [${info.level.toUpperCase().padEnd(7)}] - ${info.message}`
    })),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'app.log' })
    ]
})

module.exports = logger;