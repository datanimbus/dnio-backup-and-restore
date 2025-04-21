import { backupDependencyMatrixOfDataPipe, backupDependencyMatrixOfDataService, readDependencyMatrixOfDataPipes, readDependencyMatrixOfDataServices } from "./lib.db";

let dependencyMatrixOfDataServices: any = {};
let dependencyMatrixOfDataPipes: any = {};

function updateTheDependencyMatrixOfDataServices(id: string, newDependencyMatrix: any) {
	try {
		const data = dependencyMatrixOfDataServices[id];
		if (data && data.dataservices && data.dataservices.length == 0) return data;

		data.dataservices.forEach((ds: string) => {
			let childDSDM = dependencyMatrixOfDataServices[ds];
			// merge connectors
			childDSDM.connectors.filter((id: string) => newDependencyMatrix.connectors.indexOf(id) == -1)
				.forEach((id: string) => newDependencyMatrix.connectors.push(id));
			// merge libraries
			childDSDM.libraries.filter((id: string) => newDependencyMatrix.libraries.indexOf(id) == -1)
				.forEach((id: string) => newDependencyMatrix.libraries.push(id));
			// merge functions
			childDSDM.functions.filter((id: string) => newDependencyMatrix.functions.indexOf(id) == -1)
				.forEach((id: string) => newDependencyMatrix.functions.push(id));
			// merge dataservices
			let missingDataServices = childDSDM.dataservices.filter((ds: string) => newDependencyMatrix.dataservices.indexOf(ds) == -1);
			if (missingDataServices.length > 0) {
				missingDataServices.forEach((ds: string) => newDependencyMatrix.dataservices.push(ds));
				newDependencyMatrix = updateTheDependencyMatrixOfDataServices(ds, newDependencyMatrix);
			}
		});
		return newDependencyMatrix;
	} catch (e) {
		console.log(e)
	}
}

function updateTheDependencyMatrixOfDataPipes(id: string, newDependencyMatrix: any) {
	const data = dependencyMatrixOfDataPipes[id];
	if (data.dataservices && data.dataservices.length == 0
		&& data.datapipes && data.datapipes.length == 0) return data;

	data.dataservices.forEach((ds: string) => {
		let dependencyMatrixOfDataService = updateTheDependencyMatrixOfDataServices(ds, dependencyMatrixOfDataServices[ds]);
		// merge connectors
		dependencyMatrixOfDataService.connectors
			.filter((id: string) => newDependencyMatrix.connectors.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.connectors.push(id));
		// merge libraries
		dependencyMatrixOfDataService.libraries
			.filter((id: string) => newDependencyMatrix.libraries.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.libraries.push(id));
		// merge functions
		dependencyMatrixOfDataService.functions
			.filter((id: string) => newDependencyMatrix.functions.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.functions.push(id));
		// merge dataservices
		dependencyMatrixOfDataService.dataservices
			.filter((id: string) => newDependencyMatrix.dataservices.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.dataservices.push(id));
	});

	data.datapipes.forEach((dp: string) => {
		let childDPDM = dependencyMatrixOfDataPipes[dp];
		// merge plugins
		childDPDM.plugins
			.filter((id: string) => newDependencyMatrix.plugins.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.plugins.push(id));
		// merge myNodes
		childDPDM.myNodes
			.filter((id: string) => newDependencyMatrix.myNodes.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.myNodes.push(id));
		// merge libraries
		childDPDM.libraries
			.filter((id: string) => newDependencyMatrix.libraries.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.libraries.push(id));
		// merge mapperformulas
		childDPDM.mapperformulas
			.filter((id: string) => newDependencyMatrix.mapperformulas.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.mapperformulas.push(id));
		// merge dataformats
		childDPDM.dataformats
			.filter((id: string) => newDependencyMatrix.dataformats.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.dataformats.push(id));
		// merge functions
		childDPDM.functions
			.filter((id: string) => newDependencyMatrix.functions.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.functions.push(id));
		// merge agents
		childDPDM.agents
			.filter((id: string) => newDependencyMatrix.agents.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.agents.push(id));
		// merge connectors
		childDPDM.connectors
			.filter((id: string) => newDependencyMatrix.connectors.indexOf(id) == -1)
			.forEach((id: string) => newDependencyMatrix.connectors.push(id));
		// merge dataservices
		let missingDataServices = childDPDM.dataservices.filter((ds: string) => newDependencyMatrix.dataservices.indexOf(ds) == -1);
		if (missingDataServices.length > 0) {
			missingDataServices.forEach((ds: string) => {
				newDependencyMatrix.dataservices.push(ds);
				let dependencyMatrixOfDataService = updateTheDependencyMatrixOfDataServices(ds, dependencyMatrixOfDataServices[ds]);
				// merge connectors
				dependencyMatrixOfDataService.connectors
					.filter((id: string) => newDependencyMatrix.connectors.indexOf(id) == -1)
					.forEach((id: string) => newDependencyMatrix.connectors.push(id));
				// merge libraries
				dependencyMatrixOfDataService.libraries
					.filter((id: string) => newDependencyMatrix.libraries.indexOf(id) == -1)
					.forEach((id: string) => newDependencyMatrix.libraries.push(id));
				// merge functions
				dependencyMatrixOfDataService.functions
					.filter((id: string) => newDependencyMatrix.functions.indexOf(id) == -1)
					.forEach((id: string) => newDependencyMatrix.functions.push(id));
				// merge dataservices
				dependencyMatrixOfDataService.dataservices
					.filter((id: string) => newDependencyMatrix.dataservices.indexOf(id) == -1)
					.forEach((id: string) => newDependencyMatrix.dataservices.push(id));
			});
		}
		// merge datapipes
		let missingDataPipes = childDPDM.datapipes.filter((dp: string) => newDependencyMatrix.datapipes.indexOf(dp) == -1);
		if (missingDataPipes.length > 0) {
			missingDataPipes.forEach((dp: string) => newDependencyMatrix.datapipes.push(dp));
			newDependencyMatrix = updateTheDependencyMatrixOfDataPipes(dp, newDependencyMatrix);
		}
	});
	return newDependencyMatrix;
}

export function recalculateDependencyMatrix() {
	dependencyMatrixOfDataServices = readDependencyMatrixOfDataServices();
	dependencyMatrixOfDataPipes = readDependencyMatrixOfDataPipes();
	// Recalcuate the dependency matrix of data services
	Object.keys(dependencyMatrixOfDataServices).forEach((dsId: string) => {
		dependencyMatrixOfDataServices[dsId] = updateTheDependencyMatrixOfDataServices(dsId, dependencyMatrixOfDataServices[dsId]);
	});

	// Recalcuate the dependency matrix of data pipes
	Object.keys(dependencyMatrixOfDataPipes).forEach((dpId: string) => {
		dependencyMatrixOfDataPipes[dpId] = updateTheDependencyMatrixOfDataPipes(dpId, dependencyMatrixOfDataPipes[dpId]);
	});
	backupDependencyMatrixOfDataService(dependencyMatrixOfDataServices);
	backupDependencyMatrixOfDataPipe(dependencyMatrixOfDataPipes);
}