"use strict";
const vscode = require('vscode');
const fs = require('fs');
const zlib = require('zlib');
const { StringEncrypt } = require('./stringencrypt');

const stringEncrypt = new StringEncrypt();

const labelPricing = "Check Full Version Pricing";
const labelIsItDown = "Check Server Status";
const labelBug = "Report a Bug";

// global activation status
var activationStatus;

function openWebPage(webPageUrl) {
	vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(webPageUrl));
}

function openBuyPage() {
	openWebPage("https://www.stringencrypt.com/buy/");
}

function openContactPage() {
	openWebPage("https://www.stringencrypt.com/contact/");
}

function openIsItDown() {
	openWebPage("https://downforeveryoneorjustme.com/stringencrypt.com");
}

function connectionError() {
	vscode.window.showErrorMessage("Error while trying to connect to StringEncrypt.com website!", ...[labelIsItDown]).then(selection => { openIsItDown(); });
}

function getActiveEditor() {
	return vscode.window.activeTextEditor;
}

function getCurrentConfig() {
	return vscode.workspace.getConfiguration('stringencrypt');
}

function getProgrammingLanguage() {

	const editor = getActiveEditor();

	// is the language supported?
	if (!StringEncrypt.supportedLanguages.hasOwnProperty(editor.document.languageId)) {
		vscode.window.showErrorMessage('Language not supported by StringEncrypt. Please tell me about it!');
		openContactPage();
		return false;
	}

	return StringEncrypt.supportedLanguages[editor.document.languageId];
}

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function refreshActivationStatus() {

	// get current configuration
	const config = getCurrentConfig();

	var result = stringEncrypt.checkActivationStatus(config.get("activationCode"),

		function (response) {

			// no response at all
			if (!response.data) {
				activationStatus = null;
				return;
			}

			activationStatus = response.data;

		}, function(error) {
			activationStatus = null;
			return;
		});

	return result;
}

function showActivationStatus() {

	// get current configuration
	const config = getCurrentConfig();

	stringEncrypt.checkActivationStatus(config.get("activationCode"),

		function (response) {

			// no response at all
			if (!response.data) {
				connectionError();
				return;
			}

			var info = response.data.demo ? "You are using a DEMO version of StringEncrypt.\n" : "You are using a FULL version of StringEncrypt.\r\n";
			info += `\r\n`;
			info += `Usage credits left - ${response.data.credits_left}\r\n`;
			info += `Usage credits total - ${response.data.credits_full}\r\n`;
			info += `\r\n`;
			info += `Max. label length - ${response.data.label_limit} characters\r\n`;
			info += `Max. string length - ${response.data.string_limit} characters\r\n`;
			info += `Max. bytes/file length - ${formatBytes(response.data.bytes_limit)}\r\n`;
			info += `\r\n`;
			info += `Min. number of encryption commands - ${response.data.cmd_min}\r\n`;
			info += `Max. number of encryption commands - ${response.data.cmd_max}\r\n`;

			vscode.window.showInformationMessage(info, { modal: true });

		}, connectionError);
}

function showGeneralInfo() {

	stringEncrypt.checkGeneralInfo(
		function (response) {

			// no response at all
			if (!response.data) {
				connectionError()
				return;
			}

			var info = `StringEncrypt engine version - ${response.data.engine_version}\r\n`;
			info += `\r\n`;
			info += `List of supported programming languages:\r\n`;
			info += `\r\n`;

			for (const [key, value] of Object.entries(response.data.supported_languages)) {

				const language = Object.entries(value);

				info += `${language[0][1]} (${language[0][0]})\r\n`;
			}

			vscode.window.showInformationMessage(info, { modal: true });

		}, connectionError);
}

/**
 * Encrypt text string
 *
 * @param {string} textLabel
 * @param {string} textString
 * @param {boolean} insertNewString
 */
