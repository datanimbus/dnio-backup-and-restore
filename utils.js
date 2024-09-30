const _ = require('lodash');


const collectionMap = {
    'metadata.mapper.formulas': {
        label: 'Formulas',
        jsonKey: 'mapperformulas',
        filterKey: 'name'
    },
    'b2b.my-nodes': {
        label: 'Plugins',
        jsonKey: 'myNodes',
        filterKey: 'label'
    },
    'config.connectors': {
        label: 'Connectors',
        jsonKey: 'connectors',
        filterKey: 'name'
    },
    'b2b.agents': {
        label: 'Agents',
        jsonKey: 'agents',
        filterKey: 'name'
    },
    'services': {
        label: 'Data Services',
        jsonKey: 'dataservices',
        filterKey: 'name'
    },
    'b2b.dataFormats': {
        label: 'Data Formats',
        jsonKey: 'dataformats',
        filterKey: 'name'
    },
    'b2b.flows': {
        label: 'Data Pipes',
        jsonKey: 'datapipes',
        filterKey: 'name'
    }
};


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
            if (flowJSON.inputNode?.options?.nodeId) {
                nodeIds.push(flowJSON.inputNode.options.nodeId);
            }
            flowJSON.nodes.forEach((node) => {
                if (node.options?.nodeId) {
                    nodeIds.push(node.options.nodeId);
                }
            });
        });
    } else {
        if (flowJSONList.inputNode?.options?.nodeId) {
            nodeIds.push(flowJSONList.inputNode.options.nodeId);
        }
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

function updateReferenceId(data, idMap) {
    let jsonString = JSON.stringify(data);
    const keys = Object.keys(idMap);
    keys.forEach((key) => {
        const mapList = idMap[key];
        mapList.forEach((item) => {
            jsonString = jsonString.replace(new RegExp(item.oldId, 'g'), item.newId);
        });
    });
    return JSON.parse(jsonString);
}

function extractCounter(id) {
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
}

function getMinifiedData(data, useLabel = false) {
    if (useLabel) {
        return { _id: data._id, label: data.label };
    }
    return { _id: data._id, name: data.name };
}

module.exports = {
    collectionMap,
    collectAllDataFormatIds,
    collectAllDataServiceIds,
    collectAllConnectorIds,
    collectAllAgentIds,
    collectAllPluginIds,
    collectAllFlowIds,
    updateReferenceId,
    extractCounter,
    getMinifiedData
};