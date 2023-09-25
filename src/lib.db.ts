import { join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { printError, printInfo } from "./lib.misc";

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

export function backupInit() {
	printInfo(`Backup file - ${global.backupFileName}`);
	sampleBackupData.host = global.host;
	writeJSON(global.backupFileName, JSON.stringify(sampleBackupData));
}

export function restoreInit() {
	logger.debug(`Restore file - ${global.restoreFileName}`);
	if (!existsSync(global.backupFileName)) {
		printError(`Backup file ${global.backupFileName} doesn't exist!`);
	}
	writeJSON(global.restoreFileName, `{"version":"${global.version}", "host":"${global.host}"}`);
}

export function save(key: string, data: any[]) {
	let backupData = readJSON(global.backupFileName);
	backupData.data[key] = data;
	writeJSON(global.backupFileName, backupData);
}

export function backupMapper(token: string, key: string, value: string) {
	let backupData = readJSON(global.backupFileName);
	if (!backupData.map[token]) backupData.map[token] = {};
	backupData.map[token][key] = value;
	writeJSON(global.backupFileName, backupData);
	logger.trace(`Updated ${global.backupFileName} : ${token} : ${key} : ${value}`);
}

export function backupDependencyMatrixOfDataService(data: any) {
	let backupData = readJSON(global.backupFileName);
	if (!backupData.dependencyMatrixOfDataService) backupData["dependencyMatrixOfDataServices"] = {};
	backupData.dependencyMatrixOfDataServices = data;
	writeJSON(global.backupFileName, backupData);
	logger.trace(`Updated ${global.backupFileName} : dependencyMatrixOfDataServices`);
}

export function backupDependencyMatrixOfDataPipe(data: any) {
	let backupData = readJSON(global.backupFileName);
	if (!backupData.dependencyMatrixOfDataPipe) backupData["dependencyMatrixOfDataPipes"] = {};
	backupData.dependencyMatrixOfDataPipes = data;
	writeJSON(global.backupFileName, backupData);
	logger.trace(`Updated ${global.backupFileName} : dependencyMatrixOfDataPipes`);
}

export function restoreMapper(token: string, key: string, value: string) {
	let restoreMapData = readJSON(global.restoreFileName);
	if (!restoreMapData[token]) restoreMapData[token] = {};
	restoreMapData[token][key] = value;
	writeJSON(global.restoreFileName, restoreMapData);
	logger.trace(`Updated ${global.restoreFileName} : ${token} : ${key} : ${value}`);
}

export function read(key: string) {
	let backupData = readJSON(global.backupFileName);
	return backupData.data[key];
}

export function readBackupMap(token: string) {
	let backupData = readJSON(global.backupFileName);
	return backupData.map[token];
}

export function readDependencyMatrixOfDataServices() {
	let backupData = readJSON(global.backupFileName);
	return backupData.dependencyMatrixOfDataServices;
}

export function readDependencyMatrixOfDataPipes() {
	let backupData = readJSON(global.backupFileName);
	return backupData.dependencyMatrixOfDataPipes;
}

export function readRestoreMap(token: string) {
	let restoreMapData = readJSON(global.restoreFileName);
	return restoreMapData[token];
}

function readJSON(filename: string) {
	const filePath = join(process.cwd(), filename);
	return JSON.parse(readFileSync(filePath).toString());
}

function writeJSON(filename: string, data: any) {
	if (typeof data == "object") {
		data = JSON.stringify(data);
	}
	const filePath = join(process.cwd(), filename);
	writeFileSync(filePath, data);
}
