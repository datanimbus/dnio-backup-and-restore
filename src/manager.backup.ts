import { customise, selectApp, selections } from "./lib.cli";
import { header, printDone, printInfo } from "./lib.misc";
import { get } from "./manager.api";
import { backupDependencyMatrixOfDataService, backupInit, backupMapper, readBackupMap, readDependencyMatrixOfDataServices, save, read, backupDependencyMatrixOfDataPipe, readDependencyMatrixOfDataPipes } from "./lib.db";
import { buildDependencyMatrixForDataServices } from "./lib.parser.ds";
import { buildDependencyMatrixForDataPipe } from "./lib.parser.pipe";

let logger = global.logger;

let selectedApp = "";

function getURLParamsForCount() {
	let searchParams = new URLSearchParams();
	searchParams.append("filter", JSON.stringify({ app: selectedApp }));
	return searchParams;
}

function getURLParamsForData(count: number) {
	let searchParams = new URLSearchParams();
	searchParams.append("filter", JSON.stringify({ app: selectedApp }));
	searchParams.append("count", count.toString());
	searchParams.append("select", "-_metadata,-allowedFileTypes,-port,-__v,-users");
	searchParams.append("sort", "_id");
	return searchParams;
}

export async function backupManager(apps: any) {
	header("Backup configurations");

	if (global.selectedApp) selectedApp = global.selectedApp;
	else selectedApp = await selectApp(apps);

	backupInit();
	printInfo(`Selected app: ${selectedApp}`);
	printInfo("Scanning the configurations within the app...");

	if (global.isSuperAdmin) {
		await fetchMapperFormulas();
		await fetchPlugins();
		await fetchNPMLibraries();
	} else {
		printInfo("Skipping Mapper Formulas, Plugins and NPM Libraries as you are not a super admin.");
	}
	await fetchDataServices();
	await fetchLibraries();
	await fetchFunctions();
	await fetchConnectors();
	await fetchDataFormats();
	await fetchAgents();
	await fetchDataPipes();
	await fetchGroups();
	await customiseBackup();
	header("Backup complete!");
}

