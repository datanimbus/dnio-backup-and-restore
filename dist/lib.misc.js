"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCliParams = exports.printDone = exports.printError = exports.printInfo = exports.isNotAnAcceptableValue = exports.stringComparison = exports.header = void 0;
let logger = global.logger;
function header(_s) {
    let totalWidth = 32;
    let fitLength = _s.length;
    if (_s.length % 2 != 0) {
        fitLength += 1;
        _s += " ";
    }
    let sideWidth = (totalWidth - fitLength) / 2;
    let middle = "";
    let i = 0;
    while (i < fitLength) {
        middle += "─";
        i++;
    }
    let liner = "";
    let spacer = "";
    i = 0;
    while (i < sideWidth) {
        liner += "─";
        spacer += " ";
        i++;
    }
    let top = "┌" + liner + middle + liner + "┐";
    let bottom = "└" + liner + middle + liner + "┘";
    let center = "│" + spacer + _s + spacer + "│";
    printInfo(top);
    printInfo(center);
    printInfo(bottom);
}
exports.header = header;
function stringComparison(a, b) {
    let nameA = a.toUpperCase();
    let nameB = b.toUpperCase();
    if (nameA < nameB)
        return -1;
    if (nameA > nameB)
        return 1;
    return 0;
}
exports.stringComparison = stringComparison;
function isNotAnAcceptableValue(i) {
    if (typeof i == "object")
        return true;
    if (i == null)
        return true;
    return false;
}
exports.isNotAnAcceptableValue = isNotAnAcceptableValue;
function printInfo(message) {
    logger.info(message);
    console.log(message);
}
exports.printInfo = printInfo;
function printError(message) {
    logger.error(message);
    console.error(`ERR: ${message}`);
}
exports.printError = printError;
function printDone(_msg, _count) {
    console.log(`  ${padCount(_count)} ${_msg}`);
    logger.info(`${_msg} -> ${_count}`);
}
exports.printDone = printDone;
function padCount(_d) {
    if (_d > 99)
        return ` ${_d} `;
    if (_d > 9)
        return `  ${_d} `;
    return `   ${_d} `;
}
function parseCliParams(options, timestamp) {
    // ENV VAR > CLI PARAM > RUNTIME
    global.backupFileName = `backup-${timestamp}.json`;
    if (options.backupfile)
        global.backupFileName = options.backupfile;
    global.backupFileName = process.env.DS_BR_BACKUPFILE ? process.env.DS_BR_BACKUPFILE : global.backupFileName;
    global.restoreFileName = `restore-${timestamp}.json`;
    global.selectedApp = process.env.DS_BR_APP ? process.env.DS_BR_APP : options.app;
    if (process.env.DS_BR_SINGLELOGFILE) {
        global.backupFileName = "backup.json";
        global.restoreFileName = "restore.json";
    }
    if (options.host)
        process.env.DS_BR_HOST = options.host;
    if (options.username)
        process.env.DS_BR_USERNAME = options.username;
    if (options.password)
        process.env.DS_BR_PASSWORD = options.password;
}
exports.parseCliParams = parseCliParams;
