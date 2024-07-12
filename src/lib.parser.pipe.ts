import { readBackupMap, readRestoreMap, readDependencyMatrixOfDataPipes } from "./lib.db";

export function generateSampleDataPipe(name: string, selectedApp: String) {
	return {
		"name": name,
		"description": null,
		"type": "API",
		"inputNode": {
			"_id": "api_json_receiver",
			"name": "api_json_receiver",
			"type": "API"
		},
		"app": selectedApp,
		"nodes": []
	};
}

export function buildDependencyMatrixForDataPipe(datapipes: any[]) {
	const mapperformulaIDs = Object.keys(readBackupMap("mapperformulas"));
	const pluginIDs = Object.keys(readBackupMap("plugins"));
	const myNodesIDs = Object.keys(readBackupMap("myNodes"));
	const dataServiceIDs = Object.keys(readBackupMap("dataservices"));
	const dataformatIDs = Object.keys(readBackupMap("dataformats"));
	const functionIDs = Object.keys(readBackupMap("functions"));
	const agentIDs = Object.keys(readBackupMap("agents"));
	const connectorIDs = Object.keys(readBackupMap("connectors"));
	const datapipeIDs = Object.keys(readBackupMap("datapipes"));
	let dependencyMatrix: any = {};
	datapipes.forEach((datapipe: any) => {
		const dp = JSON.stringify(datapipe);
		dependencyMatrix[datapipe._id] = {
			myNodes: myNodesIDs.filter((id: any) => dp.indexOf(id) !== -1),
			plugins: pluginIDs.filter((id: any) => dp.indexOf(id) !== -1),
			mapperformulas: mapperformulaIDs.filter((id: any) => dp.indexOf(id) !== -1),
			dataservices: dataServiceIDs.filter((id: any) => dp.indexOf(id) !== -1),
			dataformats: dataformatIDs.filter((id: any) => dp.indexOf(id) !== -1),
			functions: functionIDs.filter((id: any) => dp.indexOf(id) !== -1),
			agents: agentIDs.filter((id: any) => dp.indexOf(id) !== -1),
			connectors: connectorIDs.filter((id: any) => dp.indexOf(id) !== -1),
			datapipes: datapipeIDs.filter((id: any) => dp.indexOf(id) !== -1 && id !== datapipe._id),
			libraries: []
		};
	});
	return dependencyMatrix;
}

export function parseDataPipeAndFixAppName(input: any, appName: string) {
	let output = JSON.parse(JSON.stringify(input));
	output.nodes.forEach((node: any) => {
		if (node.type === "PLUGIN") {
			node.options.plugin.app = appName;
		}
		if (node.mappings && node.mappings.length > 0) {
			node.mappings.forEach((mapping: any) => {
				if (mapping.formulaConfig && mapping.formulaConfig.length > 0) {
					mapping.formulaConfig.forEach((formulaConfig: any) => {
						formulaConfig.app = appName;
					});
				}
			});
		}
	});
	return output;
}

export function parseAndFixDataPipes(datapipes: any[]): any[] {
	const plugins = readRestoreMap("plugins") || {};
	const myNodes = readRestoreMap("myNodes") || {};
	const mapperformulas = readRestoreMap("mapperFormulas") || {};
	const functions = readRestoreMap("functions") || {};
	const dataservices = readRestoreMap("dataservices") || {};
	const datapipeIDs = readRestoreMap("datapipes") || {};
	const dataformats = readRestoreMap("dataformats") || {};
	const connectors = readRestoreMap("connectors") || {};
	const agents = readRestoreMap("agents") || {};
	const agentIDsFromBackup = readBackupMap("agentIDs");
	const agentIDsFromRestore = readRestoreMap("agentIDs") || {};
	const dependencyMatrixOfDataPipe = readDependencyMatrixOfDataPipes();
	let fixedDataPipes: any[] = [];
	datapipes.forEach((datapipe: any) => {
		let dp = JSON.stringify(datapipe);
		const dependencyMatrix = dependencyMatrixOfDataPipe[datapipe._id];
		(dependencyMatrix.myNodes || []).forEach((myNodeId: any) => dp = dp.split(myNodeId).join(myNodes[myNodeId]));
		(dependencyMatrix.plugins || []).forEach((pluginId: any) => dp = dp.split(pluginId).join(plugins[pluginId]));
		(dependencyMatrix.mapperformulas || []).forEach((mapperformulaId: any) => dp = dp.split(mapperformulaId).join(mapperformulas[mapperformulaId]));
		(dependencyMatrix.dataservices || []).forEach((dataservicesId: any) => dp = dp.split(dataservicesId).join(dataservices[dataservicesId]));
		(dependencyMatrix.dataformats || []).forEach((dataformatId: any) => dp = dp.split(dataformatId).join(dataformats[dataformatId]));
		(dependencyMatrix.functions || []).forEach((functionId: any) => dp = dp.split(functionId).join(functions[functionId]));
		(dependencyMatrix.datapipes || []).forEach((datapipeID: any) => dp = dp.split(datapipeID).join(datapipeIDs[datapipeID]));
		(dependencyMatrix.agents || []).forEach((agentId: any) => {
			dp = dp.split(agentId).join(agents[agentId]);
			let backupAgentId = agentIDsFromBackup[agentId];
			dp = dp.split(backupAgentId).join(agentIDsFromRestore[backupAgentId]);
		});
		(dependencyMatrix.connectors || []).forEach((connectorId: any) => dp = dp.split(connectorId).join(connectors[connectorId]));
		fixedDataPipes.push(JSON.parse(dp));
	});
	return fixedDataPipes;
}