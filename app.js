const log4js = require('log4js');
const express = require('express');
const { MongoClient } = require('mongodb');
const multer = require('multer');
const expressSession = require('express-session');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/datastackConfig';
const CONFIG_DB_NAME = process.env.CONFIG_DB_NAME || 'datastackConfig';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const PORT = process.env.PORT || 9888;
const SESSION_SECRET = process.env.SESSION_SECRET || 'hellodnio';

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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

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
    app.use(expressSession({
        secret: SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: { 
            maxAge: 7200000, // Set session cookie expiration to 2 hours
            httpOnly: true,
            secure: false
        }
    }));
    app.use((req, res, next) => {
        logger.info('Request Recieved [%s] [%s]', req.method, req.originalUrl);
        next();
    });
    app.use('/bnr/api/fetch', require('./fetch.controller.js'));
    app.use('/bnr/api/utils', require('./bnr.controller.js'));
    app.use('/bnr/api/import', upload.single('file'), require('./import.controller.js'));
    app.listen(PORT, function (err) {
        if (err) {
            logger.error(err);
            process.exit(0);
        }
        logger.info('Server is listening on port %s', PORT);
    });
}