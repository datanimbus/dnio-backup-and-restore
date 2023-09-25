import got, { HTTPError } from "got";
import { printError, printInfo } from "./lib.misc";

var logger = global.logger;

export async function login(config: any) {
	logger.trace(JSON.stringify(config));
	try {
		const loginResponse: any = await got.post(`${global.host}/api/a/rbac/auth/login`, { json: config }).json();
		printInfo("Logged into data.stack.");
		let message = `User ${loginResponse._id} is not a super admin. You will not be able to backup Mapper Functions, Plugins and NPM Libraries.`;
		if (loginResponse.isSuperAdmin) message = `User ${loginResponse._id} is a super admin.`;
		global.token = loginResponse.token;
		global.isSuperAdmin = loginResponse.isSuperAdmin;
		printInfo(message);
	} catch (e: any) {
		console.log(e);
		printError("Unable to login to data.stack server");
		logger.error(e.message);
		process.exit(1);
	}
}

export async function logout() {
	try {
		await got.delete(`${global.host}/api/a/rbac/auth/logout`, {
			"headers": {
				"Authorization": `JWT ${global.token}`
			}
		});
		printInfo("Logged out of data.stack.");
	} catch (e: any) {
		// printError("Unable to logout of data.stack server");
		logger.error(e.message);
	}
}

export async function getApps() {
	try {
		let searchParams = new URLSearchParams();
		searchParams.append("count", "-1");
		searchParams.append("select", "_id");
		let apps = await get("/api/a/rbac/admin/app", searchParams);
		logger.trace(JSON.stringify(apps));
		const sortedApps = apps.map((a: any) => a._id).sort();
		logger.debug(JSON.stringify(sortedApps));
		return sortedApps;
	} catch (e: any) {
		logger.error(e.message);
	}
}

export async function get(endpoint: string, searchParams: URLSearchParams): Promise<any> {
	logger.info(`GET ${global.host}${endpoint} :: ${searchParams}`);
	try {
		return await got.get(`${global.host}${endpoint}`, {
			"headers": {
				"Authorization": `JWT ${global.token}`
			},
			"searchParams": searchParams
		}).json()
			.catch(async (e) => {
				printError(`Error on GET ${global.host}${endpoint}`);
				printError(`${e.response.statusCode} ${e.response.body}`);
			});
	} catch (e) {
		logger.error(e);
		printError(`Error on GET ${global.host}${endpoint}`);
	}
}

export async function post(endpoint: string, payload: any): Promise<any> {
	logger.info(`POST ${global.host}${endpoint}`);
	logger.info(`Payload - ${JSON.stringify(payload)}`);
	try {
		return await got.post(`${global.host}${endpoint}`, {
			"headers": {
				"Authorization": `JWT ${global.token}`
			},
			json: payload
		}).json()
			.catch(async (e: HTTPError) => {
				printError(`Error on POST ${global.host}${endpoint}`);
				printError(`${e.response.statusCode} ${e.response.body}`);
			});
	} catch (e) {
		logger.error(e);
		printError(`Error on POST ${global.host}${endpoint}`);
	}
}

export async function put(endpoint: string, payload: any): Promise<any> {
	logger.info(`PUT ${global.host}${endpoint}`);
	logger.info(`Payload - ${JSON.stringify(payload)}`);
	try {
		return await got.put(`${global.host}${endpoint}`, {
			"headers": {
				"Authorization": `JWT ${global.token}`
			},
			json: payload
		}).json()
			.catch(async (e) => {
				printError(`Error on PUT ${global.host}${endpoint}`);
				printError(`${e.response.statusCode} ${e.response.body}`);
			});
	} catch (e) {
		printError(`Error on PUT ${global.host}${endpoint}`);
		logger.error(e);
	}
}

export async function del(endpoint: string): Promise<any> {
	logger.info(`DELETE ${global.host}${endpoint}`);
	try {
		return await got.delete(`${global.host}${endpoint}`, {
			"headers": {
				"Authorization": `JWT ${global.token}`
			}
		}).json()
			.catch(async (e) => {
				printError(`Error on DELETE ${global.host}${endpoint}`);
				printError(`${e.response.statusCode} ${e.response.body}`);
			});
	} catch (e) {
		logger.error(e);
		printError(`Error on DELETE ${global.host}${endpoint}`);
	}
}