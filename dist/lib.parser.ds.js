"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDependencyMatrixForDataServices = exports.parseAndFixDataServices = exports.generateSampleDataSerivce = void 0;
const lib_db_1 = require("./lib.db");
let logger = global.logger;
function generateSampleDataSerivce(name, selectedApp) {
    return { "name": name, "description": null, "app": selectedApp };
}
exports.generateSampleDataSerivce = generateSampleDataSerivce;
function getUniqueElements(inputArray) {
    let outputArray = [];
    inputArray.forEach(elem => {
        if (outputArray.indexOf(elem) == -1)
            outputArray.push(elem);
    });
    return outputArray;
}
function findLibraries(def) {
    let librariesUsed = [];
    def.forEach((attr) => {
        if (attr.properties.schema)
            return librariesUsed.push(attr.properties.schema);
        if ((attr.type == "Object" || attr.type == "Array") && !attr.properties.schemaFree) {
            let returnValues = findLibraries(attr.definition);
            librariesUsed = librariesUsed.concat(returnValues);
        }
    });
    return librariesUsed;
}
function findFunctions(dataservice) {
    let functions = [];
    dataservice.workflowHooks.postHooks.submit.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.workflowHooks.postHooks.approve.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.workflowHooks.postHooks.discard.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.workflowHooks.postHooks.reject.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.workflowHooks.postHooks.rework.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.webHooks.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    dataservice.preHooks.forEach((hook) => (hook.type == "function" && functions.indexOf(hook.refId) == -1) ? functions.push(hook.refId) : null);
    return functions;
}
function repairRelationWithLibrary(definition, librariesUsed, libraryMap) {
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
function repairRelationWithUser(parent, definition) {
    if (!definition)
        return definition;
    definition.forEach((attr) => {
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
function repairRelationships(parent, definition) {
    if (!definition)
        return definition;
    definition.forEach((attr) => {
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
function repairRelationshipIDs(definition, dependencies, dataserviceMap) {
    if (!definition)
        return definition;
    let stringifiedDefinition = JSON.stringify(definition);
    dependencies.forEach(dataserviceID => {
        stringifiedDefinition = stringifiedDefinition.split(dataserviceID).join(dataserviceMap[dataserviceID]);
    });
    return JSON.parse(stringifiedDefinition);
}
function repairFunctions(dataservice, functionMap, functionURLMap) {
    dataservice.workflowHooks.postHooks.submit.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.workflowHooks.postHooks.approve.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.workflowHooks.postHooks.discard.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.workflowHooks.postHooks.reject.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.workflowHooks.postHooks.rework.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.webHooks.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    dataservice.preHooks.forEach((hook) => {
        if (hook.type == "function") {
            hook.refId = functionMap[hook.refId];
            hook.url = functionURLMap[hook.refId];
        }
    });
    return dataservice;
}
function repairConnectors(dataservice, connectorMap) {
    dataservice.connectors.data._id = connectorMap[dataservice.connectors.data._id];
    dataservice.connectors.file._id = connectorMap[dataservice.connectors.file._id];
    return dataservice;
}
function parseAndFixDataServices(dataservices) {
    let libraryMap = (0, lib_db_1.readRestoreMap)("libraries");
    let functionMap = (0, lib_db_1.readRestoreMap)("functions");
    let functionURLMap = (0, lib_db_1.readRestoreMap)("functionURL");
    let connectorMap = (0, lib_db_1.readRestoreMap)("connectors");
    let dataserviceMap = (0, lib_db_1.readRestoreMap)("dataservices");
    logger.info(`Dataservice ID Map : ${JSON.stringify(dataserviceMap)}`);
    let dependencyMatrix = (0, lib_db_1.readDependencyMatrixOfDataServices)();
    logger.info(`Dataservice dependency matrix : ${JSON.stringify(dependencyMatrix)}`);
    dataservices.forEach((dataservice) => {
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
            if (dataservice.relatedSchemas.incoming)
                dataservice.relatedSchemas.incoming = [];
            if (dataservice.relatedSchemas.outgoing)
                dataservice.relatedSchemas.outgoing = [];
        }
        dataservice = repairFunctions(dataservice, functionMap, functionURLMap);
    });
    return dataservices;
}
exports.parseAndFixDataServices = parseAndFixDataServices;
function buildDependencyMatrixForDataServices(dataservices) {
    let dependencyMatrix = {};
    dataservices.forEach((dataservice) => {
        dependencyMatrix[dataservice._id] = { dataservices: [], libraries: [], functions: [] };
        if (dataservice.relatedSchemas) {
            dataservice.relatedSchemas.outgoing.forEach((outgoing) => {
                if (dependencyMatrix[dataservice._id].dataservices.indexOf(outgoing.service) == -1)
                    dependencyMatrix[dataservice._id].dataservices.push(outgoing.service);
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
exports.buildDependencyMatrixForDataServices = buildDependencyMatrixForDataServices;
