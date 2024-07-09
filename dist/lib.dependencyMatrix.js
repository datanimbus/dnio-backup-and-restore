"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateDependencyMatrix = void 0;
const lib_db_1 = require("./lib.db");
let dependencyMatrixOfDataServices = {};
let dependencyMatrixOfDataPipes = {};
function updateTheDependencyMatrixOfDataServices(id, newDependencyMatrix) {
    const data = dependencyMatrixOfDataServices[id];
    if (data.dataservices && data.dataservices.length == 0)
        return data;
    data.dataservices.forEach((ds) => {
        let childDSDM = dependencyMatrixOfDataServices[ds];
        // merge connectors
        childDSDM.connectors.filter((id) => newDependencyMatrix.connectors.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.connectors.push(id));
        // merge libraries
        childDSDM.libraries.filter((id) => newDependencyMatrix.libraries.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.libraries.push(id));
        // merge functions
        childDSDM.functions.filter((id) => newDependencyMatrix.functions.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.functions.push(id));
        // merge dataservices
        let missingDataServices = childDSDM.dataservices.filter((ds) => newDependencyMatrix.dataservices.indexOf(ds) == -1);
        if (missingDataServices.length > 0) {
            missingDataServices.forEach((ds) => newDependencyMatrix.dataservices.push(ds));
            newDependencyMatrix = updateTheDependencyMatrixOfDataServices(ds, newDependencyMatrix);
        }
    });
    return newDependencyMatrix;
}
function updateTheDependencyMatrixOfDataPipes(id, newDependencyMatrix) {
    const data = dependencyMatrixOfDataPipes[id];
    if (data.dataservices && data.dataservices.length == 0
        && data.datapipes && data.datapipes.length == 0)
        return data;
    data.dataservices.forEach((ds) => {
        let dependencyMatrixOfDataService = updateTheDependencyMatrixOfDataServices(ds, dependencyMatrixOfDataServices[ds]);
        // merge connectors
        dependencyMatrixOfDataService.connectors
            .filter((id) => newDependencyMatrix.connectors.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.connectors.push(id));
        // merge libraries
        dependencyMatrixOfDataService.libraries
            .filter((id) => newDependencyMatrix.libraries.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.libraries.push(id));
        // merge functions
        dependencyMatrixOfDataService.functions
            .filter((id) => newDependencyMatrix.functions.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.functions.push(id));
        // merge dataservices
        dependencyMatrixOfDataService.dataservices
            .filter((id) => newDependencyMatrix.dataservices.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.dataservices.push(id));
    });
    data.datapipes.forEach((dp) => {
        let childDPDM = dependencyMatrixOfDataPipes[dp];
        // merge plugins
        childDPDM.plugins
            .filter((id) => newDependencyMatrix.plugins.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.plugins.push(id));
        // merge myNodes
        childDPDM.myNodes
            .filter((id) => newDependencyMatrix.myNodes.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.myNodes.push(id));
        // merge libraries
        childDPDM.libraries
            .filter((id) => newDependencyMatrix.libraries.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.libraries.push(id));
        // merge mapperformulas
        childDPDM.mapperformulas
            .filter((id) => newDependencyMatrix.mapperformulas.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.mapperformulas.push(id));
        // merge dataformats
        childDPDM.dataformats
            .filter((id) => newDependencyMatrix.dataformats.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.dataformats.push(id));
        // merge functions
        childDPDM.functions
            .filter((id) => newDependencyMatrix.functions.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.functions.push(id));
        // merge agents
        childDPDM.agents
            .filter((id) => newDependencyMatrix.agents.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.agents.push(id));
        // merge connectors
        childDPDM.connectors
            .filter((id) => newDependencyMatrix.connectors.indexOf(id) == -1)
            .forEach((id) => newDependencyMatrix.connectors.push(id));
        // merge dataservices
        let missingDataServices = childDPDM.dataservices.filter((ds) => newDependencyMatrix.dataservices.indexOf(ds) == -1);
        if (missingDataServices.length > 0) {
            missingDataServices.forEach((ds) => {
                newDependencyMatrix.dataservices.push(ds);
                let dependencyMatrixOfDataService = updateTheDependencyMatrixOfDataServices(ds, dependencyMatrixOfDataServices[ds]);
                // merge connectors
                dependencyMatrixOfDataService.connectors
                    .filter((id) => newDependencyMatrix.connectors.indexOf(id) == -1)
                    .forEach((id) => newDependencyMatrix.connectors.push(id));
                // merge libraries
                dependencyMatrixOfDataService.libraries
                    .filter((id) => newDependencyMatrix.libraries.indexOf(id) == -1)
                    .forEach((id) => newDependencyMatrix.libraries.push(id));
                // merge functions
                dependencyMatrixOfDataService.functions
                    .filter((id) => newDependencyMatrix.functions.indexOf(id) == -1)
                    .forEach((id) => newDependencyMatrix.functions.push(id));
                // merge dataservices
                dependencyMatrixOfDataService.dataservices
                    .filter((id) => newDependencyMatrix.dataservices.indexOf(id) == -1)
                    .forEach((id) => newDependencyMatrix.dataservices.push(id));
            });
        }
        // merge datapipes
        let missingDataPipes = childDPDM.datapipes.filter((dp) => newDependencyMatrix.datapipes.indexOf(dp) == -1);
        if (missingDataPipes.length > 0) {
            missingDataPipes.forEach((dp) => newDependencyMatrix.datapipes.push(dp));
            newDependencyMatrix = updateTheDependencyMatrixOfDataPipes(dp, newDependencyMatrix);
        }
    });
    return newDependencyMatrix;
}
function recalculateDependencyMatrix() {
    dependencyMatrixOfDataServices = (0, lib_db_1.readDependencyMatrixOfDataServices)();
    dependencyMatrixOfDataPipes = (0, lib_db_1.readDependencyMatrixOfDataPipes)();
    // Recalcuate the dependency matrix of data services
    Object.keys(dependencyMatrixOfDataServices).forEach((dsId) => {
        dependencyMatrixOfDataServices[dsId] = updateTheDependencyMatrixOfDataServices(dsId, dependencyMatrixOfDataServices[dsId]);
    });
    // Recalcuate the dependency matrix of data pipes
    Object.keys(dependencyMatrixOfDataPipes).forEach((dpId) => {
        dependencyMatrixOfDataPipes[dpId] = updateTheDependencyMatrixOfDataPipes(dpId, dependencyMatrixOfDataPipes[dpId]);
    });
    (0, lib_db_1.backupDependencyMatrixOfDataService)(dependencyMatrixOfDataServices);
    (0, lib_db_1.backupDependencyMatrixOfDataPipe)(dependencyMatrixOfDataPipes);
}
exports.recalculateDependencyMatrix = recalculateDependencyMatrix;
