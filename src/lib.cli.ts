import { isNotAnAcceptableValue, printInfo } from "./lib.misc";
import { registerPrompt, Separator, prompt } from "inquirer";
registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"));

var logger = global.logger;

const mainMenu = [
	new Separator(),
	"Backup",
	"Restore",
	new Separator("--- Utils ---"),
	"Clear All",
];

export async function validateCLIParams() {
	let credentials: any = {
		"host": "",
		"username": "",
		"password": "",
	};
	if (logger.level.toString() == "TRACE") credentials.trace = true;
	credentials.host = process.env.DS_BR_HOST;
	if (isNotAnAcceptableValue(process.env.DS_BR_HOST)) {
		logger.info("Env var DS_BR_HOST not set or is invalid.");
		credentials.host = await promptUser("Host", null, false);
	}

	credentials.username = process.env.DS_BR_USERNAME;
	if (isNotAnAcceptableValue(process.env.DS_BR_USERNAME)) {
		logger.info("Env var DS_BR_USERNAME not set or is invalid.");
		credentials.username = await promptUser("Username", null, false);
	}

	credentials.password = process.env.DS_BR_PASSWORD;
	if (isNotAnAcceptableValue(process.env.DS_BR_PASSWORD)) {
		logger.info("Env var DS_BR_PASSWORD not set or is invalid.");
		credentials.password = await promptUser("Password", null, true);
	}

	global.host = credentials.host || "";
	printInfo(`Host      : ${credentials.host}`);
	printInfo(`Username  : ${credentials.username}`);

	logger.trace(`Credentials : ${JSON.stringify(credentials)}`);

	return credentials;
}

export async function promptUser(message: string, defaultValue: string | null, isPassword: boolean): Promise<any> {
	return await prompt([
		{
			type: isPassword ? "password" : "input",
			name: "value",
			message: `${message}>`,
			default: defaultValue
		}
	]).then(data => data.value);
}

export async function startMenu() {
	return await prompt([{
		type: "list",
		name: "mode",
		message: ">",
		choices: mainMenu,
		pageSize: mainMenu.length
	}]);
}

export async function selectApp(apps: any) {
	return await prompt([{
		type: "autocomplete",
		name: "appName",
		message: "Select app: ",
		pageSize: 5,
		source: (_ans: any, _input: string) => {
			_input = _input || "";
			return new Promise(_res => _res(apps.filter((_n: string) => _n.toLowerCase().indexOf(_input) > -1)));
		}
	}]).then(_d => {
		logger.info(`Selected app : ${_d.appName}`);
		return _d.appName;
	});
}

export async function customise() {
	return await prompt([{
		type: "confirm",
		name: "mode",
		message: "Do you want to customise the backup?",
		default: false
	}]).then(_d => {
		logger.info(`Customization -  : ${_d.mode}`);
		return _d.mode;
	});
}

export async function selections(type: string, choices: string[]) {
	if (choices.length == 0) return Promise.resolve([]);
	return await prompt([{
		type: "checkbox",
		name: "selections",
		message: `Select ${type} to backup`,
		choices: choices
	}]).then(_d => {
		logger.info(`Selected ${type} to backup: ${_d.selections.join(", ") || "Nil"}`);
		return _d.selections;
	});
}