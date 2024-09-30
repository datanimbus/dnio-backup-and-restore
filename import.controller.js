const fs = require('fs');
const log4js = require('log4js');
const router = require('express').Router({ mergeParams: true });
const _ = require('lodash');

const mongoService = require('./mongo-service');
const { collectionMap, updateReferenceId, extractCounter, getMinifiedData } = require('./utils');

const logger = log4js.getLogger('import.controller');

router.get('/status', async (req, res) => {
    res.json(req.session.statusList);
});

router.post('/upload', async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (req.file.mimetype !== 'application/json') {
            return res.status(400).json({ message: 'Invalid file type' });
        }
        req.session.file = req.file;
        const content = fs.readFileSync(req.file.path, 'utf8');
        const jsonData = JSON.parse(content);
        const payload = {};
        payload.datapipes = jsonData.data.datapipes.map((item) => getMinifiedData(item));
        payload.dataservices = jsonData.data.dataservices.map((item) => getMinifiedData(item));
        payload.dataformats = jsonData.data.dataformats.map((item) => getMinifiedData(item));
        payload.connectors = jsonData.data.connectors.map((item) => getMinifiedData(item));
        payload.agents = jsonData.data.agents.map((item) => getMinifiedData(item));
        payload.formulas = jsonData.data.mapperformulas.map((item) => getMinifiedData(item));
        payload.plugins = jsonData.data.myNodes.map((item) => getMinifiedData(item, true));
        res.json({ message: 'File uploaded successfully', payload });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/start/express', async (req, res) => {
    try {
        const app = req.body.app;
        const content = fs.readFileSync(req.session.file.path, 'utf8');
        const jsonData = JSON.parse(content);
        await importData(req, app, jsonData.data);
        res.json({ message: 'Import data completed' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/start/custom', async (req, res) => {
    try {
        const app = req.body.app;
        const selectedData = req.body.data;
        const content = fs.readFileSync(req.session.file.path, 'utf8');
        const jsonData = JSON.parse(content);
        const payload = {};
        Object.keys(collectionMap).forEach((collection) => {
            const jsonKey = collectionMap[collection].jsonKey;
            if (selectedData[jsonKey]) {
                payload[jsonKey] = jsonData.data[jsonKey].filter((item) => selectedData[jsonKey].find((e) => e._id === item._id));
            } else {
                payload[jsonKey] = jsonData.data[jsonKey];
            }
        });
        await importData(req, app, payload);
        res.json({ message: 'Import data completed' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

async function importData(req, app, jsonData) {
    req.session.idMap = {};
    req.session.statusList = [];
    logger.info('Importing data...');
    const collections = Object.keys(collectionMap);
    await collections.reduce(async (acc, collection) => {
        await acc;
        const jsonKey = collectionMap[collection].jsonKey;
        const filterKey = collectionMap[collection].filterKey;
        const label = collectionMap[collection].label;
        if (!jsonData[jsonKey] || jsonData[jsonKey].length === 0) {
            req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
            req.session.statusList.push({ timestamp: Date.now(), message: `No ${label} to import.` });
            req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
            return Promise.resolve();
        }
        logger.info(`Importing ${label}...`);
        req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
        req.session.statusList.push({ timestamp: Date.now(), message: `Importing ${label}...` });
        req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
        req.session.statusList.push({ timestamp: Date.now(), message: `${jsonData[jsonKey].length} ${label} to import.` });
        req.session.idMap[collection] = [];
        jsonData[jsonKey].sort((a, b) => {
            const counterA = extractCounter(a._id);
            const counterB = extractCounter(b._id);
            return counterB - counterA;
        });
        await jsonData[jsonKey].reduce(async (acc, item) => {
            await acc;
            await upsertData(req, collection, item, app, filterKey);
        }, Promise.resolve());
        req.session.statusList.push({ timestamp: Date.now(), message: `Import ${label} completed.` });
        logger.info(`Import ${label} completed.`);
        return Promise.resolve();
    }, Promise.resolve());
    req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
    req.session.statusList.push({ timestamp: Date.now(), message: `Import data completed` });
    req.session.statusList.push({ timestamp: Date.now(), message: `**************************************************` });
    logger.info('Import data completed');
}

async function upsertData(req, collection, data, app, key = 'name') {
    const existing = await mongoService.mongoFindOne(collection, { [key]: data[key], app });
    if (existing) {
        req.session.idMap[collection].push({
            oldId: data._id,
            newId: existing._id
        });
        req.session.idMap[collection] = _.uniqBy(req.session.idMap[collection], 'oldId');
        data._id = existing._id;
        data = updateReferenceId(data, req.session.idMap);
        req.session.statusList.push({ timestamp: Date.now(), message: `Updating ${data[key]}...` });
        // await mongoService.mongoUpdate(collection, data);
    } else {
        req.session.statusList.push({ timestamp: Date.now(), message: `Inserting ${data[key]}...` });
        // await mongoService.mongoInsert(collection, data);
    }
}

module.exports = router;