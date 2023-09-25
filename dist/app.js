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
const log4js_1 = require("log4js");
"log4js";
const commander_1 = require("commander");
const version = require("../package.json").version;
global.version = version;
let timestamp = (new Date()).toISOString().replace(/:/gi, "-");
let fileName = `dsBR_${global.version.split(".").join("_")}_${timestamp}.log`;
if (process.env.DS_BR_SINGLELOGFILE)
    fileName = "out.log";
(0, log4js_1.configure)({
    appenders: {
        fileOut: {
            type: "file",
            filename: fileName,
            maxLogSize: 500000,
            layout: {
                type: "basic"
            }
        }
    },
    categories: {
        default: {
            appenders: ["fileOut"],
            level: "error"
        }
    }
});
let logger = (0, log4js_1.getLogger)(`[${global.version}]`);
logger.level = process.env.LOGLEVEL ? process.env.LOGLEVEL : "info";
global.logger = logger;
const lib_misc_1 = require("./lib.misc");
const lib_cli_1 = require("./lib.cli");
const manager_api_1 = require("./manager.api");
const manager_backup_1 = require("./manager.backup");
const manager_restore_1 = require("./manager.restore");
const manager_clearAll_1 = require("./manager.clearAll");
const program = new commander_1.Command();
program
    .name("ds-backup-restore")
    .description("CLI utility to backup and restore data.stack configurations.")
    .version(version)
    .addHelpCommand(false)
    .option("-h, --host <URL>", "data.stack server to connect.")
    .option("-u, --username <username>", "data.stack username.")
    .option("-p, --password <password>", "data.stack password.")
    .option("-a, --app <app name>", "data.stack app name to backup or restore.")
    .option("-b, --backupfile <backup JSON file>", "Custom backup file to use during backup or restore")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, lib_misc_1.parseCliParams)(program.opts(), timestamp);
        (0, lib_misc_1.header)(` data.stack Backup and Restore Utility ${version} `);
        let dsConfig = yield (0, lib_cli_1.validateCLIParams)();
        yield (0, manager_api_1.login)(dsConfig);
        let apps = [];
        if (!global.selectedApp)
            apps = yield (0, manager_api_1.getApps)();
        const selection = yield (0, lib_cli_1.startMenu)();
        global.logger.info(`Selected mode :: ${selection.mode}`);
        if (selection.mode == "Backup")
            yield (0, manager_backup_1.backupManager)(apps);
        if (selection.mode == "Restore")
            yield (0, manager_restore_1.restoreManager)(apps);
        if (selection.mode == "Clear All")
            yield (0, manager_clearAll_1.clearAllManager)(apps);
        // Logout cleanly
        (0, manager_api_1.logout)();
    }
    catch (e) {
        logger.error(e.message);
        process.exit(1);
    }
}));
program.command("backup")
    .description("backup configuration.")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, lib_misc_1.parseCliParams)(program.opts(), timestamp);
        (0, lib_misc_1.header)(`data.stack Backup and Restore Utility ${version}`);
        let dsConfig = yield (0, lib_cli_1.validateCLIParams)();
        yield (0, manager_api_1.login)(dsConfig);
        let apps = [];
        if (!global.selectedApp)
            apps = yield (0, manager_api_1.getApps)();
        yield (0, manager_backup_1.backupManager)(apps);
        // Logout cleanly
        (0, manager_api_1.logout)();
    }
    catch (e) {
        logger.error(e.message);
        process.exit(1);
    }
}));
program.command("restore")
    .description("Restore configuration.")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, lib_misc_1.parseCliParams)(program.opts(), timestamp);
        (0, lib_misc_1.header)(`data.stack Backup and Restore Utility ${version}`);
        let dsConfig = yield (0, lib_cli_1.validateCLIParams)();
        yield (0, manager_api_1.login)(dsConfig);
        let apps = [];
        if (!global.selectedApp)
            apps = yield (0, manager_api_1.getApps)();
        yield (0, manager_restore_1.restoreManager)(apps);
        // Logout cleanly
        (0, manager_api_1.logout)();
    }
    catch (e) {
        logger.error(e.message);
        process.exit(1);
    }
}));
program.command("clear")
    .description("Clear all configuration.")
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, lib_misc_1.parseCliParams)(program.opts(), timestamp);
        (0, lib_misc_1.header)(`data.stack Backup and Restore Utility ${version}`);
        let dsConfig = yield (0, lib_cli_1.validateCLIParams)();
        yield (0, manager_api_1.login)(dsConfig);
        let apps = yield (0, manager_api_1.getApps)();
        yield (0, manager_clearAll_1.clearAllManager)(apps);
        // Logout cleanly
        (0, manager_api_1.logout)();
    }
    catch (e) {
        logger.error(e.message);
        process.exit(1);
    }
}));
program.parse();
