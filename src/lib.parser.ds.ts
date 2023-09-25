import { readRestoreMap, readDependencyMatrixOfDataServices } from "./lib.db";

let logger = global.logger;

export function generateSampleDataSerivce(name: string, selectedApp: String) {
	return { "name": name, "description": null, "app": selectedApp };
}

function getUniqueElements(inputArray: any[]) {
	let outputArray: any[] = [];
	inputArray.forEach(elem => {
		if (outputArray.indexOf(elem) == -1) outputArray.push(elem);
	});
	return outputArray;
}


function findLibraries(def: any) {
	let librariesUsed: string[] = [];
	def.forEach((attr: any) => {
		if (attr.properties.schema) return librariesUsed.push(attr.properties.schema);
		if ((attr.type == "Object" || attr.type == "Array") && !attr.properties.schemaFree) {
			let returnValues = findLibraries(attr.definition);
			librariesUsed = librariesUsed.concat(returnValues);
		}
	});
	return librariesUsed;
}

function findFunctions(dataservice: any) {
	let functions: string[] = [];
	dataservice.workflowHooks.postHooks.submit.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.workflowHooks.postHooks.approve.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.workflowHooks.postHooks.discard.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.workflowHooks.postHooks.reject.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.workflowHooks.postHooks.rework.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.webHooks.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	dataservice.preHooks.forEach((hook: any) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
	return functions;
}

function repairRelationWithLibrary(definition: any, librariesUsed: string[], libraryMap: any) {
	if (librariesUsed.length == 0) {
		logger.info("No libraries foud");
		return definition;
	}
	let stringifiedDefinition = JSON.stringify(definition);
	logger.info(`Libraries used : ${librariesUsed.join(",")}`);
	librariesUsed.forEach(lib => {
		stringifiedDefinition = stringifiedDefinition.split(lib).join(libraryMap[lib]);
	});
	return JSON.parse(stringifiedDefinition);
}

function repairRelationWithUser(parent: string[], definition: any) {
	if (!definition) return definition;
	definition.forEach((attr: any) => {
		if (attr.type == "User") {
			logger.info(`${parent.join(">")} : Default value of '${attr.properties.name}' removed.`);
			delete attr.properties.default;
		}
		if (attr.type == "Object" || attr.type == "Array") {
			attr.definition = repairRelationWithUser(parent.concat(attr.properties.name), attr.definition);
		}
	});
	return definition;
}

function repairRelationships(parent: any[], definition: any): any {
	if (!definition) return definition;
	definition.forEach((attr: any) => {
		if (attr.properties.relatedTo) {
			logger.info(`${parent.join(">")} : Default value of '${attr.properties.name}' removed`);
			delete attr.properties.default;
		}
		if (attr.type == "Object" || attr.type == "Array") {
			attr.definition = repairRelationships(parent.concat(attr.properties.name), attr.definition);
		}
	});
	return definition;
}

function repairRelationshipIDs(definition: any, dependencies: string[], dataserviceMap: any): any {
	if (!definition) return definition;
	let stringifiedDefinition = JSON.stringify(definition);
	dependencies.forEach(dataserviceID => {
		stringifiedDefinition = stringifiedDefinition.split(dataserviceID).join(dataserviceMap[dataserviceID]);
	});
	return JSON.parse(stringifiedDefinition);
}

function repairFunctions(dataservice: any, functionMap: any, functionURLMap: any) {
	dataservice.workflowHooks.postHooks.submit.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.workflowHooks.postHooks.approve.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.workflowHooks.postHooks.discard.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.workflowHooks.postHooks.reject.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.workflowHooks.postHooks.rework.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.webHooks.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	dataservice.preHooks.forEach((hook: any) => {
		if (hook.type == "function") {
			hook.refId = functionMap[hook.refId];
			hook.url = functionURLMap[hook.refId];
		}
	});
	return dataservice;
}

function repairConnectors(dataservice: any, connectorMap: any) {
	dataservice.connectors.data._id = connectorMap[dataservice.connectors.data._id];
	dataservice.connectors.file._id = connectorMap[dataservice.connectors.file._id];
	return dataservice;
}

export function parseAndFixDataServices(dataservices: any[]): any[] {
	let libraryMap = readRestoreMap("libraries");
	let functionMap = readRestoreMap("functions");
	let functionURLMap = readRestoreMap("functionURL");
	let connectorMap = readRestoreMap("connectors");
	let dataserviceMap = readRestoreMap("dataservices");
	logger.info(`Dataservice ID Map : ${JSON.stringify(dataserviceMap)}`);
	let dependencyMatrix = readDependencyMatrixOfDataServices();
	logger.info(`Dataservice dependency matrix : ${JSON.stringify(dependencyMatrix)}`);
	dataservices.forEach((dataservice: any) => {
		delete dataservice.version;
		delete dataservice.versionValidity;
		delete dataservice.permanentDeleteData;
		delete dataservice.disableInsights;
		delete dataservice.enableSearchIndex;
		delete dataservice.attributeCount;
		delete dataservice.collectionName;
		delete dataservice.instances;
		delete dataservice.status;

		logger.info(`${dataservice.name} : Find and repair libraries`);
		dataservice.definition = repairRelationWithLibrary(dataservice.definition, dependencyMatrix[dataservice._id].libraries, libraryMap);

		logger.info(`${dataservice.name} : Find and repair connectors`);
		dataservice = repairConnectors(dataservice, connectorMap);

		logger.info(`${dataservice.name} : Find and repair User relations`);
		dataservice.definition = repairRelationWithUser([], dataservice.definition);

		logger.info(`${dataservice.name} : Find and repair dataservice relationships with default values`);
		dataservice.definition = repairRelationships([], dataservice.definition);

		logger.info(`${dataservice.name} : Find and repair dataservice relationship IDs`);
		dataservice.definition = repairRelationshipIDs(dataservice.definition, dependencyMatrix[dataservice._id].dataservices, dataserviceMap);

		if (dataservice.relatedSchemas) {
			if (dataservice.relatedSchemas.incoming) dataservice.relatedSchemas.incoming = [];
			if (dataservice.relatedSchemas.outgoing) dataservice.relatedSchemas.outgoing = [];
		}

		dataservice = repairFunctions(dataservice, functionMap, functionURLMap);

	});
	return dataservices;
}

export function buildDependencyMatrixForDataServices(dataservices: any[]) {
	let dependencyMatrix: any = {};
	dataservices.forEach((dataservice: any) => {
		dependencyMatrix[dataservice._id] = { dataservices: [], libraries: [], functions: [] };
		if (dataservice.relatedSchemas) {
			dataservice.relatedSchemas.outgoing.forEach((outgoing: any) => {
				if (dependencyMatrix[dataservice._id].dataservices.indexOf(outgoing.service) == -1) dependencyMatrix[dataservice._id].dataservices.push(outgoing.service);
			});
		}
		// get list of libraries
		let libraries = dataservice.definition ? findLibraries(dataservice.definition) : [];
		libraries = getUniqueElements(libraries);
		dependencyMatrix[dataservice._id].libraries = libraries;
		// get list of functions
		dependencyMatrix[dataservice._id].functions = findFunctions(dataservice);
	});
	return dependencyMatrix;
}