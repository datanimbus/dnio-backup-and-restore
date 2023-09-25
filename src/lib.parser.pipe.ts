import { readBackupMap, readRestoreMap, readDependencyMatrixOfDataPipes } from "./lib.db";

export function buildDependencyMatrixForDataPipe(datapipes: any[]) {
	const mapperformulaIDs = Object.keys(readBackupMap("mapperformulas"));
	const pluginIDs = Object.keys(readBackupMap("plugins"));
	const dataServiceIDs = Object.keys(readBackupMap("dataservices"));
	const dataformatIDs = Object.keys(readBackupMap("dataformats"));
	const functionIDs = Object.keys(readBackupMap("functions"));
	const agentIDs = Object.keys(readBackupMap("agents"));
	const connectorIDs = Object.keys(readBackupMap("connectors"));
	let dependencyMatrix: any = {};
	datapipes.forEach((datapipe: any) => {
		const dp = JSON.stringify(datapipe);
		dependencyMatrix[datapipe._id] = {
			plugins: [],
			mapperformulas: [],
			dataservices: dataServiceIDs.filter((id: any) => dp.indexOf(id) !== -1),
			dataformats: dataformatIDs.filter((id: any) => dp.indexOf(id) !== -1),
			functions: functionIDs.filter((id: any) => dp.indexOf(id) !== -1),
			agents: agentIDs.filter((id: any) => dp.indexOf(id) !== -1),
			connectors: connectorIDs.filter((id: any) => dp.indexOf(id) !== -1)
		};
		if (global.isSuperAdmin) {
			dependencyMatrix[datapipe._id]["plugins"] = pluginIDs.filter((id: any) => dp.indexOf(id) !== -1);
			dependencyMatrix[datapipe._id]["mapperformulas"] = mapperformulaIDs.filter((id: any) => dp.indexOf(id) !== -1);
		}
	});
	return dependencyMatrix;
}

export function parseAndFixDataPipes(datapipes: any[]): any[] {
	const plugins = readRestoreMap("plugins");
	const mapperformulas = readRestoreMap("mapperFormulas");
	const functions = readRestoreMap("functions");
	const dataservices = readRestoreMap("dataservices");
	const dataformats = readRestoreMap("dataformats");
	const agents = readRestoreMap("agents");
	const agentIDsFromBackup = readBackupMap("agentIDs");
	const agentIDsFromRestore = readRestoreMap("agentIDs");
	const dependencyMatrixOfDataPipe = readDependencyMatrixOfDataPipes();
	let fixedDataPipes: any[] = [];
	datapipes.forEach((datapipe: any) => {
		let dp = JSON.stringify(datapipe);
		const dependencyMatrix = dependencyMatrixOfDataPipe[datapipe._id];
		dependencyMatrix.plugins.forEach((pluginId: any) => dp = dp.split(pluginId).join(plugins[pluginId]));
		dependencyMatrix.mapperformulas.forEach((mapperformulaId: any) => dp = dp.split(mapperformulaId).join(mapperformulas[mapperformulaId]));
		dependencyMatrix.dataservices.forEach((dataservicesId: any) => dp = dp.split(dataservicesId).join(dataservices[dataservicesId]));
		dependencyMatrix.dataformats.forEach((dataformatId: any) => dp = dp.split(dataformatId).join(dataformats[dataformatId]));
		dependencyMatrix.functions.forEach((functionId: any) => dp = dp.split(functionId).join(functions[functionId]));
		dependencyMatrix.agents.forEach((agentId: any) => {
			dp = dp.split(agentId).join(agents[agentId]);
			let backupAgentId = agentIDsFromBackup[agentId];
			dp = dp.split(backupAgentId).join(agentIDsFromRestore[backupAgentId]);
		});
		dependencyMatrix.connectors.forEach((connectorId: any) => dp = dp.split(connectorId).join(functions[connectorId]));
		fixedDataPipes.push(JSON.parse(dp));
	});
	return fixedDataPipes;
}