async function encryptString(textLabel, textString, insertNewString) {

	// get active editor window
	const editor = getActiveEditor();

	// get current configuration
	const config = getCurrentConfig();

	// detect programming language in active editor window
	const langDetected = getProgrammingLanguage();

	if (!langDetected) return;

	var formData = {

		//
		// activation code, you can leave it empty for demo version, but keep in
		// mind that there are many limitations in demo version)
		//
		code : config.get("activationCode"),

		//
		// API command to execute
		//
		// "encrypt" - encrypt input string or file bytes, returns array of:
		//
		// $result["error"] - error code
		// $result["source"] - decryptor source code
		// $result["expired"] - activation code expiration flag (bool)
		// $result["credits_left"] - number of credits left
		//
		command: "encrypt",

		//
		// label name
		//
		// demo mode supports up to 6 chars only (64 in full version),
		// if you pass more than this number, service will return
		// ERROR_LENGTH_LABEL
		//
		label: textLabel,

		//
		// input string / raw bytes compression enabled, if you set it to
		// true, you need to compress input string / raw bytes eg.
		//
		// $compressed = @base64_encode(@gzcompress($string, 9)
		//
		// and after encryption you need to decompress encrypted data
		//
		// $decompressed = @gzuncompress(@base64_decode($source));
		//
		compression : false,
		//compression : true,

		//
		// input string in UTF-8 format
		//
		// demo mode supports up to 6 chars only, if you pass more
		// than that, service will return ERROR_LENGTH_STRING
		//
		string : textString,
		//string : @base64_encode(@gzcompress("Hello!", 9));

		//
		// raw data bytes to encrypt (you need to specify either
		// string or this value
		//
		// demo mode doesn't support this parameter and the service
		// will return ERROR_DEMO
		//
		//bytes : file_get_contents("my_file.txt");
		//bytes : file_get_contents("http://www.example.com/my_file.txt");
		//bytes : @base64_encode(@gzcompress(file_get_contents("my_file.txt"), 9));

		//
		// treat input string as a UNICODE string (ANSI otherwise)
		//
		unicode : config.get("useUnicode"),

		//
		// input string default locale (only those listed below
		// are supported currently)
		//
		lang_locale : "en_US.utf8",
		//lang_locale : "en_GB.utf8";
		//lang_locale : "de_DE.utf8";
		//lang_locale : "es_ES.utf8";
		//lang_locale : "fr_BE.utf8";
		//lang_locale : "fr_FR.utf8";
		//lang_locale : "pl_PL.utf8";

		//
		// how to encode new lines, available values:
		//
		// "lf" - Unix style
		// "crlf" - Windows style
		// "cr" - Mac style
		//
		new_lines : config.get("newLines").toLowerCase(),
		//new_lines : "lf";
		//new_lines : "crlf";
		//new_lines : "cr";

		//
		// destination ANSI string encoding (if unicode = false)
		//
		// only those listed below are supported
		//
		ansi_encoding : "WINDOWS-1250",
		//ansi_encoding:WINDOWS-1251";
		//ansi_encoding:WINDOWS-1252";
		//ansi_encoding:WINDOWS-1253";
		//ansi_encoding:WINDOWS-1254";
		//ansi_encoding:WINDOWS-1255";
		//ansi_encoding:WINDOWS-1256";
		//ansi_encoding:WINDOWS-1257";
		//ansi_encoding:WINDOWS-1258";
		//ansi_encoding:ISO-8859-1";
		//ansi_encoding:ISO-8859-2";
		//ansi_encoding:ISO-8859-3";
		//ansi_encoding:ISO-8859-9";
		//ansi_encoding:ISO-8859-10";
		//ansi_encoding:ISO-8859-14";
		//ansi_encoding:ISO-8859-15";
		//ansi_encoding:ISO-8859-16";

		//
		// output programming language
		//
		// only those listed below are supported, if you pass
		// other name, service will return ERROR_INVALID_LANG
		//
		lang : langDetected,
		//lang : "cpp",
		//lang : "csharp";
		//lang : "delphi";
		//lang : "java";
		//lang : "js";
		//lang : "python";
		//lang : "ruby";
		//lang : "autoit";
		//lang : "powershell";
		//lang : "haskell";
		//lang : "masm";
		//lang : "fasm";

		//
		// minimum number of encryption commands
		//
		// demo mode supports only up to 3 commands (50 in full version),
		// if you pass more than this number, service will return
		// ERROR_CMD_MIN
		//
		cmd_min : ( config.get("minEncryptionCommands") > activationStatus.cmd_max ) ? activationStatus.cmd_max : config.get("minEncryptionCommands"),
		//cmd_min : 1,

		//
		// maximum number of encryption commands
		//
		// demo mode supports only up to 3 commands (50 in full version),
		// if you pass more than this number, service will return
		// ERROR_CMD_MAX
		//
		cmd_max : ( config.get("maxEncryptionCommands") > activationStatus.cmd_max ) ? activationStatus.cmd_max : config.get("maxEncryptionCommands"),
		//cmd_max : 50,

		//
		// store encrypted string as a local variable (if supported
		// by the programming language), otherwise it's stored as
		// a global variable
		//
		local : config.get("localVariable"),
		//local : true,

		//
		// omit optional opening tags for the language e.g. <script></script>
		//
		include_tags : false,

		//
		// append optional example code
		//
		include_example : config.get("includeUsageExample")
	};

	stringEncrypt.webApiRequest(formData, function (response) {

		// no response at all
		if (!response.data) {
			connectionError()
			return;
		}

		// invalid success code
		if (response.data.error != StringEncrypt.errorCodes.ERROR_SUCCESS) {
			vscode.window.showErrorMessage(StringEncrypt.errorCodesLabelsMap.get(response.data.error));
			return;
		};

		// if there was selection -> replace it
		if (!editor.selection.isEmpty && !insertNewString) {

			editor.edit(builder => {
				builder.replace(editor.selection, response.data.source);
			});
		}
		else {
			editor.edit(builder => {
				builder.insert(editor.selection.active, response.data.source);
			});
		}

		if (response.data.credits_total == 0)
			vscode.window.showInformationMessage(`Encrypted string successfully generated (DEMO mode).`, ...[labelPricing]).then(selection => { openBuyPage(); });
		else
			vscode.window.showInformationMessage(`Encrypted string successfully generated (${response.data.credits_left} usage credits left).`);

		if (response.data.expired) {
			vscode.window.showWarningMessage('Your activation code has expired. Thank you for using StringEncrypt :)', ...[labelPricing]).then(selection => { openBuyPage(); });
		}

		//console.log(response);
	}, connectionError);
}

