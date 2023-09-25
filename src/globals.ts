/* eslint-disable no-unused-vars */
import { Logger } from "log4js";

declare global {
	// var globalId = (new Date()).toISOString().replace(/:/gi, '-');
	var logger: Logger;
	var version: string;
	var host: string;
	var selectedApp: string;
	var backupFileName: string;
	var restoreFileName: string;
	var token: string;
	var isSuperAdmin: boolean;
}