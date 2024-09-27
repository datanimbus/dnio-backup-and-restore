"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreManager = void 0;
const lib_cli_1 = require("./lib.cli");
const lib_misc_1 = require("./lib.misc");
const manager_api_1 = require("./manager.api");
const lib_db_1 = require("./lib.db");
const lib_parser_ds_1 = require("./lib.parser.ds");
const lib_parser_pipe_1 = require("./lib.parser.pipe");
let logger = global.logger;
let selectedApp = "";
function restoreManager(apps) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, lib_misc_1.header)("Restore configuration");
        if (global.selectedApp)
            selectedApp = global.selectedApp;
        else
            selectedApp = yield (0, lib_cli_1.selectApp)(apps);
        (0, lib_misc_1.printInfo)(`Selected app: ${selectedApp}`);
        (0, lib_misc_1.printInfo)(`Backup file being used - ${global.backupFileName}`);
        (0, lib_db_1.restoreInit)();
        (0, lib_misc_1.printInfo)("Scanning the configurations...");
        // await restoreLibrary();
        // await restoreFunctions();
        yield restoreConnectors();
        yield restoreDataFormats();
        yield restoreDataServices();
        yield restoreAgents();
        yield restorePlugins();
        yield restoreMyNodes();
        yield restoreMapperFormulas();
        yield restoreDataPipes();
        yield restoreGroups();
        (0, lib_misc_1.header)("Restore complete!");
    });
}
exports.restoreManager = restoreManager;
// APP Level APIs
function configExists(api, name, selectedApp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let searchParams = new URLSearchParams();
            searchParams.append("filter", JSON.stringify({ app: selectedApp, name: name }));
            searchParams.append("count", "-1");
            searchParams.append("select", "name");
            logger.debug(`Check for existing config - ${api} ${searchParams}`);
            let data = yield (0, manager_api_1.get)(api, searchParams);
            logger.debug(`Check for existing config result - ${api} : ${JSON.stringify(data)}`);
            if (data.length > 0 && data[0]._id)
                return data[0]._id;
            return null;
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function configExistsWithLabel(api, label, selectedApp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let searchParams = new URLSearchParams();
            searchParams.append("filter", JSON.stringify({ app: selectedApp, label: label }));
            searchParams.append("count", "-1");
            searchParams.append("select", "label");
            logger.debug(`Check for existing config - ${api} ${searchParams}`);
            let data = yield (0, manager_api_1.get)(api, searchParams);
            logger.debug(`Check for existing config result - ${api} : ${JSON.stringify(data)}`);
            if (data.length > 0 && data[0]._id)
                return data[0]._id;
            return null;
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function insert(type, baseURL, selectedApp, backedUpData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let name = backedUpData.name;
            if (!name) {
                name = backedUpData.label;
            }
            logger.info(`${selectedApp} : Insert ${type} : ${name}`);
            let data = JSON.parse(JSON.stringify(backedUpData));
            data.app = selectedApp;
            delete data._id;
            let newData = yield (0, manager_api_1.post)(baseURL, data);
            (0, lib_misc_1.printInfo)(`${type} created : ${name}`);
            logger.info(JSON.stringify(newData));
            return newData;
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function update(type, baseURL, selectedApp, backedUpData, existinID) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let name = backedUpData.name;
            if (!name) {
                name = backedUpData.label;
            }
            logger.info(`${selectedApp} : Update ${type} : ${name}`);
            let data = JSON.parse(JSON.stringify(backedUpData));
            data.app = selectedApp;
            data._id = existinID;
            delete data.status;
            let updateURL = `${baseURL}/${existinID}`;
            let newData = yield (0, manager_api_1.put)(updateURL, data);
            (0, lib_misc_1.printInfo)(`${type} updated : ${name}`);
            logger.info(JSON.stringify(newData));
            return newData;
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
// App level restores
// async function restoreLibrary() {
// 	try {
// 		let libraries = read("libraries");
// 		if (libraries.length < 1) return;
// 		header("Library");
// 		printInfo(`Libraries to restore - ${libraries.length}`);
// 		let BASE_URL = `/api/a/sm/${selectedApp}/globalSchema`;
// 		await libraries.reduce(async (prev: any, library: any) => {
// 			await prev;
// 			delete library.services;
// 			let existingID = await configExists(BASE_URL, library.name, selectedApp);
// 			let newData = null;
// 			if (existingID) newData = await update("Library", BASE_URL, selectedApp, library, existingID);
// 			else newData = await insert("Library", BASE_URL, selectedApp, library);
// 			restoreMapper("libraries", library._id, newData._id);
// 		}, Promise.resolve());
// 	} catch (e: any) {
// 		logger.error(e.message);
// 	}
// }
// async function restoreFunctions() {
// 	try {
// 		let functions = read("functions");
// 		if (functions.length < 1) return;
// 		header("Functions");
// 		printInfo(`Functions to restore - ${functions.length}`);
// 		let BASE_URL = `/api/a/bm/${selectedApp}/faas`;
// 		await functions.reduce(async (prev: any, fn: any) => {
// 			await prev;
// 			delete fn._metadata;
// 			delete fn.__v;
// 			delete fn.version;
// 			delete fn.lastInvoked;
// 			let existingID = await configExists(BASE_URL, fn.name, selectedApp);
// 			let newData = null;
// 			if (existingID) newData = await update("Function", BASE_URL, selectedApp, fn, existingID);
// 			else {
// 				newData = await insert("Function", BASE_URL, selectedApp, fn);
// 				newData = await update("Function", BASE_URL, selectedApp, fn, newData._id);
// 			}
// 			restoreMapper("functions", fn._id, newData._id);
// 			restoreMapper("functionURL", newData._id, newData.url);
// 		}, Promise.resolve());
// 	} catch (e: any) {
// 		logger.error(e.message);
// 	}
// }
function restoreConnectors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let connectors = (0, lib_db_1.read)("connectors");
            if (connectors.length < 1)
                return;
            (0, lib_misc_1.header)("Connectors");
            (0, lib_misc_1.printInfo)(`Connectors to restore - ${connectors.length}`);
            let BASE_URL = `/api/a/bm/${selectedApp}/connector`;
            let searchParams = new URLSearchParams();
            searchParams.append("filter", JSON.stringify({ app: selectedApp }));
            searchParams.append("select", "name, options");
            searchParams.append("sort", "_id");
            let defaultConnectors = yield (0, manager_api_1.get)(BASE_URL, searchParams);
            logger.debug(`Default connectors - ${JSON.stringify(defaultConnectors)}`);
            let defaultConnectorsMap = {};
            defaultConnectors.filter((connector) => connector.options.default)
                .forEach((connector) => defaultConnectorsMap[connector.name] = connector._id);
            logger.debug(`Default connectors map - ${JSON.stringify(defaultConnectorsMap)}`);
            yield connectors.reduce((prev, connector) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (defaultConnectorsMap[connector.name]) {
                    (0, lib_db_1.restoreMapper)("connectors", connector._id, defaultConnectorsMap[connector.name]._id);
                    logger.debug(`Connector ${connector.name} already exists`);
                    return;
                }
                delete connector._metadata;
                delete connector.__v;
                delete connector.version;
                let existingID = yield configExists(BASE_URL, connector.name, selectedApp);
                let newData = null;
                if (existingID) {
                    newData = yield update("Connector", BASE_URL, selectedApp, connector, existingID);
                }
                else
                    newData = yield insert("Connector", BASE_URL, selectedApp, connector);
                (0, lib_db_1.restoreMapper)("connectors", connector._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreDataServices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let dataservices = (0, lib_db_1.read)("dataservices");
            if (dataservices.length < 1)
                return;
            (0, lib_misc_1.header)("Dataservice");
            (0, lib_misc_1.printInfo)(`Dataservices to restore - ${dataservices.length}`);
            var BASE_URL = `/api/a/sm/${selectedApp}/service`;
            // Find which data services exists and which doesn't
            let newDataServices = [];
            yield dataservices.reduce((prev, dataservice) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                let existingID = yield configExists(BASE_URL, dataservice.name, selectedApp);
                if (existingID)
                    return (0, lib_db_1.restoreMapper)("dataservices", dataservice._id, existingID);
                newDataServices.push(dataservice._id);
            }), Promise.resolve());
            // Create new data services
            logger.info(`New dataservices - ${newDataServices.join(", ")}`);
            (0, lib_misc_1.printInfo)(`New dataservices to be created - ${newDataServices.length}`);
            yield dataservices.reduce((prev, dataservice) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (newDataServices.indexOf(dataservice._id) == -1)
                    return;
                let newDS = (0, lib_parser_ds_1.generateSampleDataSerivce)(dataservice.name, selectedApp);
                let newData = yield insert("Dataservice", BASE_URL, selectedApp, newDS);
                return (0, lib_db_1.restoreMapper)("dataservices", dataservice._id, newData._id);
            }), Promise.resolve());
            dataservices = (0, lib_parser_ds_1.parseAndFixDataServices)(dataservices);
            let dataserviceMap = (0, lib_db_1.readRestoreMap)("dataservices");
            yield dataservices.reduce((prev, dataservice) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                dataservice.status = "Undeployed";
                if (newDataServices.indexOf(dataservice._id) != -1)
                    dataservice.status = "Draft";
                return yield update("Dataservice", BASE_URL, selectedApp, dataservice, dataserviceMap[dataservice._id]);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreDataFormats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let dataformats = (0, lib_db_1.read)("dataformats");
            if (dataformats.length < 1)
                return;
            (0, lib_misc_1.header)("Dataformat");
            (0, lib_misc_1.printInfo)(`Dataformats to restore - ${dataformats.length}`);
            let BASE_URL = `/api/a/bm/${selectedApp}/dataFormat`;
            yield dataformats.reduce((prev, dataformat) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete dataformat._metadata;
                delete dataformat.__v;
                delete dataformat.version;
                let existingID = yield configExists(BASE_URL, dataformat.name, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("Dataformat", BASE_URL, selectedApp, dataformat, existingID);
                else
                    newData = yield insert("Dataformat", BASE_URL, selectedApp, dataformat);
                (0, lib_db_1.restoreMapper)("dataformats", dataformat._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreAgents() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let agents = (0, lib_db_1.read)("agents");
            let agentIDs = (0, lib_db_1.readBackupMap)("agentIDs");
            if (agents.length < 1)
                return;
            (0, lib_misc_1.header)("Agent");
            (0, lib_misc_1.printInfo)(`Agents to restore - ${agents.length}`);
            let BASE_URL = `/api/a/bm/${selectedApp}/agent`;
            yield agents.reduce((prev, agent) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete agent._metadata;
                delete agent.__v;
                delete agent.version;
                delete agent.agentId;
                let existingID = yield configExists(BASE_URL, agent.name, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("Agent", BASE_URL, selectedApp, agent, existingID);
                else
                    newData = yield insert("Agent", BASE_URL, selectedApp, agent);
                (0, lib_db_1.restoreMapper)("agents", agent._id, newData._id);
                (0, lib_db_1.restoreMapper)("agentIDs", agentIDs[agent._id], newData.agentId);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restorePlugins() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let plugins = (0, lib_db_1.read)("plugins");
            if (plugins.length < 1)
                return;
            (0, lib_misc_1.header)("Plugins");
            (0, lib_misc_1.printInfo)(`Plugins to restore - ${plugins.length}`);
            let BASE_URL = `/api/a/bm/${selectedApp}/plugin`;
            yield plugins.reduce((prev, plugin) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete plugin._metadata;
                delete plugin.__v;
                delete plugin.version;
                let existingID = yield configExists(BASE_URL, plugin.name, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("Plugin", BASE_URL, selectedApp, plugin, existingID);
                else
                    newData = yield insert("Plugin", BASE_URL, selectedApp, plugin);
                (0, lib_db_1.restoreMapper)("plugins", plugin._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreMyNodes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let myNodes = (0, lib_db_1.read)("myNodes");
            if (myNodes.length < 1)
                return;
            (0, lib_misc_1.header)("My Nodes");
            (0, lib_misc_1.printInfo)(`My Nodes to restore - ${myNodes.length}`);
            let BASE_URL = `/api/a/bm/${selectedApp}/my-node`;
            yield myNodes.reduce((prev, myNode) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete myNode._metadata;
                delete myNode.__v;
                delete myNode.version;
                let existingID = yield configExistsWithLabel(BASE_URL, myNode.label, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("MyNode", BASE_URL, selectedApp, myNode, existingID);
                else
                    newData = yield insert("MyNode", BASE_URL, selectedApp, myNode);
                (0, lib_db_1.restoreMapper)("myNodes", myNode._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreMapperFormulas() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let mapperFormulas = (0, lib_db_1.read)("mapperformulas");
            if (mapperFormulas.length < 1)
                return;
            (0, lib_misc_1.header)("Formulas");
            (0, lib_misc_1.printInfo)(`Formulas to restore - ${mapperFormulas.length}`);
            let BASE_URL = `/api/a/rbac/${selectedApp}/formula`;
            yield mapperFormulas.reduce((prev, mapperFormula) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete mapperFormula._metadata;
                delete mapperFormula.__v;
                delete mapperFormula.version;
                let existingID = yield configExists(BASE_URL, mapperFormula.name, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("Formula", BASE_URL, selectedApp, mapperFormula, existingID);
                else
                    newData = yield insert("Formula", BASE_URL, selectedApp, mapperFormula);
                (0, lib_db_1.restoreMapper)("mapperFormulas", mapperFormula._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreDataPipes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let datapipes = (0, lib_db_1.read)("datapipes");
            if (datapipes.length < 1)
                return;
            (0, lib_misc_1.header)("Data pipe");
            (0, lib_misc_1.printInfo)(`Data pipes to restore - ${datapipes.length}`);
            const BASE_URL = `/api/a/bm/${selectedApp}/flow`;
            // Find which data pipes exists and which doesn't
            let newDataPipes = [];
            yield datapipes.reduce((prev, dp) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                let existingID = yield configExists(BASE_URL, dp.name, selectedApp);
                if (existingID)
                    return (0, lib_db_1.restoreMapper)("datapipes", dp._id, existingID);
                newDataPipes.push(dp._id);
            }), Promise.resolve());
            // Create new data pipes
            logger.info(`New data pipes - ${newDataPipes.join(", ")}`);
            (0, lib_misc_1.printInfo)(`New data pipes to be created - ${newDataPipes.length}`);
            yield datapipes.reduce((prev, dp) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (newDataPipes.indexOf(dp._id) == -1)
                    return;
                let newDP = (0, lib_parser_pipe_1.generateSampleDataPipe)(dp.name, selectedApp);
                let newData = yield insert("Data pipe", BASE_URL, selectedApp, newDP);
                return (0, lib_db_1.restoreMapper)("datapipes", dp._id, newData._id);
            }), Promise.resolve());
            datapipes = (0, lib_parser_pipe_1.parseAndFixDataPipes)(datapipes);
            let datapipeMap = (0, lib_db_1.readRestoreMap)("datapipes");
            yield datapipes.reduce((prev, datapipe) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                delete datapipe._metadata;
                delete datapipe.__v;
                delete datapipe.version;
                delete datapipe.lastInvoked;
                datapipe.status = "Stopped";
                datapipe = (0, lib_parser_pipe_1.parseDataPipeAndFixAppName)(datapipe, selectedApp);
                if (newDataPipes.indexOf(datapipe._id) != -1)
                    datapipe.status = "Draft";
                return yield update("Data pipe", BASE_URL, selectedApp, datapipe, datapipeMap[datapipe._id]);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function restoreGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let groups = (0, lib_db_1.read)("groups");
            if (groups.length < 1)
                return;
            (0, lib_misc_1.header)("Group");
            (0, lib_misc_1.printInfo)(`Groups to restore - ${groups.length}`);
            let BASE_URL = `/api/a/rbac/${selectedApp}/group`;
            let dataServiceIDMap = (0, lib_db_1.readRestoreMap)("dataservices");
            let dataPipesIDMap = (0, lib_db_1.readRestoreMap)("datapipes");
            yield groups.reduce((prev, group) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                group.roles.forEach((role) => {
                    role.app = selectedApp;
                    if (dataServiceIDMap[role.entity])
                        role.entity = dataServiceIDMap[role.entity];
                    if (dataPipesIDMap[role.entity]) {
                        role.id = `INTR_${dataPipesIDMap[role.entity]}`;
                        role.entity = dataPipesIDMap[role.entity];
                    }
                    if (role._id == "ADMIN_role.entity")
                        role._id = `ADMIN_${dataServiceIDMap[role.entity]}`;
                });
                let existingID = yield configExists(BASE_URL, group.name, selectedApp);
                let newData = null;
                if (existingID)
                    newData = yield update("Group", BASE_URL, selectedApp, group, existingID);
                else
                    newData = yield insert("Group", BASE_URL, selectedApp, group);
                (0, lib_db_1.restoreMapper)("group", group._id, newData._id);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
