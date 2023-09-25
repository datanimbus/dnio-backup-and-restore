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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.put = exports.post = exports.get = exports.getApps = exports.logout = exports.login = void 0;
const got_1 = __importDefault(require("got"));
const lib_misc_1 = require("./lib.misc");
var logger = global.logger;
function login(config) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.trace(JSON.stringify(config));
        try {
            const loginResponse = yield got_1.default.post(`${global.host}/api/a/rbac/auth/login`, { json: config }).json();
            (0, lib_misc_1.printInfo)("Logged into data.stack.");
            let message = `User ${loginResponse._id} is not a super admin. You will not be able to backup Mapper Functions, Plugins and NPM Libraries.`;
            if (loginResponse.isSuperAdmin)
                message = `User ${loginResponse._id} is a super admin.`;
            global.token = loginResponse.token;
            global.isSuperAdmin = loginResponse.isSuperAdmin;
            (0, lib_misc_1.printInfo)(message);
        }
        catch (e) {
            console.log(e);
            (0, lib_misc_1.printError)("Unable to login to data.stack server");
            logger.error(e.message);
            process.exit(1);
        }
    });
}
exports.login = login;
function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield got_1.default.delete(`${global.host}/api/a/rbac/auth/logout`, {
                "headers": {
                    "Authorization": `JWT ${global.token}`
                }
            });
            (0, lib_misc_1.printInfo)("Logged out of data.stack.");
        }
        catch (e) {
            // printError("Unable to logout of data.stack server");
            logger.error(e.message);
        }
    });
}
exports.logout = logout;
function getApps() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let searchParams = new URLSearchParams();
            searchParams.append("count", "-1");
            searchParams.append("select", "_id");
            let apps = yield get("/api/a/rbac/admin/app", searchParams);
            logger.trace(JSON.stringify(apps));
            const sortedApps = apps.map((a) => a._id).sort();
            logger.debug(JSON.stringify(sortedApps));
            return sortedApps;
        }
        catch (e) {
            logger.error(e.message);
        }
    });
}
exports.getApps = getApps;
function get(endpoint, searchParams) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`GET ${global.host}${endpoint} :: ${searchParams}`);
        try {
            return yield got_1.default.get(`${global.host}${endpoint}`, {
                "headers": {
                    "Authorization": `JWT ${global.token}`
                },
                "searchParams": searchParams
            }).json()
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                (0, lib_misc_1.printError)(`Error on GET ${global.host}${endpoint}`);
                (0, lib_misc_1.printError)(`${e.response.statusCode} ${e.response.body}`);
            }));
        }
        catch (e) {
            logger.error(e);
            (0, lib_misc_1.printError)(`Error on GET ${global.host}${endpoint}`);
        }
    });
}
exports.get = get;
function post(endpoint, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`POST ${global.host}${endpoint}`);
        logger.info(`Payload - ${JSON.stringify(payload)}`);
        try {
            return yield got_1.default.post(`${global.host}${endpoint}`, {
                "headers": {
                    "Authorization": `JWT ${global.token}`
                },
                json: payload
            }).json()
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                (0, lib_misc_1.printError)(`Error on POST ${global.host}${endpoint}`);
                (0, lib_misc_1.printError)(`${e.response.statusCode} ${e.response.body}`);
            }));
        }
        catch (e) {
            logger.error(e);
            (0, lib_misc_1.printError)(`Error on POST ${global.host}${endpoint}`);
        }
    });
}
exports.post = post;
function put(endpoint, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`PUT ${global.host}${endpoint}`);
        logger.info(`Payload - ${JSON.stringify(payload)}`);
        try {
            return yield got_1.default.put(`${global.host}${endpoint}`, {
                "headers": {
                    "Authorization": `JWT ${global.token}`
                },
                json: payload
            }).json()
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                (0, lib_misc_1.printError)(`Error on PUT ${global.host}${endpoint}`);
                (0, lib_misc_1.printError)(`${e.response.statusCode} ${e.response.body}`);
            }));
        }
        catch (e) {
            (0, lib_misc_1.printError)(`Error on PUT ${global.host}${endpoint}`);
            logger.error(e);
        }
    });
}
exports.put = put;
function del(endpoint) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`DELETE ${global.host}${endpoint}`);
        try {
            return yield got_1.default.delete(`${global.host}${endpoint}`, {
                "headers": {
                    "Authorization": `JWT ${global.token}`
                }
            }).json()
                .catch((e) => __awaiter(this, void 0, void 0, function* () {
                (0, lib_misc_1.printError)(`Error on DELETE ${global.host}${endpoint}`);
                (0, lib_misc_1.printError)(`${e.response.statusCode} ${e.response.body}`);
            }));
        }
        catch (e) {
            logger.error(e);
            (0, lib_misc_1.printError)(`Error on DELETE ${global.host}${endpoint}`);
        }
    });
}
exports.del = del;
