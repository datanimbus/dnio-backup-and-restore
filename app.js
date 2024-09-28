const log4js = require('log4js');
const express = require('express');
const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/datastackConfig';
const CONFIG_DB_NAME = process.env.CONFIG_DB_NAME || 'datastackConfig';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const PORT = process.env.PORT || 9888;

log4js.configure({
    appenders: {
        file: { type: 'file', filename: 'logs/app.log' },
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: ['file', 'console'], level: LOG_LEVEL }
    }
})

const app = express();
const logger = log4js.getLogger('bnr');

(async () => {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        const db = client.db(CONFIG_DB_NAME);
        global.configDB = db;
        logger.info(`Connected to ${CONFIG_DB_NAME} database.`);
        startServer();
    } catch (err) {
        logger.error(err);
    }
})();

function startServer() {
    app.use('/bnr/ui', express.static('public'));
    app.use(express.static('public'));
    app.use(express.json({ limit: '100mb' }));
    app.use((req, res, next) => {
        logger.info('Request Recieved [%s] [%s]', req.method, req.originalUrl);
        next();
    });
    app.use('/bnr/api/fetch', require('./fetch.controller.js'));
    app.use('/bnr/api/utils', require('./bnr.controller.js'));
    app.listen(PORT, function (err) {
        if (err) {
            logger.error(err);
            process.exit(0);
        }
        logger.info('Server is listening on port %s', PORT);
    });
}