/**
 * Encrypt binary buffer
 *
 * @param {string} textLabel
 * @param {Buffer} bufferBytes
 */
async function encryptBuffer(textLabel, bufferBytes) {

	const editor = getActiveEditor();

	// get current configuration
	const config = getCurrentConfig();

	const langDetected = getProgrammingLanguage();

	if (!langDetected) return;

	// compress file contents using DEFLATE
	var fileBytesCompressed = zlib.deflateSync(bufferBytes);

	// compressed and BASE64 encoded
	var fileBytesCompressedAndEncoded = fileBytesCompressed.toString('base64');

	var formData = {

		//
		// activation code, you can leave it empty for demo version, but keep in
		// mind that there are many limitations in demo version)
		//
		code : config.get("activationCode"),

		//
		// API command to execute
		//
		// "encrypt" - encrypt input string or file bytes, returns array of:
		//
		// $result["error"] - error code
		// $result["source"] - decryptor source code
		// $result["expired"] - activation code expiration flag (bool)
		// $result["credits_left"] - number of credits left
		//
		command: "encrypt",

		//
		// label name
		//
		// demo mode supports up to 6 chars only (64 in full version),
		// if you pass more than this number, service will return
		// ERROR_LENGTH_LABEL
		//
		label: textLabel,

		//
		// input string / raw bytes compression enabled, if you set it to
		// true, you need to compress input string / raw bytes eg.
		//
		// $compressed = @base64_encode(@gzcompress($string, 9)
		//
		// and after encryption you need to decompress encrypted data
		//
		// $decompressed = @gzuncompress(@base64_decode($source));
		//
		compression : true,

		//
		// input string in UTF-8 format
		//
		// demo mode supports up to 6 chars only, if you pass more
		// than that, service will return ERROR_LENGTH_STRING
		//
		//string : textString,
		//string : @base64_encode(@gzcompress("Hello!", 9));

		//
		// raw data bytes to encrypt (you need to specify either
		// string or this value
		//
		// demo mode doesn't support this parameter and the service
		// will return ERROR_DEMO
		//
		//bytes : file_get_contents("my_file.txt");
		//bytes : file_get_contents("http://www.example.com/my_file.txt");
		//bytes : @base64_encode(@gzcompress(file_get_contents("my_file.txt"), 9));
		bytes : fileBytesCompressedAndEncoded,

		//
		// treat input string as a UNICODE string (ANSI otherwise)
		//
		unicode : false,

		//
		// input string default locale (only those listed below
		// are supported currently)
		//
		lang_locale : "en_US.utf8",
		//lang_locale : "en_GB.utf8";
		//lang_locale : "de_DE.utf8";
		//lang_locale : "es_ES.utf8";
		//lang_locale : "fr_BE.utf8";
		//lang_locale : "fr_FR.utf8";
		//lang_locale : "pl_PL.utf8";

		//
		// how to encode new lines, available values:
		//
		// "lf" - Unix style
		// "crlf" - Windows style
		// "cr" - Mac style
		//
		new_lines : config.get("newLines").toLowerCase(),
		//new_lines : "lf";
		//new_lines : "crlf";
		//new_lines : "cr";

		//
		// destination ANSI string encoding (if unicode = false)
		//
		// only those listed below are supported
		//
		ansi_encoding : "WINDOWS-1250",
		//ansi_encoding:WINDOWS-1251";
		//ansi_encoding:WINDOWS-1252";
		//ansi_encoding:WINDOWS-1253";
		//ansi_encoding:WINDOWS-1254";
		//ansi_encoding:WINDOWS-1255";
		//ansi_encoding:WINDOWS-1256";
		//ansi_encoding:WINDOWS-1257";
		//ansi_encoding:WINDOWS-1258";
		//ansi_encoding:ISO-8859-1";
		//ansi_encoding:ISO-8859-2";
		//ansi_encoding:ISO-8859-3";
		//ansi_encoding:ISO-8859-9";
		//ansi_encoding:ISO-8859-10";
		//ansi_encoding:ISO-8859-14";
		//ansi_encoding:ISO-8859-15";
		//ansi_encoding:ISO-8859-16";

		//
		// output programming language
		//
		// only those listed below are supported, if you pass
		// other name, service will return ERROR_INVALID_LANG
		//
		lang : langDetected,
		//lang : "cpp",
		//lang : "csharp";
		//lang : "delphi";
		//lang : "java";
		//lang : "js";
		//lang : "python";
		//lang : "ruby";
		//lang : "autoit";
		//lang : "powershell";
		//lang : "haskell";
		//lang : "masm";
		//lang : "fasm";

		//
		// minimum number of encryption commands
		//
		// demo mode supports only up to 3 commands (50 in full version),
		// if you pass more than this number, service will return
		// ERROR_CMD_MIN
		//
		cmd_min : config.get("minEncryptionCommands"),
		//cmd_min : 1,

		//
		// maximum number of encryption commands
		//
		// demo mode supports only up to 3 commands (50 in full version),
		// if you pass more than this number, service will return
		// ERROR_CMD_MAX
		//
		cmd_max : config.get("maxEncryptionCommands"),
		//cmd_max : 50,

		//
		// store encrypted string as a local variable (if supported
		// by the programming language), otherwise it's stored as
		// a global variable
		//
		local : config.get("localVariable"),
		//local : true,

		//
		// omit optional opening tags for the language e.g. <script></script>
		//
		include_tags : false,

		//
		// omit optional example code
		//
		include_example : config.get("includeUsageExample")
	};

	stringEncrypt.webApiRequest(formData, function (response) {

		// no response at all
		if (!response.data) {
			connectionError()
			return;
		}

		// invalid success code
		if (response.data.error != StringEncrypt.errorCodes.ERROR_SUCCESS) {
			vscode.window.showErrorMessage(StringEncrypt.errorCodesLabelsMap.get(response.data.error));
			return;
		};

		// first - decode from BASE64 format to raw buffer, then decompress it
		// catch any exceptions in decoding
		try {
			var data = zlib.inflateSync(Buffer.from(response.data.source, 'base64')).toString();

			editor.edit(builder => {
				builder.insert(editor.selection.active, data);
			});

			if (response.data.credits_total == 0)
				vscode.window.showInformationMessage(`Encrypted file successfully generated (DEMO mode).`, ...[labelPricing]).then(selection => { openBuyPage(); });
			else
				vscode.window.showInformationMessage(`Encrypted file successfully generated (${response.data.credits_left} usage credits left).`);

			if (response.data.expired) {
				vscode.window.showWarningMessage('Your activation code has expired. Thank you for using StringEncrypt :)', ...[labelPricing]).then(selection => { openBuyPage(); });
			}

		} catch (error) {
			vscode.window.showErrorMessage(`Error while decoding encrypted file!`, ...[labelBug]).then(selection => { openContactPage(); });
			//console.log(response);
		}

	}, connectionError);
}

