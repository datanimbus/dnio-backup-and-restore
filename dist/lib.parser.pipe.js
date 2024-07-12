"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndFixDataPipes = exports.parseDataPipeAndFixAppName = exports.buildDependencyMatrixForDataPipe = exports.generateSampleDataPipe = void 0;
const lib_db_1 = require("./lib.db");
function generateSampleDataPipe(name, selectedApp) {
    return {
        "name": name,
        "description": null,
        "type": "API",
        "inputNode": {
            "_id": "api_json_receiver",
            "name": "api_json_receiver",
            "type": "API"
        },
        "app": selectedApp,
        "nodes": []
    };
}
exports.generateSampleDataPipe = generateSampleDataPipe;
function buildDependencyMatrixForDataPipe(datapipes) {
    const mapperformulaIDs = Object.keys((0, lib_db_1.readBackupMap)("mapperformulas"));
    const pluginIDs = Object.keys((0, lib_db_1.readBackupMap)("plugins"));
    const myNodesIDs = Object.keys((0, lib_db_1.readBackupMap)("myNodes"));
    const dataServiceIDs = Object.keys((0, lib_db_1.readBackupMap)("dataservices"));
    const dataformatIDs = Object.keys((0, lib_db_1.readBackupMap)("dataformats"));
    const functionIDs = Object.keys((0, lib_db_1.readBackupMap)("functions"));
    const agentIDs = Object.keys((0, lib_db_1.readBackupMap)("agents"));
    const connectorIDs = Object.keys((0, lib_db_1.readBackupMap)("connectors"));
    const datapipeIDs = Object.keys((0, lib_db_1.readBackupMap)("datapipes"));
    let dependencyMatrix = {};
    datapipes.forEach((datapipe) => {
        const dp = JSON.stringify(datapipe);
        dependencyMatrix[datapipe._id] = {
            myNodes: myNodesIDs.filter((id) => dp.indexOf(id) !== -1),
            plugins: pluginIDs.filter((id) => dp.indexOf(id) !== -1),
            mapperformulas: mapperformulaIDs.filter((id) => dp.indexOf(id) !== -1),
            dataservices: dataServiceIDs.filter((id) => dp.indexOf(id) !== -1),
            dataformats: dataformatIDs.filter((id) => dp.indexOf(id) !== -1),
            functions: functionIDs.filter((id) => dp.indexOf(id) !== -1),
            agents: agentIDs.filter((id) => dp.indexOf(id) !== -1),
            connectors: connectorIDs.filter((id) => dp.indexOf(id) !== -1),
            datapipes: datapipeIDs.filter((id) => dp.indexOf(id) !== -1 && id !== datapipe._id),
            libraries: []
        };
    });
    return dependencyMatrix;
}
exports.buildDependencyMatrixForDataPipe = buildDependencyMatrixForDataPipe;
function parseDataPipeAndFixAppName(input, appName) {
    let output = JSON.parse(JSON.stringify(input));
    output.nodes.forEach((node) => {
        if (node.type === "PLUGIN") {
            node.options.plugin.app = appName;
        }
        if (node.mappings && node.mappings.length > 0) {
            node.mappings.forEach((mapping) => {
                if (mapping.formulaConfig && mapping.formulaConfig.length > 0) {
                    mapping.formulaConfig.forEach((formulaConfig) => {
                        formulaConfig.app = appName;
                    });
                }
            });
        }
    });
    return output;
}
exports.parseDataPipeAndFixAppName = parseDataPipeAndFixAppName;
function parseAndFixDataPipes(datapipes) {
    const plugins = (0, lib_db_1.readRestoreMap)("plugins") || {};
    const myNodes = (0, lib_db_1.readRestoreMap)("myNodes") || {};
    const mapperformulas = (0, lib_db_1.readRestoreMap)("mapperFormulas") || {};
    const functions = (0, lib_db_1.readRestoreMap)("functions") || {};
    const dataservices = (0, lib_db_1.readRestoreMap)("dataservices") || {};
    const datapipeIDs = (0, lib_db_1.readRestoreMap)("datapipes") || {};
    const dataformats = (0, lib_db_1.readRestoreMap)("dataformats") || {};
    const connectors = (0, lib_db_1.readRestoreMap)("connectors") || {};
    const agents = (0, lib_db_1.readRestoreMap)("agents") || {};
    const agentIDsFromBackup = (0, lib_db_1.readBackupMap)("agentIDs");
    const agentIDsFromRestore = (0, lib_db_1.readRestoreMap)("agentIDs") || {};
    const dependencyMatrixOfDataPipe = (0, lib_db_1.readDependencyMatrixOfDataPipes)();
    let fixedDataPipes = [];
    datapipes.forEach((datapipe) => {
        let dp = JSON.stringify(datapipe);
        const dependencyMatrix = dependencyMatrixOfDataPipe[datapipe._id];
        (dependencyMatrix.myNodes || []).forEach((myNodeId) => dp = dp.split(myNodeId).join(myNodes[myNodeId]));
        (dependencyMatrix.plugins || []).forEach((pluginId) => dp = dp.split(pluginId).join(plugins[pluginId]));
        (dependencyMatrix.mapperformulas || []).forEach((mapperformulaId) => dp = dp.split(mapperformulaId).join(mapperformulas[mapperformulaId]));
        (dependencyMatrix.dataservices || []).forEach((dataservicesId) => dp = dp.split(dataservicesId).join(dataservices[dataservicesId]));
        (dependencyMatrix.dataformats || []).forEach((dataformatId) => dp = dp.split(dataformatId).join(dataformats[dataformatId]));
        (dependencyMatrix.functions || []).forEach((functionId) => dp = dp.split(functionId).join(functions[functionId]));
        (dependencyMatrix.datapipes || []).forEach((datapipeID) => dp = dp.split(datapipeID).join(datapipeIDs[datapipeID]));
        (dependencyMatrix.agents || []).forEach((agentId) => {
            dp = dp.split(agentId).join(agents[agentId]);
            let backupAgentId = agentIDsFromBackup[agentId];
            dp = dp.split(backupAgentId).join(agentIDsFromRestore[backupAgentId]);
        });
        (dependencyMatrix.connectors || []).forEach((connectorId) => dp = dp.split(connectorId).join(connectors[connectorId]));
        fixedDataPipes.push(JSON.parse(dp));
    });
    return fixedDataPipes;
}
exports.parseAndFixDataPipes = parseAndFixDataPipes;
