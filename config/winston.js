const fs =  require('fs');
const winston =  require('winston');
require('winston-daily-rotate-file');
require('date-utils');
const logDir = __dirname + '/../logs'

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

const debugTransport = new winston.transports.DailyRotateFile({
    filename: 'system.log',
    dirname: logDir
})

// 콘솔 출력
const consolTransport = new winston.transports.Console();

const logger = winston.createLogger({
    level: 'debug',
    transports: [debugTransport, consolTransport]
})

const stream = {
    write: message => {
        logger.info(message)
    }
}

module.exports = { logger, stream }