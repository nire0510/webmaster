"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrl = exports.isHostname = void 0;
const commander_1 = __importDefault(require("commander"));
function isHostname(input, dummyPrevious) {
    if (!/^\w+\.\w+(\.\w+)?$/.test(input)) {
        throw new commander_1.default.InvalidOptionArgumentError('Not a valid hostname, e.g. google.com');
    }
    return input;
}
exports.isHostname = isHostname;
function isUrl(input, dummyPrevious) {
    if (!/^https?:\/\//.test(input)) {
        throw new commander_1.default.InvalidOptionArgumentError('Not a valid url');
    }
    return input;
}
exports.isUrl = isUrl;
