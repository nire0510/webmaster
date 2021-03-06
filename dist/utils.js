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
exports.countWords = exports.execute = exports.writeFile = exports.isUrlExists = exports.generateFileFromTemplate = exports.generateTempFilePath = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const https_1 = __importDefault(require("https"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
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
function generateFileFromTemplate(template, data = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const markup = yield readFile(path_1.default.resolve(`${__dirname}/templates/${template}.html`));
        return markup.replace('[]', JSON.stringify(data));
    });
}
exports.generateFileFromTemplate = generateFileFromTemplate;
function isUrlExists(input) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            https_1.default
                .request(input, { method: 'HEAD' }, (res) => {
                if (res && res.statusCode && (res.statusCode >= 200 && res.statusCode < 400)) {
                    return resolve(true);
                }
                return resolve(false);
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
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr);
            }
            return resolve(stdout);
        });
    });
}
exports.execute = execute;
function countWords(content) {
    const output = {};
    content
        .toLowerCase()
        .replace(/[.,]/g, '')
        .split(/\s+/)
        .reduce((output, word) => {
        if (output[word]) {
            output[word]++;
        }
        else {
            output[word] = 1;
        }
        return output;
    }, output);
    return output;
}
exports.countWords = countWords;