async function fetchMapperFormulas() {
	try {
		const URL_COUNT = "/api/a/rbac/admin/metadata/mapper/formula/count";
		const URL_DATA = "/api/a/rbac/admin/metadata/mapper/formula";
		const mapperFormulaCount = await get(URL_COUNT, new URLSearchParams());
		const searchParams = new URLSearchParams();
		searchParams.append("count", mapperFormulaCount);
		searchParams.append("select", "-_metadata,-allowedFileTypes,-port,-__v,-users");
		const mapperFormulas = await get(URL_DATA, searchParams);
		save("mapperformulas", mapperFormulas);
		mapperFormulas.forEach((mf: any) => {
			backupMapper("mapperformulas", mf._id, mf.name);
			backupMapper("mapperformulas_lookup", mf.name, mf._id);
		});
		printDone("Mapper Formulas *", mapperFormulaCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchPlugins() {
	try {
		const URL_COUNT = "/api/a/bm/admin/node/utils/count";
		const URL_DATA = "/api/a/bm/admin/node";
		const pluginCount = await get(URL_COUNT, new URLSearchParams());
		const searchParams = new URLSearchParams();
		searchParams.append("count", pluginCount);
		searchParams.append("select", "-_metadata,-allowedFileTypes,-port,-__v,-users");
		const plugins = await get(URL_DATA, searchParams);
		save("plugins", plugins);
		plugins.forEach((plugin: any) => {
			backupMapper("plugins", plugin._id, plugin.name);
			backupMapper("plugins_lookup", plugin.name, plugin._id);
		});
		printDone("Plugins *", pluginCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchNPMLibraries() {
	try {
		const URL_DATA = "/api/a/bm/admin/flow/utils/node-library";
		const npmLibraries = await get(URL_DATA, new URLSearchParams());
		save("npmlibraries", npmLibraries);
		npmLibraries.forEach((lib: any) => {
			backupMapper("npmlibraries", lib._id, lib.name);
			backupMapper("npmlibraries_lookup", lib.name, lib._id);
		});
		printDone("NPM Library *", npmLibraries.length);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchDataServices() {
	try {
		var URL_COUNT = `/api/a/sm/${selectedApp}/service/utils/count`;
		var URL_DATA = `/api/a/sm/${selectedApp}/service`;
		const dataservicesCount = await get(URL_COUNT, getURLParamsForCount());
		let dataservices = await get(URL_DATA, getURLParamsForData(dataservicesCount));
		save("dataservices", dataservices);
		dataservices.forEach((ds: any) => {
			backupMapper("dataservices", ds._id, ds.name);
			backupMapper("dataservices_lookup", ds.name, ds._id);
		});
		backupDependencyMatrixOfDataService(buildDependencyMatrixForDataServices(dataservices));
		printDone("Data services", dataservicesCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchLibraries() {
	try {
		var URL_COUNT = `/api/a/sm/${selectedApp}/globalSchema/utils/count`;
		var URL_DATA = `/api/a/sm/${selectedApp}/globalSchema`;
		const librariesCount = await get(URL_COUNT, getURLParamsForCount());
		let libraries = await get(URL_DATA, getURLParamsForData(librariesCount));
		save("libraries", libraries);
		libraries.forEach((library: any) => {
			library.services = [];
			backupMapper("libraries", library._id, library.name);
			backupMapper("libraries_lookup", library.name, library._id);
		});
		printDone("Libraries", librariesCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchFunctions() {
	try {
		let URL_COUNT = `/api/a/bm/${selectedApp}/faas/utils/count`;
		let URL_DATA = `/api/a/bm/${selectedApp}/faas`;
		let functionsCount = await get(URL_COUNT, getURLParamsForCount());
		let functions = await get(URL_DATA, getURLParamsForData(functionsCount));
		save("functions", functions);
		functions.forEach((fn: any) => {
			fn.services = [];
			backupMapper("functions", fn._id, fn.name);
			backupMapper("functions_lookup", fn.name, fn._id);
		});
		printDone("Functions", functionsCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchConnectors() {
	try {
		const URL_DATA = `/api/a/rbac/${selectedApp}/connector`;
		const URL_COUNT = `/api/a/rbac/${selectedApp}/connector/utils/count`;
		const connectorsCount = await get(URL_COUNT, getURLParamsForCount());
		const connectors = await get(URL_DATA, getURLParamsForData(connectorsCount));
		save("connectors", connectors);
		connectors.forEach((connector: any) => {
			backupMapper("connectors", connector._id, connector.name);
			backupMapper("connectors_lookup", connector.name, connector._id);
		});
		printDone("Connectors", connectorsCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchDataFormats() {
	try {
		const URL_DATA = `/api/a/bm/${selectedApp}/dataFormat`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/dataFormat`;
		let searchParams = getURLParamsForCount();
		searchParams.append("countOnly", "true");
		const dataFormatsCount = await get(URL_COUNT, searchParams);
		const dataFormats = await get(URL_DATA, getURLParamsForData(dataFormatsCount));
		save("dataformats", dataFormats);
		dataFormats.forEach((dataFormat: any) => {
			backupMapper("dataformats", dataFormat._id, dataFormat.name);
			backupMapper("dataformats_lookup", dataFormat.name, dataFormat._id);
		});
		printDone("Data Formats", dataFormatsCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchAgents() {
	try {
		const URL_DATA = `/api/a/bm/${selectedApp}/agent`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/agent/utils/count`;
		const agentsCount = await get(URL_COUNT, getURLParamsForCount());
		const agents = await get(URL_DATA, getURLParamsForData(agentsCount));
		save("agents", agents);
		agents.forEach((agent: any) => {
			backupMapper("agents", agent._id, agent.name);
			backupMapper("agents_lookup", agent.name, agent._id);
			backupMapper("agentIDs", agent._id, agent.agentId);
		});
		printDone("Agents", agentsCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchDataPipes() {
	try {
		const URL_DATA = `/api/a/bm/${selectedApp}/flow`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/flow/utils/count`;
		const dataPipesCount = await get(URL_COUNT, getURLParamsForCount());
		const dataPipes = await get(URL_DATA, getURLParamsForData(dataPipesCount));
		save("datapipes", dataPipes);
		dataPipes.forEach((dataPipe: any) => {
			backupMapper("datapipes", dataPipe._id, dataPipe.name);
			backupMapper("datapipes_lookup", dataPipe.name, dataPipe._id);
		});
		backupDependencyMatrixOfDataPipe(buildDependencyMatrixForDataPipe(dataPipes));
		printDone("Data Pipes", dataPipesCount);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function fetchGroups() {
	try {
		let URL_COUNT = `/api/a/rbac/${selectedApp}/group/count`;
		let URL_DATA = `/api/a/rbac/${selectedApp}/group`;
		const groupsCount = await get(URL_COUNT, getURLParamsForCount());
		let groups = await get(URL_DATA, getURLParamsForData(groupsCount));
		groups = groups.filter((group: any) => group.name != "#");
		save("groups", groups);
		groups.forEach((group: any) => {
			backupMapper("groups", group._id, group.name);
			backupMapper("groups_lookup", group.name, group._id);
		});
		printDone("Groups", groups.length);
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function customiseBackup() {

	let customisationRequired = await customise();
	if (!customisationRequired) {
		printInfo("No backup customizations done.");
		return;
	}
	header("Customizing the backup");

	let selectedMapperFormulas: string[] = [];
	let selectedPlugins: string[] = [];
	if (global.isSuperAdmin) {
		let mapperformulasLookup = readBackupMap("mapperformulas_lookup");
		(await selections("Mapper Formulas", Object.keys(mapperformulasLookup))).forEach((mf: string) => selectedMapperFormulas.push(mapperformulasLookup[mf]));

		let pluginsLookup = readBackupMap("plugins_lookup");
		(await selections("Plugins", Object.keys(pluginsLookup))).forEach((plugin: string) => selectedPlugins.push(pluginsLookup[plugin]));
	} else {
		printInfo("Skipping Mapper Formulas, Plugins and NPM Libraries as you are not a super admin.");
	}

	let dataservicesLookup = readBackupMap("dataservices_lookup");
	let selectedDataservices: string[] = [];
	(await selections("Data Services", Object.keys(dataservicesLookup))).forEach((ds: string) => selectedDataservices.push(dataservicesLookup[ds]));

	let librariesLookup = readBackupMap("libraries_lookup");
	let selectedLibraries: string[] = [];
	(await selections("Libraries", Object.keys(librariesLookup))).forEach((lib: string) => selectedLibraries.push(librariesLookup[lib]));

	let functionsLookup = readBackupMap("functions_lookup");
	let selectedFunctions: string[] = [];
	(await selections("Functions", Object.keys(functionsLookup))).forEach((fn: string) => selectedFunctions.push(functionsLookup[fn]));

	let connectorsLookup = readBackupMap("connectors_lookup");
	let selectedConnectors: string[] = [];
	(await selections("Connectors", Object.keys(connectorsLookup))).forEach((connector: string) => selectedConnectors.push(connectorsLookup[connector]));

	let dataformatsLookup = readBackupMap("dataformats_lookup");
	let selectedDataFormats: string[] = [];
	(await selections("Data Formats", Object.keys(dataformatsLookup))).forEach((dataformat: string) => selectedDataFormats.push(dataformatsLookup[dataformat]));

	let agentsLookup = readBackupMap("agents_lookup");
	let selectedAgents: string[] = [];
	(await selections("Agents", Object.keys(agentsLookup))).forEach((agent: string) => selectedAgents.push(agentsLookup[agent]));

	let datapipesLookup = readBackupMap("datapipes_lookup");
	let selectedDataPipes: string[] = [];
	(await selections("Data Pipes", Object.keys(datapipesLookup))).forEach((datapipe: string) => selectedDataPipes.push(datapipesLookup[datapipe]));

	let groupsLookup = readBackupMap("groups_lookup");
	let selectedGroups: string[] = [];
	(await selections("groups", Object.keys(groupsLookup))).forEach((group: string) => selectedGroups.push(groupsLookup[group]));

	if (global.isSuperAdmin) {
		logger.info(`Mapper Formulas : ${selectedMapperFormulas.join(", ") || "Nil"}`);
		logger.info(`Plugins : ${selectedPlugins.join(", ") || "Nil"}`);
	}
	logger.info(`Dataservices : ${selectedDataservices.join(", ") || "Nil"}`);
	logger.info(`Libraries : ${selectedLibraries.join(", ") || "Nil"}`);
	logger.info(`Functions : ${selectedFunctions.join(", ") || "Nil"}`);
	logger.info(`Connectors : ${selectedConnectors.join(", ") || "Nil"}`);
	logger.info(`Data Formats : ${selectedDataFormats.join(", ") || "Nil"}`);
	logger.info(`Agents : ${selectedAgents.join(", ") || "Nil"}`);
	logger.info(`Data Pipes : ${selectedDataPipes.join(", ") || "Nil"}`);
	logger.info(`Groups : ${selectedGroups.join(", ") || "Nil"}`);

	let dependencyMatrixOfDataService = readDependencyMatrixOfDataServices();
	let superSetOfDataservices = selectedDataservices;
	selectedDataservices.forEach((dataserviceID: string) => {
		selectAllRelated(dataserviceID, dependencyMatrixOfDataService)
			.filter(ds => superSetOfDataservices.indexOf(ds) == -1)
			.forEach(ds => superSetOfDataservices.push(ds));
		dependencyMatrixOfDataService[dataserviceID].libraries.forEach((library: string) => {
			if (selectedLibraries.indexOf(library) == -1) selectedLibraries.push(library);
		});
		dependencyMatrixOfDataService[dataserviceID].functions.forEach((fn: string) => {
			if (selectedFunctions.indexOf(fn) == -1) selectedFunctions.push(fn);
		});
	});

	let dependencyMatrixOfDataPipe = readDependencyMatrixOfDataPipes();
	selectedDataPipes.forEach((dataPipeID: string) => {
		dependencyMatrixOfDataPipe[dataPipeID].dataservices.forEach((dataservice: string) => {
			if (superSetOfDataservices.indexOf(dataservice) == -1) superSetOfDataservices.push(dataservice);
		});
		dependencyMatrixOfDataPipe[dataPipeID].dataformats.forEach((dataformat: string) => {
			if (selectedLibraries.indexOf(dataformat) == -1) selectedDataFormats.push(dataformat);
		});
		dependencyMatrixOfDataPipe[dataPipeID].functions.forEach((fn: string) => {
			if (selectedFunctions.indexOf(fn) == -1) selectedFunctions.push(fn);
		});
		dependencyMatrixOfDataPipe[dataPipeID].agents.forEach((agent: string) => {
			if (selectedAgents.indexOf(agent) == -1) selectedAgents.push(agent);
		});
		dependencyMatrixOfDataPipe[dataPipeID].connectors.forEach((connector: string) => {
			if (selectedConnectors.indexOf(connector) == -1) selectedConnectors.push(connector);
		});
		dependencyMatrixOfDataPipe[dataPipeID].plugins.forEach((plugin: string) => {
			if (selectedPlugins.indexOf(plugin) == -1) selectedPlugins.push(plugin);
		});
		dependencyMatrixOfDataPipe[dataPipeID].mapperformulas.forEach((mf: string) => {
			if (selectedMapperFormulas.indexOf(mf) == -1) selectedMapperFormulas.push(mf);
		});
	});

	if (global.isSuperAdmin) {
		logger.info(`Superset Mapper Formulas : ${selectedMapperFormulas.join(", ")}`);
		logger.info(`Superset Plugins : ${selectedPlugins.join(", ")}`);
	}
	logger.info(`Superset Dataservices : ${superSetOfDataservices.join(", ")}`);
	logger.info(`Superset Libraries : ${selectedLibraries.join(", ")}`);
	logger.info(`Superset Functions : ${selectedFunctions.join(", ")}`);
	logger.info(`Superset Conectors : ${selectedConnectors.join(", ")}`);
	logger.info(`Superset Data Formats : ${selectedDataFormats.join(", ")}`);
	logger.info(`Superset Agents : ${selectedAgents.join(", ")}`);
	logger.info(`Superset Data Pipes : ${selectedDataPipes.join(", ")}`);

	let mapperformulas = read("mapperformulas").filter((mapperformula: any) => selectedMapperFormulas.indexOf(mapperformula._id) != -1);
	let plugins = read("plugins").filter((plugin: any) => selectedPlugins.indexOf(plugin._id) != -1);
	let dataservices = read("dataservices").filter((dataservice: any) => superSetOfDataservices.indexOf(dataservice._id) != -1);
	let libraries = read("libraries").filter((library: any) => selectedLibraries.indexOf(library._id) != -1);
	let functions = read("functions").filter((fn: any) => selectedFunctions.indexOf(fn._id) != -1);
	let connectors = read("connectors").filter((connector: any) => selectedConnectors.indexOf(connector._id) != -1);
	let dataformats = read("dataformats").filter((dataformat: any) => selectedDataFormats.indexOf(dataformat._id) != -1);
	let agents = read("agents").filter((agent: any) => selectedAgents.indexOf(agent._id) != -1);
	let datapipes = read("datapipes").filter((datapipe: any) => selectedDataPipes.indexOf(datapipe._id) != -1);
	let groups = read("groups").filter((group: any) => selectedGroups.indexOf(group._id) != -1);

	if (global.isSuperAdmin) {
		save("mapperformulas", mapperformulas);
		save("plugins", plugins);
	}
	save("dataservices", dataservices);
	save("libraries", libraries);
	save("functions", functions);
	save("connectors", connectors);
	save("dataformats", dataformats);
	save("agents", agents);
	save("datapipes", datapipes);
	save("groups", groups);
}

function selectAllRelated(dataserviceID: string, dependencyMatrix: any) {
	let requiredDS: string[] = [];
	dependencyMatrix[dataserviceID].dataservices.forEach((ds: string) => {
		if (dataserviceID == ds) return;
		if (requiredDS.indexOf(ds) == -1) {
			requiredDS.push(ds);
			selectAllRelated(ds, dependencyMatrix)
				.filter(ds => requiredDS.indexOf(ds) == -1)
				.forEach(ds => requiredDS.push(ds));
		}
	});
	return requiredDS;
}