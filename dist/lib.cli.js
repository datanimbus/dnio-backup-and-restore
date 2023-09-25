"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selections = exports.customise = exports.selectApp = exports.startMenu = exports.promptUser = exports.validateCLIParams = void 0;
const lib_misc_1 = require("./lib.misc");
const inquirer_1 = require("inquirer");
(0, inquirer_1.registerPrompt)("autocomplete", require("inquirer-autocomplete-prompt"));
var logger = global.logger;
const mainMenu = [
    new inquirer_1.Separator(),
    "Backup",
    "Restore",
    new inquirer_1.Separator("--- Utils ---"),
    "Clear All",
];
function validateCLIParams() {
    return __awaiter(this, void 0, void 0, function* () {
        let credentials = {
            "host": "",
            "username": "",
            "password": "",
        };
        if (logger.level.toString() == "TRACE")
            credentials.trace = true;
        credentials.host = process.env.DS_BR_HOST;
        if ((0, lib_misc_1.isNotAnAcceptableValue)(process.env.DS_BR_HOST)) {
            logger.info("Env var DS_BR_HOST not set or is invalid.");
            credentials.host = yield promptUser("Host", null, false);
        }
        credentials.username = process.env.DS_BR_USERNAME;
        if ((0, lib_misc_1.isNotAnAcceptableValue)(process.env.DS_BR_USERNAME)) {
            logger.info("Env var DS_BR_USERNAME not set or is invalid.");
            credentials.username = yield promptUser("Username", null, false);
        }
        credentials.password = process.env.DS_BR_PASSWORD;
        if ((0, lib_misc_1.isNotAnAcceptableValue)(process.env.DS_BR_PASSWORD)) {
            logger.info("Env var DS_BR_PASSWORD not set or is invalid.");
            credentials.password = yield promptUser("Password", null, true);
        }
        global.host = credentials.host || "";
        (0, lib_misc_1.printInfo)(`Host      : ${credentials.host}`);
        (0, lib_misc_1.printInfo)(`Username  : ${credentials.username}`);
        logger.trace(`Credentials : ${JSON.stringify(credentials)}`);
        return credentials;
    });
}
exports.validateCLIParams = validateCLIParams;
function promptUser(message, defaultValue, isPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, inquirer_1.prompt)([
            {
                type: isPassword ? "password" : "input",
                name: "value",
                message: `${message}>`,
                default: defaultValue
            }
        ]).then(data => data.value);
    });
}
exports.promptUser = promptUser;
function startMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, inquirer_1.prompt)([{
                type: "list",
                name: "mode",
                message: ">",
                choices: mainMenu,
                pageSize: mainMenu.length
            }]);
    });
}
exports.startMenu = startMenu;
function selectApp(apps) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, inquirer_1.prompt)([{
                type: "autocomplete",
                name: "appName",
                message: "Select app: ",
                pageSize: 5,
                source: (_ans, _input) => {
                    _input = _input || "";
                    return new Promise(_res => _res(apps.filter((_n) => _n.toLowerCase().indexOf(_input) > -1)));
                }
            }]).then(_d => {
            logger.info(`Selected app : ${_d.appName}`);
            return _d.appName;
        });
    });
}
exports.selectApp = selectApp;
function customise() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, inquirer_1.prompt)([{
                type: "confirm",
                name: "mode",
                message: "Do you want to customise the backup?",
                default: false
            }]).then(_d => {
            logger.info(`Customization -  : ${_d.mode}`);
            return _d.mode;
        });
    });
}
exports.customise = customise;
function selections(type, choices) {
    return __awaiter(this, void 0, void 0, function* () {
        if (choices.length == 0)
            return Promise.resolve([]);
        return yield (0, inquirer_1.prompt)([{
                type: "checkbox",
                name: "selections",
                message: `Select ${type} to backup`,
                choices: choices
            }]).then(_d => {
            logger.info(`Selected ${type} to backup: ${_d.selections.join(", ") || "Nil"}`);
            return _d.selections;
        });
    });
}
exports.selections = selections;
