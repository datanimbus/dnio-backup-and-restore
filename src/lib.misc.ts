let logger = global.logger;

export function header(_s: string) {
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

export function stringComparison(a: string, b: string) {
	let nameA = a.toUpperCase();
	let nameB = b.toUpperCase();
	if (nameA < nameB) return -1;
	if (nameA > nameB) return 1;
	return 0;
}

export function isNotAnAcceptableValue(i: any) {
	if (typeof i == "object") return true;
	if (i == null) return true;
	return false;
}

export function printInfo(message: string) {
	logger.info(message);
	console.log(message);
}

export function printError(message: string) {
	logger.error(message);
	console.error(`ERR: ${message}`);
}

export function printDone(_msg: string, _count: number) {
	console.log(`  ${padCount(_count)} ${_msg}`);
	logger.info(`${_msg} -> ${_count}`);
}

function padCount(_d: number) {
	if (_d > 99) return ` ${_d} `;
	if (_d > 9) return `  ${_d} `;
	return `   ${_d} `;
}

export function parseCliParams(options: any, timestamp: string) {
	// ENV VAR > CLI PARAM > RUNTIME
	global.backupFileName = `backup-${timestamp}.json`;
	if (options.backupfile) global.backupFileName = options.backupfile;
	global.backupFileName = process.env.DS_BR_BACKUPFILE ? process.env.DS_BR_BACKUPFILE : global.backupFileName;
	global.restoreFileName = `restore-${timestamp}.json`;

	global.selectedApp = process.env.DS_BR_APP ? process.env.DS_BR_APP : options.app;

	if (process.env.DS_BR_SINGLELOGFILE) {
		global.backupFileName = "backup.json";
		global.restoreFileName = "restore.json";
	}

	if (options.host) process.env.DS_BR_HOST = options.host;
	if (options.username) process.env.DS_BR_USERNAME = options.username;
	if (options.password) process.env.DS_BR_PASSWORD = options.password;
}