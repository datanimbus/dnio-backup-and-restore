const log4js = require('log4js');
const router = require('express').Router({ mergeParams: true });
const _ = require('lodash');

const logger = log4js.getLogger('bnr.controller');

router.post('/get/dependencies', async (req, res) => {
    const flowList = req.body;
    const payload = {};
    payload.dataFormatIds = _.uniq(collectAllDataFormatIds(flowList));
    payload.dataServiceIds = _.uniq(collectAllDataServiceIds(flowList));
    payload.connectorIds = _.uniq(collectAllConnectorIds(flowList));
    payload.pluginIds = _.uniq(collectAllPluginIds(flowList));
    payload.agentIds = _.uniq(collectAllAgentIds(flowList));
    payload.flowIds = _.uniq(collectAllFlowIds(flowList));
    // flowList.forEach((flowJSON) => {
    //     payload.dataFormatIds = _.uniq(payload.dataFormatIds.concat(collectAllDataFormatIds(flowJSON)));
    //     payload.dataServiceIds = _.uniq(payload.dataServiceIds.concat(collectAllDataServiceIds(flowJSON)));
    //     payload.connectorIds = _.uniq(payload.connectorIds.concat(collectAllConnectorIds(flowJSON)));
    //     payload.nodeIds = _.uniq(payload.nodeIds.concat(collectAllNodeIds(flowJSON)));
    //     payload.agentIds = _.uniq(payload.agentIds.concat(collectAllAgentIds(flowJSON)));
    //     payload.flowIds = _.uniq(payload.flowIds.concat(collectAllFlowIds(flowJSON)));
    // });
    res.status(200).json(payload);
});

module.exports = router;

function collectAllDataFormatIds(flowJSONList) {
    let matches = JSON.stringify(flowJSONList).match(/(DF[0-9]{4,})/g);
    if (matches && matches.length > 0) {
        return _.uniq(matches);
    }
    return [];
}

function collectAllDataServiceIds(flowJSONList) {
    let matches = JSON.stringify(flowJSONList).match(/(SRVC[0-9]{4,})/g);
    if (matches && matches.length > 0) {
        return _.uniq(matches);
    }
    return [];
}

function collectAllConnectorIds(flowJSONList) {
    let matches = JSON.stringify(flowJSONList).match(/(CON[0-9]{4,})/g);
    if (matches && matches.length > 0) {
        return _.uniq(matches);
    }
    return [];
}

function collectAllAgentIds(flowJSONList) {
    let matches = JSON.stringify(flowJSONList).match(/(AGENT[0-9]{4,})/g);
    if (matches && matches.length > 0) {
        return _.uniq(matches);
    }
    return [];
}

function collectAllPluginIds(flowJSONList) {
    const nodeIds = [];
    if (Array.isArray(flowJSONList)) {
        flowJSONList.forEach((flowJSON) => {
            nodeIds.push(flowJSON.inputNode.options.nodeId);
            flowJSON.nodes.forEach((node) => {
                nodeIds.push(node.options.nodeId);
            });
        });
    } else {
        if (flowJSONList.inputNode?.options?.nodeId) {
            nodeIds.push(flowJSONList.inputNode.options.nodeId);
        }
        logger.debug('Flow JSON list: ', flowJSONList)
        flowJSONList?.nodes?.forEach((node) => {
            if (node.options?.nodeId) {
                nodeIds.push(node.options?.nodeId);
            }
        });
    }
    return _.uniq(nodeIds);
}

function collectAllFlowIds(flowJSONList) {
    let matches = JSON.stringify(flowJSONList).match(/(FLOW[0-9]{4,})/g);
    if (matches && matches.length > 0) {
        return _.uniq(matches);
    }
    return [];
}