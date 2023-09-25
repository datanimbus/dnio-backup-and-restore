"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readRestoreMap = exports.readDependencyMatrixOfDataPipes = exports.readDependencyMatrixOfDataServices = exports.readBackupMap = exports.read = exports.restoreMapper = exports.backupDependencyMatrixOfDataPipe = exports.backupDependencyMatrixOfDataService = exports.backupMapper = exports.save = exports.restoreInit = exports.backupInit = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const lib_misc_1 = require("./lib.misc");
let logger = global.logger;
let sampleBackupData = {
    "version": `${global.version}`,
    "host": "",
    "map": {
        "mapperformulas": {},
        "mapperformulas_lookup": {},
        "plugins": {},
        "plugins_lookup": {},
        "npmlibraries": {},
        "npmlibraries_lookup": {},
        "dataservices": {},
        "dataservices_lookup": {},
        "libraries": {},
        "libraries_lookup": {},
        "functions": {},
        "functions_lookup": {},
        "connectors": {},
        "connectors_lookup": {},
        "dataformats": {},
        "dataformats_lookup": {},
        "agents": {},
        "agents_lookup": {},
        "agentIDs": {},
        "datapipes": {},
        "datapipes_lookup": {},
        "groups": {},
        "groups_lookup": {}
    },
    "data": {
        "mapperformulas": [],
        "plugins": [],
        "npmlibraries": [],
        "dataservices": [],
        "libraries": [],
        "functions": [],
        "connectors": [],
        "dataformats": [],
        "agents": [],
        "datapipes": [],
        "groups": []
    },
    "dependencyMatrixOfDataServices": {},
    "dependencyMatrixOfDataPipes": {}
};
function backupInit() {
    (0, lib_misc_1.printInfo)(`Backup file - ${global.backupFileName}`);
    sampleBackupData.host = global.host;
    writeJSON(global.backupFileName, JSON.stringify(sampleBackupData));
}
exports.backupInit = backupInit;
function restoreInit() {
    logger.debug(`Restore file - ${global.restoreFileName}`);
    if (!(0, fs_1.existsSync)(global.backupFileName)) {
        (0, lib_misc_1.printError)(`Backup file ${global.backupFileName} doesn't exist!`);
    }
    writeJSON(global.restoreFileName, `{"version":"${global.version}", "host":"${global.host}"}`);
}
exports.restoreInit = restoreInit;
function save(key, data) {
    let backupData = readJSON(global.backupFileName);
    backupData.data[key] = data;
    writeJSON(global.backupFileName, backupData);
}
exports.save = save;
function backupMapper(token, key, value) {
    let backupData = readJSON(global.backupFileName);
    if (!backupData.map[token])
        backupData.map[token] = {};
    backupData.map[token][key] = value;
    writeJSON(global.backupFileName, backupData);
    logger.trace(`Updated ${global.backupFileName} : ${token} : ${key} : ${value}`);
}
exports.backupMapper = backupMapper;
function backupDependencyMatrixOfDataService(data) {
    let backupData = readJSON(global.backupFileName);
    if (!backupData.dependencyMatrixOfDataService)
        backupData["dependencyMatrixOfDataServices"] = {};
    backupData.dependencyMatrixOfDataServices = data;
    writeJSON(global.backupFileName, backupData);
    logger.trace(`Updated ${global.backupFileName} : dependencyMatrixOfDataServices`);
}
exports.backupDependencyMatrixOfDataService = backupDependencyMatrixOfDataService;
function backupDependencyMatrixOfDataPipe(data) {
    let backupData = readJSON(global.backupFileName);
    if (!backupData.dependencyMatrixOfDataPipe)
        backupData["dependencyMatrixOfDataPipes"] = {};
    backupData.dependencyMatrixOfDataPipes = data;
    writeJSON(global.backupFileName, backupData);
    logger.trace(`Updated ${global.backupFileName} : dependencyMatrixOfDataPipes`);
}
exports.backupDependencyMatrixOfDataPipe = backupDependencyMatrixOfDataPipe;
function restoreMapper(token, key, value) {
    let restoreMapData = readJSON(global.restoreFileName);
    if (!restoreMapData[token])
        restoreMapData[token] = {};
    restoreMapData[token][key] = value;
    writeJSON(global.restoreFileName, restoreMapData);
    logger.trace(`Updated ${global.restoreFileName} : ${token} : ${key} : ${value}`);
}
exports.restoreMapper = restoreMapper;
function read(key) {
    let backupData = readJSON(global.backupFileName);
    return backupData.data[key];
}
exports.read = read;
function readBackupMap(token) {
    let backupData = readJSON(global.backupFileName);
    return backupData.map[token];
}
exports.readBackupMap = readBackupMap;
function readDependencyMatrixOfDataServices() {
    let backupData = readJSON(global.backupFileName);
    return backupData.dependencyMatrixOfDataServices;
}
exports.readDependencyMatrixOfDataServices = readDependencyMatrixOfDataServices;
function readDependencyMatrixOfDataPipes() {
    let backupData = readJSON(global.backupFileName);
    return backupData.dependencyMatrixOfDataPipes;
}
exports.readDependencyMatrixOfDataPipes = readDependencyMatrixOfDataPipes;
function readRestoreMap(token) {
    let restoreMapData = readJSON(global.restoreFileName);
    return restoreMapData[token];
}
exports.readRestoreMap = readRestoreMap;
function readJSON(filename) {
    const filePath = (0, path_1.join)(process.cwd(), filename);
    return JSON.parse((0, fs_1.readFileSync)(filePath).toString());
}
function writeJSON(filename, data) {
    if (typeof data == "object") {
        data = JSON.stringify(data);
    }
    const filePath = (0, path_1.join)(process.cwd(), filename);
    (0, fs_1.writeFileSync)(filePath, data);
}