async function queryInputString(placeHolderText, maxLength, messageDemo, messageFull) {

	var textString;

	while(true)
	{
		textString = await vscode.window.showInputBox({
			placeHolder: placeHolderText
		});

		// if text is empty - return
		if (!textString) return false;

		// if activationStatus is not available (something is wrong) enter
		if (!activationStatus) {
			vscode.window.showErrorMessage("Cannot connect to the StringEncrypt service to validate the license!");
			return false;
		}

		if (textString.length > maxLength) {

			if (activationStatus.demo) {
				vscode.window.showWarningMessage(messageDemo, ...[labelPricing]).then(selection => { openBuyPage(); });
			}
			else {
				vscode.window.showWarningMessage(messageFull);
			}
		}
		else break;
	}

	return textString;
}

async function stringEncryptReplace() {

	const editor = getActiveEditor();

	// refresh activation status using activation code in current configuration
	await refreshActivationStatus();

	if (!activationStatus) {
		connectionError();
		return;
	}

	var textLabel = await queryInputString("Enter label e.g. \"encryptedString\" for the encrypted string with StringEncrypt.",
		activationStatus.label_limit,
		`Label is too long! DEMO limit is ${activationStatus.label_limit} chars. Please enter it again.`,
		`Label is too long! Limit is ${activationStatus.label_limit} chars. Please enter it again.`
	);

	if (!textLabel) return;

	// selected text
	var textString = editor.document.getText(editor.selection);

	if (!textString) return;

	if (textString.length > activationStatus.string_limit) {
		vscode.window.showWarningMessage(activationStatus.demo ?
			`String is too long! DEMO limit is ${activationStatus.string_limit} chars. Please select a shorter string.` :
			`String is too long! Limit is ${activationStatus.string_limit} chars. Please select a shorter string.`
		);
		return;
	}

	return encryptString(textLabel, textString, false);
}

