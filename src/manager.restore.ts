import { selectApp } from "./lib.cli";
import { header, printInfo } from "./lib.misc";
import { get, post, put } from "./manager.api";
import { read, readBackupMap, readRestoreMap, restoreInit, restoreMapper } from "./lib.db";
import { generateSampleDataSerivce, parseAndFixDataServices } from "./lib.parser.ds";
import { parseAndFixDataPipes } from "./lib.parser.pipe";

let logger = global.logger;
let selectedApp = "";

export async function restoreManager(apps: any) {
	header("Restore configuration");

	if (global.selectedApp) selectedApp = global.selectedApp;
	else selectedApp = await selectApp(apps);

	printInfo(`Selected app: ${selectedApp}`);
	printInfo(`Backup file being used - ${global.backupFileName}`);

	restoreInit();

	printInfo("Scanning the configurations...");

	if (global.isSuperAdmin) {
		await restoreMapperFormulas();
		await restorePlugins();
	}

	await restoreLibrary();
	await restoreFunctions();
	await restoreConnectors();
	await restoreDataServices();
	await restoreDataFormats();
	await restoreAgents();
	await restoreDataPipes();
	await restoreGroups();
	header("Restore complete!");
}
// SuperAdmin level APIs
async function superadminConfigExists(api: string, name: string) {
	try {
		let searchParams = new URLSearchParams();
		searchParams.append("filter", JSON.stringify({ name: name }));
		searchParams.append("count", "-1");
		searchParams.append("select", "name");
		logger.debug(`Check for existing config - ${api} ${searchParams}`);
		let data = await get(api, searchParams);
		logger.debug(`Check for existing config result - ${api} : ${JSON.stringify(data)}`);
		if (data.length > 0 && data[0]._id) return data[0]._id;
		return null;
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function superadminInsert(type: string, baseURL: string, backedUpData: any): Promise<any> {
	try {
		logger.info(`SuperAdmin : Insert ${type} : ${backedUpData.name}`);
		let data = JSON.parse(JSON.stringify(backedUpData));
		delete data._id;
		let newData = await post(baseURL, data);
		printInfo(`${type} created : ${backedUpData.name}`);
		logger.info(JSON.stringify(newData));
		return newData;
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function superadminUpdate(type: string, baseURL: string, backedUpData: any, existinID: string): Promise<any> {
	try {
		logger.info(`SuperAdmin : Update ${type} : ${backedUpData.name}`);
		let data = JSON.parse(JSON.stringify(backedUpData));
		data._id = existinID;
		delete data.status;
		let updateURL = `${baseURL}/${existinID}`;
		let newData = await put(updateURL, data);
		printInfo(`${type} updated : ${backedUpData.name}`);
		logger.info(JSON.stringify(newData));
		return newData;
	} catch (e: any) {
		logger.error(e.message);
	}
}

// APP Level APIs
async function configExists(api: string, name: string, selectedApp: string) {
	try {
		let searchParams = new URLSearchParams();
		searchParams.append("filter", JSON.stringify({ app: selectedApp, name: name }));
		searchParams.append("count", "-1");
		searchParams.append("select", "name");
		logger.debug(`Check for existing config - ${api} ${searchParams}`);
		let data = await get(api, searchParams);
		logger.debug(`Check for existing config result - ${api} : ${JSON.stringify(data)}`);
		if (data.length > 0 && data[0]._id) return data[0]._id;
		return null;
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function insert(type: string, baseURL: string, selectedApp: string, backedUpData: any): Promise<any> {
	try {
		logger.info(`${selectedApp} : Insert ${type} : ${backedUpData.name}`);
		let data = JSON.parse(JSON.stringify(backedUpData));
		data.app = selectedApp;
		delete data._id;
		let newData = await post(baseURL, data);
		printInfo(`${type} created : ${backedUpData.name}`);
		logger.info(JSON.stringify(newData));
		return newData;
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function update(type: string, baseURL: string, selectedApp: string, backedUpData: any, existinID: string): Promise<any> {
	try {
		logger.info(`${selectedApp} : Update ${type} : ${backedUpData.name}`);
		let data = JSON.parse(JSON.stringify(backedUpData));
		data.app = selectedApp;
		data._id = existinID;
		delete data.status;
		let updateURL = `${baseURL}/${existinID}`;
		let newData = await put(updateURL, data);
		printInfo(`${type} updated : ${backedUpData.name}`);
		logger.info(JSON.stringify(newData));
		return newData;
	} catch (e: any) {
		logger.error(e.message);
	}
}

// SuperAdmin level restores
async function restoreMapperFormulas() {
	try {
		let mapperFormulas = read("mapperformulas");
		if (mapperFormulas.length < 1) return;
		header("Mapper Formulas");
		printInfo(`Mapper Formulas to restore - ${mapperFormulas.length}`);
		let BASE_URL = "/api/a/rbac/admin/metadata/mapper/formula";
		await mapperFormulas.reduce(async (prev: any, mapperFormula: any) => {
			await prev;
			delete mapperFormula._metadata;
			delete mapperFormula.__v;
			delete mapperFormula.version;
			let existingID = await superadminConfigExists(BASE_URL, mapperFormula.name);
			let newData = null;
			if (existingID) newData = await superadminUpdate("Mapper Formula", BASE_URL, mapperFormula, existingID);
			else newData = await superadminInsert("Mapper Formula", BASE_URL, mapperFormula);
			restoreMapper("mapperFormulas", mapperFormula._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restorePlugins() {
	try {
		let plugins = read("plugins");
		if (plugins.length < 1) return;
		header("Plugins");
		printInfo(`Plugins to restore - ${plugins.length}`);
		let BASE_URL = "/api/a/bm/admin/node";
		await plugins.reduce(async (prev: any, plugin: any) => {
			await prev;
			delete plugin._metadata;
			delete plugin.__v;
			delete plugin.version;
			let existingID = await superadminConfigExists(BASE_URL, plugin.name);
			let newData = null;
			if (existingID) newData = await superadminUpdate("Plugin", BASE_URL, plugin, existingID);
			else newData = await superadminInsert("Plugin", BASE_URL, plugin);
			restoreMapper("plugins", plugin._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}


// App level restores
async function restoreLibrary() {
	try {
		let libraries = read("libraries");
		if (libraries.length < 1) return;
		header("Library");
		printInfo(`Libraries to restore - ${libraries.length}`);
		let BASE_URL = `/api/a/sm/${selectedApp}/globalSchema`;
		await libraries.reduce(async (prev: any, library: any) => {
			await prev;
			delete library.services;
			let existingID = await configExists(BASE_URL, library.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Library", BASE_URL, selectedApp, library, existingID);
			else newData = await insert("Library", BASE_URL, selectedApp, library);
			restoreMapper("libraries", library._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreFunctions() {
	try {
		let functions = read("functions");
		if (functions.length < 1) return;
		header("Functions");
		printInfo(`Functions to restore - ${functions.length}`);
		let BASE_URL = `/api/a/bm/${selectedApp}/faas`;
		await functions.reduce(async (prev: any, fn: any) => {
			await prev;
			delete fn._metadata;
			delete fn.__v;
			delete fn.version;
			delete fn.lastInvoked;
			let existingID = await configExists(BASE_URL, fn.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Function", BASE_URL, selectedApp, fn, existingID);
			else {
				newData = await insert("Function", BASE_URL, selectedApp, fn);
				newData = await update("Function", BASE_URL, selectedApp, fn, newData._id);
			}
			restoreMapper("functions", fn._id, newData._id);
			restoreMapper("functionURL", newData._id, newData.url);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreConnectors() {
	try {
		let connectors = read("connectors");
		if (connectors.length < 1) return;
		header("Connectors");
		printInfo(`Connectors to restore - ${connectors.length}`);
		let BASE_URL = `/api/a/rbac/${selectedApp}/connector`;
		await connectors.reduce(async (prev: any, connector: any) => {
			await prev;
			delete connector._metadata;
			delete connector.__v;
			delete connector.version;
			let existingID = await configExists(BASE_URL, connector.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Connector", BASE_URL, selectedApp, connector, existingID);
			else newData = await insert("Connector", BASE_URL, selectedApp, connector);
			restoreMapper("connectors", connector._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreDataServices() {
	try {
		let dataservices = read("dataservices");
		if (dataservices.length < 1) return;

		header("Dataservice");
		printInfo(`Dataservices to restore - ${dataservices.length}`);

		var BASE_URL = `/api/a/sm/${selectedApp}/service`;
		// Find which data services exists and which doesn't
		let newDataServices: string[] = [];
		await dataservices.reduce(async (prev: any, dataservice: any) => {
			await prev;
			let existingID = await configExists(BASE_URL, dataservice.name, selectedApp);
			if (existingID) return restoreMapper("dataservices", dataservice._id, existingID);
			newDataServices.push(dataservice._id);
		}, Promise.resolve());

		// Create new data services
		logger.info(`New dataservices - ${newDataServices.join(", ")}`);
		printInfo(`New dataservices to be created - ${newDataServices.length}`);
		await dataservices.reduce(async (prev: any, dataservice: any) => {
			await prev;
			if (newDataServices.indexOf(dataservice._id) == -1) return;
			let newDS = generateSampleDataSerivce(dataservice.name, selectedApp);
			let newData = await insert("Dataservice", BASE_URL, selectedApp, newDS);
			return restoreMapper("dataservices", dataservice._id, newData._id);
		}, Promise.resolve());

		dataservices = parseAndFixDataServices(dataservices);
		let dataserviceMap = readRestoreMap("dataservices");

		await dataservices.reduce(async (prev: any, dataservice: any) => {
			await prev;
			dataservice.status = "Undeployed";
			if (newDataServices.indexOf(dataservice._id) != -1) dataservice.status = "Draft";
			return await update("Dataservice", BASE_URL, selectedApp, dataservice, dataserviceMap[dataservice._id]);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreDataFormats() {
	try {
		let dataformats = read("dataformats");
		if (dataformats.length < 1) return;
		header("Dataformat");
		printInfo(`Dataformats to restore - ${dataformats.length}`);
		let BASE_URL = `/api/a/bm/${selectedApp}/dataFormat`;
		await dataformats.reduce(async (prev: any, dataformat: any) => {
			await prev;
			delete dataformat._metadata;
			delete dataformat.__v;
			delete dataformat.version;
			let existingID = await configExists(BASE_URL, dataformat.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Dataformat", BASE_URL, selectedApp, dataformat, existingID);
			else newData = await insert("Dataformat", BASE_URL, selectedApp, dataformat);
			restoreMapper("dataformats", dataformat._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreAgents() {
	try {
		let agents = read("agents");
		let agentIDs = readBackupMap("agentIDs");
		if (agents.length < 1) return;
		header("Agent");
		printInfo(`Agents to restore - ${agents.length}`);
		let BASE_URL = `/api/a/bm/${selectedApp}/agent`;
		await agents.reduce(async (prev: any, agent: any) => {
			await prev;
			delete agent._metadata;
			delete agent.__v;
			delete agent.version;
			delete agent.agentId;
			let existingID = await configExists(BASE_URL, agent.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Agent", BASE_URL, selectedApp, agent, existingID);
			else newData = await insert("Agent", BASE_URL, selectedApp, agent);
			restoreMapper("agents", agent._id, newData._id);
			restoreMapper("agentIDs", agentIDs[agent._id], newData.agentId);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreDataPipes() {
	try {
		let datapipes = read("datapipes");
		if (datapipes.length < 1) return;
		header("Data pipe");
		printInfo(`Data pipes to restore - ${datapipes.length}`);
		const BASE_URL = `/api/a/bm/${selectedApp}/flow`;
		datapipes = parseAndFixDataPipes(datapipes);
		await datapipes.reduce(async (prev: any, datapipe: any) => {
			await prev;
			delete datapipe._metadata;
			delete datapipe.__v;
			delete datapipe.version;
			delete datapipe.lastInvoked;
			let existingID = await configExists(BASE_URL, datapipe.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Data pipe", BASE_URL, selectedApp, datapipe, existingID);
			else newData = await insert("Data pipe", BASE_URL, selectedApp, datapipe);
			restoreMapper("datapipes", datapipe._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function restoreGroups() {
	try {
		let groups = read("groups");
		if (groups.length < 1) return;
		header("Group");
		printInfo(`Groups to restore - ${groups.length}`);
		let BASE_URL = `/api/a/rbac/${selectedApp}/group`;
		let dataServiceIDMap = readRestoreMap("dataservices");
		let dataPipesIDMap = readRestoreMap("datapipes");
		await groups.reduce(async (prev: any, group: any) => {
			await prev;

			group.roles.forEach((role: any) => {
				role.app = selectedApp;
				if (dataServiceIDMap[role.entity]) role.entity = dataServiceIDMap[role.entity];
				if (dataPipesIDMap[role.entity]) {
					role.id = `INTR_${dataPipesIDMap[role.entity]}`;
					role.entity = dataPipesIDMap[role.entity];
				}
				if (role._id == "ADMIN_role.entity") role._id = `ADMIN_${dataServiceIDMap[role.entity]}`;
			});

			let existingID = await configExists(BASE_URL, group.name, selectedApp);
			let newData = null;
			if (existingID) newData = await update("Group", BASE_URL, selectedApp, group, existingID);
			else newData = await insert("Group", BASE_URL, selectedApp, group);
			restoreMapper("group", group._id, newData._id);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}
