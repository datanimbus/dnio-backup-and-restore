import { selectApp } from "./lib.cli";
import { header, printInfo } from "./lib.misc";
import { del, get } from "./manager.api";

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
	searchParams.append("select", "name,options");
	searchParams.append("sort", "-_id");
	return searchParams;
}

export async function clearAllManager(apps: any) {
	header("Clear all configurations");

	if (global.selectedApp) selectedApp = global.selectedApp;
	else selectedApp = await selectApp(apps);

	printInfo(`Selected app: ${selectedApp}`);
	printInfo("Scanning the configurations within the app...");

	await clearGroups();
	await clearDataPipes();
	await clearAgents();
	await clearDataFormats();
	await clearDataServices();
	await clearConnectors();
	await clearFunctions();
	await clearLibrary();
	header("Cleanup complete!");
}

async function clearGroups() {
	try {
		header("Group");
		let URL_COUNT = `/api/a/rbac/${selectedApp}/group/count`;
		let URL_DATA = `/api/a/rbac/${selectedApp}/group`;
		const groupsCount = await get(URL_COUNT, getURLParamsForCount());
		const groups = await get(URL_DATA, getURLParamsForData(groupsCount));
		printInfo(`${groups.length - 1} Group(s) found.`);
		await groups.reduce(async (p: any, group: any) => {
			await p;
			if (group.name == "#") return Promise.resolve();
			printInfo(`  * [X] ${group._id} ${group.name}`);
			let GROUP_URL = `${URL_DATA}/${group._id}`;
			await del(GROUP_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearDataPipes() {
	try {
		header("Data pipe");
		const URL_DATA = `/api/a/bm/${selectedApp}/flow`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/flow/utils/count`;
		const dataPipesCount = await get(URL_COUNT, getURLParamsForCount());
		const dataPipes = await get(URL_DATA, getURLParamsForData(dataPipesCount));
		printInfo(`${dataPipes.length} Data pipe(s) found.`);
		await dataPipes.reduce(async (p: any, dataPipe: any) => {
			await p;
			printInfo(`  * [X] ${dataPipe._id} ${dataPipe.name}`);
			let DP_URL = `${URL_DATA}/${dataPipe._id}`;
			await del(DP_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearAgents() {
	try {
		header("Agent");
		const URL_DATA = `/api/a/bm/${selectedApp}/agent`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/agent/utils/count`;
		const agentsCount = await get(URL_COUNT, getURLParamsForCount());
		const agents = await get(URL_DATA, getURLParamsForData(agentsCount));
		printInfo(`${agents.length} Agent(s) found.`);
		await agents.reduce(async (p: any, agent: any) => {
			await p;
			printInfo(`  * [X] ${agent._id} ${agent.name}`);
			let AGENT_URL = `${URL_DATA}/${agent._id}`;
			await del(AGENT_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearDataFormats() {
	try {
		header("Data format");
		const URL_DATA = `/api/a/bm/${selectedApp}/dataFormat`;
		const URL_COUNT = `/api/a/bm/${selectedApp}/dataFormat`;
		let searchParams = getURLParamsForCount();
		searchParams.append("countOnly", "true");
		const dataFormatsCount = await get(URL_COUNT, searchParams);
		const dataFormats = await get(URL_DATA, getURLParamsForData(dataFormatsCount));
		printInfo(`${dataFormats.length} Data format(s) found.`);
		await dataFormats.reduce(async (p: any, dataFormat: any) => {
			await p;
			printInfo(`  * [X] ${dataFormat._id} ${dataFormat.name}`);
			let DF_URL = `${URL_DATA}/${dataFormat._id}`;
			await del(DF_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearDataServices() {
	try {
		header("Dataservice");
		var URL_COUNT = `/api/a/sm/${selectedApp}/service/utils/count`;
		var URL_DATA = `/api/a/sm/${selectedApp}/service`;
		const dataservicesCount = await get(URL_COUNT, getURLParamsForCount());
		let dataservices = await get(URL_DATA, getURLParamsForData(dataservicesCount));
		printInfo(`${dataservices.length} Dataservice(s) found.`);
		await dataservices.reduce(async (p: any, dataservice: any) => {
			await p;
			printInfo(`  * [X] ${dataservice._id} ${dataservice.name}`);
			let DS_URL = `${URL_DATA}/${dataservice._id}`;
			await del(DS_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearConnectors() {
	try {
		header("Connector");
		const URL_DATA = `/api/a/rbac/${selectedApp}/connector`;
		const URL_COUNT = `/api/a/rbac/${selectedApp}/connector/utils/count`;
		const connectorsCount = await get(URL_COUNT, getURLParamsForCount());
		const connectors = await get(URL_DATA, getURLParamsForData(connectorsCount));
		printInfo(`${connectors.length} Connector(s) found.`);
		await connectors.reduce(async (p: any, connector: any) => {
			await p;
			if (connector.options.default) return Promise.resolve();
			printInfo(`  * [X] ${connector._id} ${connector.name}`);
			let DF_URL = `${URL_DATA}/${connector._id}`;
			await del(DF_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearLibrary() {
	try {
		header("Library");
		var URL_COUNT = `/api/a/sm/${selectedApp}/globalSchema/utils/count`;
		var URL_DATA = `/api/a/sm/${selectedApp}/globalSchema`;
		const librariesCount = await get(URL_COUNT, getURLParamsForCount());
		let libraries = await get(URL_DATA, getURLParamsForData(librariesCount));
		printInfo(`${libraries.length} Library(-ies) found.`);
		await libraries.reduce(async (p: any, library: any) => {
			await p;
			printInfo(`  * [X] ${library._id} ${library.name}`);
			let LIB_URL = `${URL_DATA}/${library._id}`;
			await del(LIB_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}

async function clearFunctions() {
	try {
		header("Function");
		let URL_COUNT = `/api/a/bm/${selectedApp}/faas/utils/count`;
		let URL_DATA = `/api/a/bm/${selectedApp}/faas`;
		let functionsCount = await get(URL_COUNT, getURLParamsForCount());
		let functions = await get(URL_DATA, getURLParamsForData(functionsCount));
		printInfo(`${functions.length} Function(s) found.`);
		await functions.reduce(async (p: any, fn: any) => {
			await p;
			printInfo(`  * [X] ${fn._id} ${fn.name}`);
			let FN_URL = `${URL_DATA}/${fn._id}`;
			await del(FN_URL);
		}, Promise.resolve());
	} catch (e: any) {
		logger.error(e.message);
	}
}