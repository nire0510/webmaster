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
exports.execute = exports.writeFile = exports.isUrlExists = exports.toTable = exports.generateTableFromTemplate = exports.generateTempFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const https_1 = __importDefault(require("https"));
const os_1 = __importDefault(require("os"));
function readFile(file) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(file, 'utf8', function (error, content) {
            if (error) {
                return reject(error);
            }
            resolve(content);
        });
    });
}
/**
 * Returns a temporary file path
 * @param {string} url URL
 * @param {string} ext File extension
 * @returns {string}
 */
function generateTempFilePath(url, ext) {
    return `${os_1.default.tmpdir()}/${url.replace(/\W/g, '')}.${ext}`;
}
exports.generateTempFilePath = generateTempFilePath;
function generateTableFromTemplate(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableMarkup = yield readFile('./templates/table.html');
        return tableMarkup.replace('{{data}}', JSON.stringify(data));
    });
}
exports.generateTableFromTemplate = generateTableFromTemplate;
function toTable(data) {
    const headers = Object.keys(data[0]).map((key) => `<th>${key}</th>`).join('');
    const rows = data.map((item) => `<tr>` + Object.keys(item).map((key) => `<td>${item[key]}</td>`).join('') + `</tr>`).join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}
exports.toTable = toTable;
function isUrlExists(input, dummyPrevious) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            https_1.default
                .request(input, { method: 'HEAD' }, ( /* res */) => {
                resolve(input);
            })
                .on('error', (err) => {
                reject(err);
            })
                .end();
        });
    });
}
exports.isUrlExists = isUrlExists;
function writeFile(file, content) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(file, content, function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(file);
            });
        });
    });
}
exports.writeFile = writeFile;
function execute(command) {
    return new Promise((resolve, reject) => {
        child_process_1.exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr);
            }
            return resolve(stdout);
        });
    });
}
exports.execute = execute;