async function stringEncryptInsert() {

	// refresh activation status using activation code in current configuration
	await refreshActivationStatus();

	if (!activationStatus) {
		connectionError();
		return;
	}

	var textLabel = await queryInputString("Step 1. Enter label e.g. \"encryptedString\" for the encrypted string with StringEncrypt.",
		activationStatus.label_limit,
		`Label is too long! DEMO limit is ${activationStatus.label_limit} chars. Please enter it again.`,
		`Label is too long! Limit is ${activationStatus.label_limit} chars. Please enter it again.`
	);

	if (!textLabel) return;

	var textString = await queryInputString("Step 2. Enter string e.g. \"Hello, world!\" to be encrypted with StringEncrypt.",
		activationStatus.string_limit,
		`String is too long! DEMO limit is ${activationStatus.string_limit} chars. Please insert a shorter string.`,
		`String is too long! Limit is ${activationStatus.string_limit} chars. Please insert a shorter string.`
	);

	if (!textString) return;

	return encryptString(textLabel, textString, true);
}

async function stringEncryptInsertFile() {

	// refresh activation status using activation code in current configuration
	await refreshActivationStatus();

	if (!activationStatus) {
		connectionError();
		return;
	}

	// select input file (single file)
	var selectedFiles = await vscode.window.showOpenDialog({
		canSelectFiles : true,
		canSelectFolders : false,
		canSelectMany : false,
		title : "Step 1. Select any text or raw binary file for encryption with StringEncrypt"
	});

	if (!selectedFiles) return;

	if (activationStatus.demo) {
		vscode.window.showErrorMessage("This feature is not available in DEMO mode.", ...[labelPricing]).then(selection => { openBuyPage(); });
		return;
	}

	// try to read the input file
	var bufferFileBytes;

	try {
		bufferFileBytes = fs.readFileSync(selectedFiles[0].fsPath);
	} catch (error) {
		vscode.window.showErrorMessage("Cannot read the input file!");
		return;
	}

	// check file size (it cannot be empty)
	if (bufferFileBytes.length == 0) {
		vscode.window.showErrorMessage("Selected file is empty!");
		return;
	}

	if (bufferFileBytes.length > activationStatus.bytes_limit) {
		vscode.window.showWarningMessage(`File is too long (limit is ${formatBytes(activationStatus.bytes_limit)}. Please select a smaller file.`)
		return;
	}

	var textLabel = await queryInputString("Step 2. Enter label e.g. \"encryptedFile\" for the encrypted file contents with StringEncrypt.",
		activationStatus.label_limit,
		`Label is too long (DEMO limit is ${activationStatus.label_limit} chars. Please enter it again.`,
		`Label is too long (limit is ${activationStatus.label_limit} chars. Please enter it again.`
	);

	if (!textLabel) return;

	// send request to the WebAPI interface
	return encryptBuffer(textLabel, bufferFileBytes);
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {

	let cmdConsole1 = vscode.commands.registerCommand('stringencrypt.checkActivationCode', function () {
		showActivationStatus();
	});

	let cmdConsole2 = vscode.commands.registerCommand('stringencrypt.getGeneralInfo', function () {
		showGeneralInfo();
	});

	let cmdMenu1 = vscode.commands.registerCommand('stringencrypt.stringEncryptInsert', function () {
		stringEncryptInsert();
	});

	let cmdMenu2 = vscode.commands.registerCommand('stringencrypt.stringEncryptReplace', function () {
		stringEncryptReplace();
	});

	let cmdMenu3 = vscode.commands.registerCommand('stringencrypt.stringEncryptInsertFile', function () {
		stringEncryptInsertFile();
	});

	// add console commands
	context.subscriptions.push(cmdConsole1);
	context.subscriptions.push(cmdConsole2);

	// add menus
	context.subscriptions.push(cmdMenu1);
	context.subscriptions.push(cmdMenu2);
	context.subscriptions.push(cmdMenu3);

	// detect any changed in the configuration
	vscode.workspace.onDidChangeConfiguration(async event => {
		if (event.affectsConfiguration('stringencrypt.activationCode')) {

			await refreshActivationStatus();

			if (activationStatus && activationStatus.demo == false) {
				vscode.window.showInformationMessage(`StringEncrypt is now activated. Usage credits left ${activationStatus.credits_left} out of ${activationStatus.credits_full} total.`);
			}
			else {
				vscode.window.showInformationMessage('StringEncrypt is now in DEMO mode.', ...[labelPricing]).then(selection => { openBuyPage(); });
			}
		}
	});

}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
