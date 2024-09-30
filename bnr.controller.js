const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const router = require('express').Router({ mergeParams: true });
const moment = require('moment');
const _ = require('lodash');

const mongoService = require('./mongo-service');
const utils = require('./utils');

const logger = log4js.getLogger('bnr.controller');

router.post('/get/dependencies', async (req, res) => {
    try {
        const flowList = req.body;
        const flowDetails = await Promise.all(flowList.map((flow) => {
            return mongoService.mongoFindOne('b2b.flows', { _id: flow._id })
        }));
        const payload = {};
        payload.dataFormatIds = _.uniq(utils.collectAllDataFormatIds(flowDetails));
        payload.dataServiceIds = _.uniq(utils.collectAllDataServiceIds(flowDetails));
        payload.connectorIds = _.uniq(utils.collectAllConnectorIds(flowDetails));
        payload.pluginIds = _.uniq(utils.collectAllPluginIds(flowDetails));
        payload.agentIds = _.uniq(utils.collectAllAgentIds(flowDetails));
        payload.flowIds = _.uniq(utils.collectAllFlowIds(flowDetails));
        res.status(200).json(payload);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/export', async (req, res) => {
    try {
        const selectedData = req.body;
        const downloadFileName = 'backup-' + moment().format('YYYY-MM-DD-HH-mm-ss') + '.json';
        req.session.downloadFileName = downloadFileName;
        const collections = Object.keys(utils.collectionMap);
        const exportData = {};
        await collections.reduce(async (acc, collection) => {
            await acc;
            const jsonKey = utils.collectionMap[collection].jsonKey;
            const data = await Promise.all(selectedData[jsonKey].map(async (item) => {
                return await mongoService.mongoFindOne(collection, { _id: item._id });
            }));
            exportData[jsonKey] = data;
        }, Promise.resolve());
        fs.writeFileSync(path.join(__dirname, 'exports', downloadFileName), JSON.stringify(exportData));
        res.status(200).json({ message: 'Exported successfully' });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/export/download', async (req, res) => {
    const filePath = path.join(__dirname, 'exports', req.session.downloadFileName);
    res.status(200).download(filePath, req.session.downloadFileName);
});

module.exports = router;