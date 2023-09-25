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
exports.clearAllManager = void 0;
const lib_cli_1 = require("./lib.cli");
const lib_misc_1 = require("./lib.misc");
const manager_api_1 = require("./manager.api");
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
    searchParams.append("select", "name,options");
    searchParams.append("sort", "-_id");
    return searchParams;
}
function clearAllManager(apps) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, lib_misc_1.header)("Clear all configurations");
        if (global.selectedApp)
            selectedApp = global.selectedApp;
        else
            selectedApp = yield (0, lib_cli_1.selectApp)(apps);
        (0, lib_misc_1.printInfo)(`Selected app: ${selectedApp}`);
        (0, lib_misc_1.printInfo)("Scanning the configurations within the app...");
        yield clearGroups();
        yield clearDataPipes();
        yield clearAgents();
        yield clearDataFormats();
        yield clearDataServices();
        yield clearConnectors();
        yield clearFunctions();
        yield clearLibrary();
        (0, lib_misc_1.header)("Cleanup complete!");
    });
}
exports.clearAllManager = clearAllManager;
function clearGroups() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Group");
            let URL_COUNT = `/api/a/rbac/${selectedApp}/group/count`;
            let URL_DATA = `/api/a/rbac/${selectedApp}/group`;
            const groupsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const groups = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(groupsCount));
            (0, lib_misc_1.printInfo)(`${groups.length - 1} Group(s) found.`);
            yield groups.reduce((p, group) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                if (group.name == "#")
                    return Promise.resolve();
                (0, lib_misc_1.printInfo)(`  * [X] ${group._id} ${group.name}`);
                let GROUP_URL = `${URL_DATA}/${group._id}`;
                yield (0, manager_api_1.del)(GROUP_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearDataPipes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Data pipe");
            const URL_DATA = `/api/a/bm/${selectedApp}/flow`;
            const URL_COUNT = `/api/a/bm/${selectedApp}/flow/utils/count`;
            const dataPipesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const dataPipes = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataPipesCount));
            (0, lib_misc_1.printInfo)(`${dataPipes.length} Data pipe(s) found.`);
            yield dataPipes.reduce((p, dataPipe) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${dataPipe._id} ${dataPipe.name}`);
                let DP_URL = `${URL_DATA}/${dataPipe._id}`;
                yield (0, manager_api_1.del)(DP_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearAgents() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Agent");
            const URL_DATA = `/api/a/bm/${selectedApp}/agent`;
            const URL_COUNT = `/api/a/bm/${selectedApp}/agent/utils/count`;
            const agentsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const agents = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(agentsCount));
            (0, lib_misc_1.printInfo)(`${agents.length} Agent(s) found.`);
            yield agents.reduce((p, agent) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${agent._id} ${agent.name}`);
                let AGENT_URL = `${URL_DATA}/${agent._id}`;
                yield (0, manager_api_1.del)(AGENT_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearDataFormats() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Data format");
            const URL_DATA = `/api/a/bm/${selectedApp}/dataFormat`;
            const URL_COUNT = `/api/a/bm/${selectedApp}/dataFormat`;
            let searchParams = getURLParamsForCount();
            searchParams.append("countOnly", "true");
            const dataFormatsCount = yield (0, manager_api_1.get)(URL_COUNT, searchParams);
            const dataFormats = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataFormatsCount));
            (0, lib_misc_1.printInfo)(`${dataFormats.length} Data format(s) found.`);
            yield dataFormats.reduce((p, dataFormat) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${dataFormat._id} ${dataFormat.name}`);
                let DF_URL = `${URL_DATA}/${dataFormat._id}`;
                yield (0, manager_api_1.del)(DF_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearDataServices() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Dataservice");
            var URL_COUNT = `/api/a/sm/${selectedApp}/service/utils/count`;
            var URL_DATA = `/api/a/sm/${selectedApp}/service`;
            const dataservicesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let dataservices = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(dataservicesCount));
            (0, lib_misc_1.printInfo)(`${dataservices.length} Dataservice(s) found.`);
            yield dataservices.reduce((p, dataservice) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${dataservice._id} ${dataservice.name}`);
                let DS_URL = `${URL_DATA}/${dataservice._id}`;
                yield (0, manager_api_1.del)(DS_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearConnectors() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Connector");
            const URL_DATA = `/api/a/rbac/${selectedApp}/connector`;
            const URL_COUNT = `/api/a/rbac/${selectedApp}/connector/utils/count`;
            const connectorsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            const connectors = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(connectorsCount));
            (0, lib_misc_1.printInfo)(`${connectors.length} Connector(s) found.`);
            yield connectors.reduce((p, connector) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                if (connector.options.default)
                    return Promise.resolve();
                (0, lib_misc_1.printInfo)(`  * [X] ${connector._id} ${connector.name}`);
                let DF_URL = `${URL_DATA}/${connector._id}`;
                yield (0, manager_api_1.del)(DF_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearLibrary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Library");
            var URL_COUNT = `/api/a/sm/${selectedApp}/globalSchema/utils/count`;
            var URL_DATA = `/api/a/sm/${selectedApp}/globalSchema`;
            const librariesCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let libraries = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(librariesCount));
            (0, lib_misc_1.printInfo)(`${libraries.length} Library(-ies) found.`);
            yield libraries.reduce((p, library) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${library._id} ${library.name}`);
                let LIB_URL = `${URL_DATA}/${library._id}`;
                yield (0, manager_api_1.del)(LIB_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
function clearFunctions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            (0, lib_misc_1.header)("Function");
            let URL_COUNT = `/api/a/bm/${selectedApp}/faas/utils/count`;
            let URL_DATA = `/api/a/bm/${selectedApp}/faas`;
            let functionsCount = yield (0, manager_api_1.get)(URL_COUNT, getURLParamsForCount());
            let functions = yield (0, manager_api_1.get)(URL_DATA, getURLParamsForData(functionsCount));
            (0, lib_misc_1.printInfo)(`${functions.length} Function(s) found.`);
            yield functions.reduce((p, fn) => __awaiter(this, void 0, void 0, function* () {
                yield p;
                (0, lib_misc_1.printInfo)(`  * [X] ${fn._id} ${fn.name}`);
                let FN_URL = `${URL_DATA}/${fn._id}`;
                yield (0, manager_api_1.del)(FN_URL);
            }), Promise.resolve());
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
