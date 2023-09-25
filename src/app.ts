import { getLogger as GetLogger, configure as Log4JSConfig } from "log4js"; "log4js";
import { Command } from "commander";

const version = require("../package.json").version;
global.version = version;

let timestamp = (new Date()).toISOString().replace(/:/gi, "-");

let fileName = `dsBR_${global.version.split(".").join("_")}_${timestamp}.log`;
if (process.env.DS_BR_SINGLELOGFILE) fileName = "out.log";

Log4JSConfig({
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
let logger = GetLogger(`[${global.version}]`);
logger.level = process.env.LOGLEVEL ? process.env.LOGLEVEL : "info";

global.logger = logger;

import { header, parseCliParams } from "./lib.misc";
import { startMenu, validateCLIParams } from "./lib.cli";
import { getApps, login, logout } from "./manager.api";
import { backupManager } from "./manager.backup";
import { restoreManager } from "./manager.restore";
import { clearAllManager } from "./manager.clearAll";

const program = new Command();

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
	.action(async () => {
		try {
			parseCliParams(program.opts(), timestamp);
			header(` data.stack Backup and Restore Utility ${version} `);
			let dsConfig = await validateCLIParams();
			await login(dsConfig);
			let apps = [];
			if (!global.selectedApp) apps = await getApps();
			const selection = await startMenu();
			global.logger.info(`Selected mode :: ${selection.mode}`);
			if (selection.mode == "Backup") await backupManager(apps);
			if (selection.mode == "Restore") await restoreManager(apps);
			if (selection.mode == "Clear All") await clearAllManager(apps);
			// Logout cleanly
			logout();
		} catch (e: any) {
			logger.error(e.message);
			process.exit(1);
		}
	});

program.command("backup")
	.description("backup configuration.")
	.action(async () => {
		try {
			parseCliParams(program.opts(), timestamp);
			header(`data.stack Backup and Restore Utility ${version}`);
			let dsConfig = await validateCLIParams();
			await login(dsConfig);
			let apps = [];
			if (!global.selectedApp) apps = await getApps();
			await backupManager(apps);
			// Logout cleanly
			logout();
		} catch (e: any) {
			logger.error(e.message);
			process.exit(1);
		}
	});

program.command("restore")
	.description("Restore configuration.")
	.action(async () => {
		try {
			parseCliParams(program.opts(), timestamp);
			header(`data.stack Backup and Restore Utility ${version}`);
			let dsConfig = await validateCLIParams();
			await login(dsConfig);
			let apps = [];
			if (!global.selectedApp) apps = await getApps();
			await restoreManager(apps);
			// Logout cleanly
			logout();
		} catch (e: any) {
			logger.error(e.message);
			process.exit(1);
		}
	});

program.command("clear")
	.description("Clear all configuration.")
	.action(async () => {
		try {
			parseCliParams(program.opts(), timestamp);
			header(`data.stack Backup and Restore Utility ${version}`);
			let dsConfig = await validateCLIParams();
			await login(dsConfig);
			let apps = await getApps();
			await clearAllManager(apps);
			// Logout cleanly
			logout();
		} catch (e: any) {
			logger.error(e.message);
			process.exit(1);
		}
	});

program.parse();
