"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndFixDataPipes = exports.buildDependencyMatrixForDataPipe = void 0;
const lib_db_1 = require("./lib.db");
function buildDependencyMatrixForDataPipe(datapipes) {
    const mapperformulaIDs = Object.keys((0, lib_db_1.readBackupMap)("mapperformulas"));
    const pluginIDs = Object.keys((0, lib_db_1.readBackupMap)("plugins"));
    const dataServiceIDs = Object.keys((0, lib_db_1.readBackupMap)("dataservices"));
    const dataformatIDs = Object.keys((0, lib_db_1.readBackupMap)("dataformats"));
    const functionIDs = Object.keys((0, lib_db_1.readBackupMap)("functions"));
    const agentIDs = Object.keys((0, lib_db_1.readBackupMap)("agents"));
    const connectorIDs = Object.keys((0, lib_db_1.readBackupMap)("connectors"));
    let dependencyMatrix = {};
    datapipes.forEach((datapipe) => {
        const dp = JSON.stringify(datapipe);
        dependencyMatrix[datapipe._id] = {
            plugins: [],
            mapperformulas: [],
            dataservices: dataServiceIDs.filter((id) => dp.indexOf(id) !== -1),
            dataformats: dataformatIDs.filter((id) => dp.indexOf(id) !== -1),
            functions: functionIDs.filter((id) => dp.indexOf(id) !== -1),
            agents: agentIDs.filter((id) => dp.indexOf(id) !== -1),
            connectors: connectorIDs.filter((id) => dp.indexOf(id) !== -1)
        };
        if (global.isSuperAdmin) {
            dependencyMatrix[datapipe._id]["plugins"] = pluginIDs.filter((id) => dp.indexOf(id) !== -1);
            dependencyMatrix[datapipe._id]["mapperformulas"] = mapperformulaIDs.filter((id) => dp.indexOf(id) !== -1);
        }
    });
    return dependencyMatrix;
}
exports.buildDependencyMatrixForDataPipe = buildDependencyMatrixForDataPipe;
function parseAndFixDataPipes(datapipes) {
    const plugins = (0, lib_db_1.readRestoreMap)("plugins");
    const mapperformulas = (0, lib_db_1.readRestoreMap)("mapperFormulas");
    const functions = (0, lib_db_1.readRestoreMap)("functions");
    const dataservices = (0, lib_db_1.readRestoreMap)("dataservices");
    const dataformats = (0, lib_db_1.readRestoreMap)("dataformats");
    const agents = (0, lib_db_1.readRestoreMap)("agents");
    const agentIDsFromBackup = (0, lib_db_1.readBackupMap)("agentIDs");
    const agentIDsFromRestore = (0, lib_db_1.readRestoreMap)("agentIDs");
    const dependencyMatrixOfDataPipe = (0, lib_db_1.readDependencyMatrixOfDataPipes)();
    let fixedDataPipes = [];
    datapipes.forEach((datapipe) => {
        let dp = JSON.stringify(datapipe);
        const dependencyMatrix = dependencyMatrixOfDataPipe[datapipe._id];
        dependencyMatrix.plugins.forEach((pluginId) => dp = dp.split(pluginId).join(plugins[pluginId]));
        dependencyMatrix.mapperformulas.forEach((mapperformulaId) => dp = dp.split(mapperformulaId).join(mapperformulas[mapperformulaId]));
        dependencyMatrix.dataservices.forEach((dataservicesId) => dp = dp.split(dataservicesId).join(dataservices[dataservicesId]));
        dependencyMatrix.dataformats.forEach((dataformatId) => dp = dp.split(dataformatId).join(dataformats[dataformatId]));
        dependencyMatrix.functions.forEach((functionId) => dp = dp.split(functionId).join(functions[functionId]));
        dependencyMatrix.agents.forEach((agentId) => {
            dp = dp.split(agentId).join(agents[agentId]);
            let backupAgentId = agentIDsFromBackup[agentId];
            dp = dp.split(backupAgentId).join(agentIDsFromRestore[backupAgentId]);
        });
        dependencyMatrix.connectors.forEach((connectorId) => dp = dp.split(connectorId).join(functions[connectorId]));
        fixedDataPipes.push(JSON.parse(dp));
    });
    return fixedDataPipes;
}
exports.parseAndFixDataPipes = parseAndFixDataPipes;
