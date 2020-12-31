"use strict";
const axios = require('axios');
const qs = require('querystring');

class StringEncrypt {

	// WebAPI endpoint
	apiUrl = "https://www.stringencrypt.com/api.php";

	// list of supported languages and its mapping from VSCode -> StringEncrypt identifiers
	static supportedLanguages = {
		"javascript" : "js",
		"java" : "java",
		"csharp" : "csharp",
		"c" : "cpp",
		"cpp" : "cpp",
		"ruby" : "ruby",
		"powershell" : "powershell",
		"python" : "python",
		"autoit" : "autoit",
		"haskell" : "haskell",
		"masm" : "masm",
		"asm" : "masm",
		"delphi" : "delphi",
		"pascal" : "delphi"
	};

	static errorCodes = {

			// success
			ERROR_SUCCESS : 0,

			// label parameter is missing
			ERROR_EMPTY_LABEL : 1,

			// label length too long
			ERROR_LENGTH_LABEL : 2,

			// input string is missing
			ERROR_EMPTY_STRING : 3,
			ERROR_EMPTY_BYTES : 4,
			ERROR_EMPTY_INPUT : 5,

			// string length too long
			ERROR_LENGTH_STRING : 6,

			// programming language not supported
			ERROR_INVALID_LANG : 7,

			// invalid locale defined
			ERROR_INVALID_LOCALE : 8,

			// min number of encryption commands error
			ERROR_CMD_MIN : 9,

			// max number of encryption commands error
			ERROR_CMD_MAX : 10,

			// bytes/file length too long
			ERROR_LENGTH_BYTES : 11,

			// requested feature not available in demo mode
			ERROR_DEMO : 100
	};

	static errorCodesLabelsMap = new Map([

		// label parameter is missing
		[ this.errorCodes.ERROR_EMPTY_LABEL, "Please enter label name!" ],

		// input string is missing
		[ this.errorCodes.ERROR_EMPTY_STRING, "Please enter the string to encrypt!" ],
		[ this.errorCodes.ERROR_EMPTY_BYTES, "Your file is empty, it can't be encrypted!" ],
		[ this.errorCodes.ERROR_EMPTY_INPUT, "Huh, you did you get here, anyway specify the string or file to encrypt." ],

		// programming language not supported
		[ this.errorCodes.ERROR_INVALID_LANG, "Programming language is not supported, write to me about it." ],

		// features not supported in demo mode
		[ this.errorCodes.ERROR_DEMO, "This feature is not available in demo version. Please buy credits to use all of the features." ],

		// invalid locale defined
		[ this.errorCodes.ERROR_INVALID_LOCALE, "Invalid input string locale identifier, please choose from the available string locales." ],

		// label length error
		[ this.errorCodes.ERROR_LENGTH_LABEL, "Label string is too long!" ],

		// string length error
		[ this.errorCodes.ERROR_LENGTH_STRING, "String length is too long!" ],

		// bytes / file lenght error
		[ this.errorCodes.ERROR_LENGTH_BYTES, "File length is too long!"],

		// invalid number of minimum encryption commands
		[ this.errorCodes.ERROR_CMD_MIN, "Invalid number of minimum encryption commands!" ],

		// invalid number of maximum encryption commands
		[ this.errorCodes.ERROR_CMD_MAX, "Invalid number of maximum encryption commands!" ]
	]);

	/**
	* make an WebAPI request to the StringEncrypt.com interface
	*
	* @param {Object} formData
	* @param {CallableFunction} callbackSuccess
	* @param {CallableFunction} callbackError
	*/
	async webApiRequest(formData, callbackSuccess, callbackError) {

		// set the headers
		const headersConfig = {
				headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};

		// make a request
		return axios.post(this.apiUrl, qs.stringify(formData), headersConfig)
		.then(function (response) {

			callbackSuccess(response);
			//console.log(response);
		})
		.catch(function (error) {
			callbackError(error);
			//console.error(response);
		});
	}

	/**
	* login to the StringEncrypt.com Web API service with the activation code
	*
	* @param {string} activationCode
	* @param {CallableFunction} callbackSuccess
	* @param {CallableFunction} callbackError
	*/
	async checkActivationStatus(activationCode, callbackSuccess, callbackError) {

		//
		// setup options
		//
		var formData = {

			//
			// activation code, you can leave it empty for demo version, but keep in
			// mind that in demo versions there are many limitations)
			//
			code : activationCode,

			//
			// API command to execute
			//
			// "is_demo" - checks current activation code and returns array of:
			//
			// $result["demo"] - demo mode flag (bool)
			// $result["label_limit"] - label limit length
			// $result["string_limit"] - string limit lenght
			// $result["bytes_limit"] - bytes/file limit lenght
			// $result["credits_left"] - number of credits left
			// $result["cmd_min"] - minimum number of encryption commands
			// $result["cmd_max"] - maximum number of encryption commands
			//$options["command"] = "encrypt";
			command : "is_demo"
		};

		return this.webApiRequest(formData, callbackSuccess, callbackError);
	}

	/**
	* login to the StringEncrypt.com Web API service and check engine version and
	* get the list of the supported programming languages
	*
	* @param {CallableFunction} callbackSuccess
	* @param {CallableFunction} callbackError
	*/
	async checkGeneralInfo(callbackSuccess, callbackError) {

		//
		// setup options
		//
		var formData = {

			//
			// API command to execute
			//
			command : "info"
		};

		return this.webApiRequest(formData, callbackSuccess, callbackError);
	}
}

module.exports = {
	StringEncrypt,
};

