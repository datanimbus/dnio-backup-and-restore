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
exports.backupManager = exports.backupFromCsvManager = void 0;
const lib_cli_1 = require("./lib.cli");
const lib_misc_1 = require("./lib.misc");
const manager_api_1 = require("./manager.api");
const lib_db_1 = require("./lib.db");
const lib_parser_ds_1 = require("./lib.parser.ds");
const lib_parser_pipe_1 = require("./lib.parser.pipe");
const lib_dependencyMatrix_1 = require("./lib.dependencyMatrix");
let logger = global.logger;
let selectedApp = "";
function getURLParamsForCount() {
    let searchParams = new URLSearchParams();
    searchParams.append("filter", JSON.stringify({ app: selectedApp }));
    return searchParams;
}
function getURLParamsForData(count) {
    let searchParams = new URLSearchParams();
    searchParams.append("filter", JSON.stringify({ app: selectedApp }));
    searchParams.append("count", count.toString());
    searchParams.append("select", "-_metadata,-allowedFileTypes,-port,-__v,-users");
    searchParams.append("sort", "_id");
    return searchParams;
}
function backupFromCsvManager(configs) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, lib_misc_1.header)("Backup configurations");
        const apps = Object.keys(configs);
        for (let i = 0; i < apps.length; i++) {
            const app = apps[i];
            selectedApp = app;
            global.selectedApp = app;
            global.backupFileName = `${app}-${global.originalBackupFileName}`;
            (0, lib_db_1.backupInit)();
            (0, lib_misc_1.printInfo)(`Selected app: ${global.selectedApp}`);
            (0, lib_misc_1.printInfo)("Scanning the configurations within the app...");
            yield fetchLibraries();
            // await fetchFunctions();
            yield fetchConnectors();
            yield fetchDataFormats();
            yield fetchAgents();
            yield fetchPlugins();
            yield fetchMyNodes();
            yield fetchMapperFormulas();
            yield fetchGroups();
            yield fetchDataServices();
            yield fetchDataPipes();
            (0, lib_dependencyMatrix_1.recalculateDependencyMatrix)();
            yield customiseBackup(configs[app]);
        }
        (0, lib_misc_1.header)("Backup complete!");
    });
}
exports.backupFromCsvManager = backupFromCsvManager;
function backupManager(apps) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, lib_misc_1.header)("Backup configurations");
        if (global.selectedApp)
            selectedApp = global.selectedApp;
        else
            selectedApp = yield (0, lib_cli_1.selectApp)(apps);
        (0, lib_db_1.backupInit)();
        (0, lib_misc_1.printInfo)(`Selected app: ${selectedApp}`);
        (0, lib_misc_1.printInfo)("Scanning the configurations within the app...");
        yield fetchLibraries();
        // await fetchFunctions();
        yield fetchConnectors();
        yield fetchDataFormats();
        yield fetchAgents();
        yield fetchPlugins();
        yield fetchMyNodes();
        yield fetchMapperFormulas();
        yield fetchGroups();
        yield fetchDataServices();
        yield fetchDataPipes();
        (0, lib_dependencyMatrix_1.recalculateDependencyMatrix)();
        yield customiseBackup();
        (0, lib_misc_1.header)("Backup complete!");
    });
}
exports.backupManager = backupManager;
function fetchDataServices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var URL_COUNT = `/api/a/sm/${selectedApp}/service/utils/count`;
            var URL_DATA = `/api/a/sm/${selectedApp}/service`;
            const dataservicesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let dataservices = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataservicesCount));
            (0, lib_db_1.save)("dataservices", dataservices);
            dataservices.forEach((ds) => {
                (0, lib_db_1.backupMapper)("dataservices", ds._id, ds.name);
                (0, lib_db_1.backupMapper)("dataservices_lookup", ds.name, ds._id);
            });
            (0, lib_db_1.backupDependencyMatrixOfDataService)((0, lib_parser_ds_1.buildDependencyMatrixForDataServices)(dataservices));
            (0, lib_misc_1.printDone)("Data services", dataservicesCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchLibraries() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var URL_COUNT = `/api/a/sm/${selectedApp}/globalSchema/utils/count`;
            var URL_DATA = `/api/a/sm/${selectedApp}/globalSchema`;
            const librariesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let libraries = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(librariesCount));
            (0, lib_db_1.save)("libraries", libraries);
            libraries.forEach((library) => {
                library.services = [];
                (0, lib_db_1.backupMapper)("libraries", library._id, library.name);
                (0, lib_db_1.backupMapper)("libraries_lookup", library.name, library._id);
            });
            (0, lib_misc_1.printDone)("Libraries", librariesCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
// async function fetchFunctions() {
// 	try {
// 		let URL_COUNT = `/api/a/bm/${selectedApp}/faas/utils/count`;
// 		let URL_DATA = `/api/a/bm/${selectedApp}/faas`;
// 		let functionsCount = await get(URL_COUNT, getURLParamsForCount());
// 		let functions = await get(URL_DATA, getURLParamsForData(functionsCount));
// 		save("functions", functions);
// 		functions.forEach((fn: any) => {
// 			fn.services = [];
// 			backupMapper("functions", fn._id, fn.name);
// 			backupMapper("functions_lookup", fn.name, fn._id);
// 		});
// 		printDone("Functions", functionsCount);
// 	} catch (e: any) {
// 		logger.error(e.message);
// 	}
// }
function fetchConnectors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/rbac/${selectedApp}/connector`;
            const URL_COUNT = `/api/a/rbac/${selectedApp}/connector/utils/count`;
            const connectorsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const connectors = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(connectorsCount));
            (0, lib_db_1.save)("connectors", connectors);
            connectors.forEach((connector) => {
                (0, lib_db_1.backupMapper)("connectors", connector._id, connector.name);
                (0, lib_db_1.backupMapper)("connectors_lookup", connector.name, connector._id);
            });
            (0, lib_misc_1.printDone)("Connectors", connectorsCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchDataFormats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/bm/${selectedApp}/dataFormat`;
            let searchParams = getURLParamsForCount();
            searchParams.append("countOnly", "true");
            const dataFormatsCount = yield (0, manager_api_1.get)(URL_DATA, searchParams);
            const dataFormats = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataFormatsCount));
            (0, lib_db_1.save)("dataformats", dataFormats);
            dataFormats.forEach((dataFormat) => {
                (0, lib_db_1.backupMapper)("dataformats", dataFormat._id, dataFormat.name);
                (0, lib_db_1.backupMapper)("dataformats_lookup", dataFormat.name, dataFormat._id);
            });
            (0, lib_misc_1.printDone)("Data Formats", dataFormatsCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchAgents() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/bm/${selectedApp}/agent`;
            const URL_COUNT = `/api/a/bm/${selectedApp}/agent/utils/count`;
            const agentsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const agents = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(agentsCount));
            (0, lib_db_1.save)("agents", agents);
            agents.forEach((agent) => {
                (0, lib_db_1.backupMapper)("agents", agent._id, agent.name);
                (0, lib_db_1.backupMapper)("agents_lookup", agent.name, agent._id);
                (0, lib_db_1.backupMapper)("agentIDs", agent._id, agent.agentId);
            });
            (0, lib_misc_1.printDone)("Agents", agentsCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchPlugins() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/bm/${selectedApp}/plugin`;
            let searchParams = getURLParamsForCount();
            searchParams.append("countOnly", "true");
            const pluginCount = yield (0, manager_api_1.get)(URL_DATA, searchParams);
            const plugins = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(pluginCount));
            (0, lib_db_1.save)("plugins", plugins);
            plugins.forEach((plugin) => {
                (0, lib_db_1.backupMapper)("plugins", plugin._id, plugin.name);
                (0, lib_db_1.backupMapper)("plugins_lookup", plugin.name, plugin._id);
            });
            (0, lib_misc_1.printDone)("Plugins", pluginCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchMyNodes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/bm/${selectedApp}/my-node`;
            let searchParams = getURLParamsForCount();
            searchParams.append("countOnly", "true");
            const myNodeCount = yield (0, manager_api_1.get)(URL_DATA, searchParams);
            const myNodes = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(myNodeCount));
            (0, lib_db_1.save)("myNodes", myNodes);
            myNodes.forEach((myNode) => {
                (0, lib_db_1.backupMapper)("myNodes", myNode._id, myNode.label);
                (0, lib_db_1.backupMapper)("myNodes_lookup", myNode.label, myNode._id);
            });
            (0, lib_misc_1.printDone)("MyNodes", myNodeCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchMapperFormulas() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/rbac/${selectedApp}/formula`;
            let searchParams = getURLParamsForCount();
            searchParams.append("countOnly", "true");
            // TODO: DS-867
            // let mapperFormulaCount = await get(URL_DATA, searchParams);
            // mapperFormulaCount = mapperFormulaCount.length;
            const mapperFormulas = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(1000));
            (0, lib_db_1.save)("mapperformulas", mapperFormulas);
            mapperFormulas.forEach((mf) => {
                (0, lib_db_1.backupMapper)("mapperformulas", mf._id, mf.name);
                (0, lib_db_1.backupMapper)("mapperformulas_lookup", mf.name, mf._id);
            });
            (0, lib_misc_1.printDone)("Formulas", mapperFormulas.length);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchDataPipes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const URL_DATA = `/api/a/bm/${selectedApp}/flow`;
            const URL_COUNT = `/api/a/bm/${selectedApp}/flow/utils/count`;
            const dataPipesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const dataPipes = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataPipesCount));
            (0, lib_db_1.save)("datapipes", dataPipes);
            dataPipes.forEach((dataPipe) => {
                (0, lib_db_1.backupMapper)("datapipes", dataPipe._id, dataPipe.name);
                (0, lib_db_1.backupMapper)("datapipes_lookup", dataPipe.name, dataPipe._id);
            });
            (0, lib_db_1.backupDependencyMatrixOfDataPipe)((0, lib_parser_pipe_1.buildDependencyMatrixForDataPipe)(dataPipes));
            (0, lib_misc_1.printDone)("Data Pipes", dataPipesCount);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function fetchGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let URL_COUNT = `/api/a/rbac/${selectedApp}/group/count`;
            let URL_DATA = `/api/a/rbac/${selectedApp}/group`;
            const groupsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let groups = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(groupsCount));
            groups = groups.filter((group) => group.name != "#");
            (0, lib_db_1.save)("groups", groups);
            groups.forEach((group) => {
                (0, lib_db_1.backupMapper)("groups", group._id, group.name);
                (0, lib_db_1.backupMapper)("groups_lookup", group.name, group._id);
            });
            (0, lib_misc_1.printDone)("Groups", groups.length);
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function customiseBackup(backupConfigs) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!backupConfigs) {
            let customisationRequired = yield (0, lib_cli_1.customise)();
            if (!customisationRequired) {
                (0, lib_misc_1.printInfo)("No backup customizations done.");
                return;
            }
            (0, lib_misc_1.header)("Customizing the backup");
        }
        let dataservicesLookup = (0, lib_db_1.readBackupMap)("dataservices_lookup");
        let selectedDataservices = [];
        if (backupConfigs) {
            selectedDataservices = backupConfigs.service || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Data Services", Object.keys(dataservicesLookup).sort())).forEach((ds) => selectedDataservices.push(dataservicesLookup[ds]));
        }
        let datapipesLookup = (0, lib_db_1.readBackupMap)("datapipes_lookup");
        let selectedDataPipes = [];
        if (backupConfigs) {
            selectedDataPipes = backupConfigs.pipe || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Data Pipes", Object.keys(datapipesLookup).sort())).forEach((datapipe) => selectedDataPipes.push(datapipesLookup[datapipe]));
        }
        let librariesLookup = (0, lib_db_1.readBackupMap)("libraries_lookup");
        let selectedLibraries = [];
        if (backupConfigs) {
            selectedLibraries = backupConfigs.library || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Libraries", Object.keys(librariesLookup).sort())).forEach((lib) => selectedLibraries.push(librariesLookup[lib]));
        }
        let functionsLookup = (0, lib_db_1.readBackupMap)("functions_lookup");
        let selectedFunctions = [];
        if (backupConfigs) {
            selectedFunctions = backupConfigs.function || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Functions", Object.keys(functionsLookup).sort())).forEach((fn) => selectedFunctions.push(functionsLookup[fn]));
        }
        let connectorsLookup = (0, lib_db_1.readBackupMap)("connectors_lookup");
        let selectedConnectors = [];
        if (backupConfigs) {
            selectedConnectors = backupConfigs.connector || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Connectors", Object.keys(connectorsLookup).sort())).forEach((connector) => selectedConnectors.push(connectorsLookup[connector]));
        }
        let dataformatsLookup = (0, lib_db_1.readBackupMap)("dataformats_lookup");
        let selectedDataFormats = [];
        if (backupConfigs) {
            selectedDataFormats = backupConfigs.format || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Data Formats", Object.keys(dataformatsLookup).sort())).forEach((dataformat) => selectedDataFormats.push(dataformatsLookup[dataformat]));
        }
        let agentsLookup = (0, lib_db_1.readBackupMap)("agents_lookup");
        let selectedAgents = [];
        if (backupConfigs) {
            selectedAgents = backupConfigs.agent || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Agents", Object.keys(agentsLookup).sort())).forEach((agent) => selectedAgents.push(agentsLookup[agent]));
        }
        let pluginsLookup = (0, lib_db_1.readBackupMap)("plugins_lookup");
        let selectedPlugins = [];
        if (backupConfigs) {
            selectedPlugins = backupConfigs.plugin || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Plugins", Object.keys(pluginsLookup).sort())).forEach((plugin) => selectedPlugins.push(pluginsLookup[plugin]));
        }
        let mapperformulasLookup = (0, lib_db_1.readBackupMap)("mapperformulas_lookup");
        let selectedMapperFormulas = [];
        if (backupConfigs) {
            selectedMapperFormulas = backupConfigs.formula || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("Formulas", Object.keys(mapperformulasLookup).sort())).forEach((mf) => selectedMapperFormulas.push(mapperformulasLookup[mf]));
        }
        let groupsLookup = (0, lib_db_1.readBackupMap)("groups_lookup");
        let selectedGroups = [];
        if (backupConfigs) {
            selectedGroups = backupConfigs.group || [];
        }
        else {
            (yield (0, lib_cli_1.selections)("groups", Object.keys(groupsLookup).sort())).forEach((group) => selectedGroups.push(groupsLookup[group]));
        }
        logger.info(`Dataservices : ${selectedDataservices.join(", ") || "Nil"}`);
        logger.info(`Libraries : ${selectedLibraries.join(", ") || "Nil"}`);
        logger.info(`Functions : ${selectedFunctions.join(", ") || "Nil"}`);
        logger.info(`Connectors : ${selectedConnectors.join(", ") || "Nil"}`);
        logger.info(`Data Formats : ${selectedDataFormats.join(", ") || "Nil"}`);
        logger.info(`Agents : ${selectedAgents.join(", ") || "Nil"}`);
        logger.info(`Plugins : ${selectedPlugins.join(", ") || "Nil"}`);
        logger.info(`Mapper Formulas : ${selectedMapperFormulas.join(", ") || "Nil"}`);
        logger.info(`Data Pipes : ${selectedDataPipes.join(", ") || "Nil"}`);
        logger.info(`Groups : ${selectedGroups.join(", ") || "Nil"}`);
        let superSetOfDataservices = selectedDataservices;
        let dependencyMatrixOfDataPipe = (0, lib_db_1.readDependencyMatrixOfDataPipes)();
        selectedDataPipes.forEach((dataPipeID) => {
            dependencyMatrixOfDataPipe[dataPipeID].dataservices.forEach((dataservice) => {
                if (superSetOfDataservices.indexOf(dataservice) == -1)
                    superSetOfDataservices.push(dataservice);
            });
            dependencyMatrixOfDataPipe[dataPipeID].dataformats.forEach((dataformat) => {
                if (selectedLibraries.indexOf(dataformat) == -1)
                    selectedDataFormats.push(dataformat);
            });
            dependencyMatrixOfDataPipe[dataPipeID].functions.forEach((fn) => {
                if (selectedFunctions.indexOf(fn) == -1)
                    selectedFunctions.push(fn);
            });
            dependencyMatrixOfDataPipe[dataPipeID].agents.forEach((agent) => {
                if (selectedAgents.indexOf(agent) == -1)
                    selectedAgents.push(agent);
            });
            dependencyMatrixOfDataPipe[dataPipeID].connectors.forEach((connector) => {
                if (selectedConnectors.indexOf(connector) == -1)
                    selectedConnectors.push(connector);
            });
            dependencyMatrixOfDataPipe[dataPipeID].plugins.forEach((plugin) => {
                if (selectedPlugins.indexOf(plugin) == -1)
                    selectedPlugins.push(plugin);
            });
            dependencyMatrixOfDataPipe[dataPipeID].mapperformulas.forEach((mf) => {
                if (selectedMapperFormulas.indexOf(mf) == -1)
                    selectedMapperFormulas.push(mf);
            });
            dependencyMatrixOfDataPipe[dataPipeID].datapipes.forEach((dp) => {
                if (selectedDataPipes.indexOf(dp) == -1)
                    selectedDataPipes.push(dp);
            });
        });
        let dependencyMatrixOfDataService = (0, lib_db_1.readDependencyMatrixOfDataServices)();
        selectedDataservices.forEach((dataserviceID) => {
            selectAllRelated(dataserviceID, dependencyMatrixOfDataService)
                .filter(ds => superSetOfDataservices.indexOf(ds) == -1)
                .forEach(ds => superSetOfDataservices.push(ds));
            dependencyMatrixOfDataService[dataserviceID].libraries.forEach((library) => {
                if (selectedLibraries.indexOf(library) == -1)
                    selectedLibraries.push(library);
            });
            dependencyMatrixOfDataService[dataserviceID].functions.forEach((fn) => {
                if (selectedFunctions.indexOf(fn) == -1)
                    selectedFunctions.push(fn);
            });
            dependencyMatrixOfDataService[dataserviceID].connectors.forEach((fn) => {
                if (selectedConnectors.indexOf(fn) == -1)
                    selectedConnectors.push(fn);
            });
        });
        logger.info(`Superset Dataservices : ${superSetOfDataservices.join(", ")}`);
        logger.info(`Superset Libraries : ${selectedLibraries.join(", ")}`);
        logger.info(`Superset Functions : ${selectedFunctions.join(", ")}`);
        logger.info(`Superset Conectors : ${selectedConnectors.join(", ")}`);
        logger.info(`Superset Data Formats : ${selectedDataFormats.join(", ")}`);
        logger.info(`Superset Agents : ${selectedAgents.join(", ")}`);
        logger.info(`Superset Plugins : ${selectedPlugins.join(", ")}`);
        logger.info(`Superset Mapper Formulas : ${selectedMapperFormulas.join(", ")}`);
        logger.info(`Superset Data Pipes : ${selectedDataPipes.join(", ")}`);
        let mapperformulas = (0, lib_db_1.read)("mapperformulas").filter((mapperformula) => selectedMapperFormulas.indexOf(mapperformula._id) != -1);
        let plugins = (0, lib_db_1.read)("plugins").filter((plugin) => selectedPlugins.indexOf(plugin._id) != -1);
        let dataservices = (0, lib_db_1.read)("dataservices").filter((dataservice) => superSetOfDataservices.indexOf(dataservice._id) != -1);
        let libraries = (0, lib_db_1.read)("libraries").filter((library) => selectedLibraries.indexOf(library._id) != -1);
        let functions = (0, lib_db_1.read)("functions").filter((fn) => selectedFunctions.indexOf(fn._id) != -1);
        let connectors = (0, lib_db_1.read)("connectors").filter((connector) => selectedConnectors.indexOf(connector._id) != -1);
        let dataformats = (0, lib_db_1.read)("dataformats").filter((dataformat) => selectedDataFormats.indexOf(dataformat._id) != -1);
        let agents = (0, lib_db_1.read)("agents").filter((agent) => selectedAgents.indexOf(agent._id) != -1);
        let datapipes = (0, lib_db_1.read)("datapipes").filter((datapipe) => selectedDataPipes.indexOf(datapipe._id) != -1);
        let groups = (0, lib_db_1.read)("groups").filter((group) => selectedGroups.indexOf(group._id) != -1);
        (0, lib_db_1.save)("dataservices", dataservices);
        (0, lib_db_1.save)("libraries", libraries);
        (0, lib_db_1.save)("functions", functions);
        (0, lib_db_1.save)("connectors", connectors);
        (0, lib_db_1.save)("dataformats", dataformats);
        (0, lib_db_1.save)("agents", agents);
        (0, lib_db_1.save)("plugins", plugins);
        (0, lib_db_1.save)("mapperformulas", mapperformulas);
        (0, lib_db_1.save)("datapipes", datapipes);
        (0, lib_db_1.save)("groups", groups);
    });
}
function selectAllRelated(dataserviceID, dependencyMatrix) {
    let requiredDS = [];
    dependencyMatrix[dataserviceID].dataservices.forEach((ds) => {
        if (dataserviceID == ds)
            return;
        if (requiredDS.indexOf(ds) == -1) {
            requiredDS.push(ds);
            selectAllRelated(ds, dependencyMatrix)
                .filter(ds => requiredDS.indexOf(ds) == -1)
                .forEach(ds => requiredDS.push(ds));
        }
    });
    return requiredDS;
}
