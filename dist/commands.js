"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.validate = exports.trace = exports.text = exports.structured = exports.stack = exports.source = exports.screenshot = exports.robots = exports.pdf = exports.pagespeed = exports.links = exports.ip = exports.info = exports.images = exports.headers = exports.archive = void 0;
const open_1 = __importDefault(require("open"));
const ora_1 = __importDefault(require("ora"));
const crawler_1 = __importDefault(require("./crawler"));
const utils = __importStar(require("./utils"));
const crawler = new crawler_1.default();
function browse(url) {
    open_1.default(url);
    process.exit(0);
}
function genericCommand(fnc) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora_1.default('wait...');
        spinner.start();
        try {
            yield fnc();
        }
        catch (error) {
            console.error();
            console.error('An error has occurred. Is URL correct?');
            process.exit(0);
        }
        finally {
            spinner.stop();
            yield crawler.deconstructor();
        }
    });
}
function archive(url) {
    return __awaiter(this, void 0, void 0, function* () {
        browse(`https://web.archive.org/web/*/${url}`);
    });
}
exports.archive = archive;
function headers(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            const headers = yield crawler.querySelectorAll(url, `${options && options.selector || ''} h1, h2, h3, h4, h5, h6`.trim(), (elements) => elements.map((element) => ({
                tagName: element.tagName,
                content: element.textContent,
            })));
            const html = headers
                .map((header) => `<${header.tagName}>${header.content}</${header.tagName}>`)
                .sort((a, b) => a < b ? -1 : 1)
                .join('');
            yield utils.writeFile(file, html);
            open_1.default(file);
        }));
    });
}
exports.headers = headers;
function images(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            const images = yield crawler.querySelectorAll(url, `${options && options.selector || ''} img`.trim(), (elements) => elements.map((element) => ({
                src: element.getAttribute('src'),
                alt: element.getAttribute('alt'),
                title: element.getAttribute('title'),
            })));
            const html = images
                .map((image) => `<img src="${image.src.startsWith('http') ? '' : url}${image.src}" title="${image.title || image.alt}">`).join('');
            yield utils.writeFile(file, html);
            open_1.default(file);
        }));
    });
}
exports.images = images;
function info(domain, options) {
    let url;
    if (options === null || options === void 0 ? void 0 : options.similarweb) {
        url = `https://www.similarweb.com/website/${domain}`;
    }
    else {
        url = `https://www.wmtips.com/tools/info/s/${domain}`;
    }
    browse(url);
}
exports.info = info;
function ip(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ip = yield utils.execute(`dig +short ${domain} A`);
            console.log(ip);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            process.exit(0);
        }
    });
}
exports.ip = ip;
function links(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            const links = yield crawler.querySelectorAll(url, `${options && options.selector || ''} a`.trim(), (elements) => elements.map((element) => ({
                text: element.textContent,
                href: element.getAttribute('href'),
                alt: element.getAttribute('alt'),
                title: element.getAttribute('title'),
            })));
            const html = links
                .filter((link) => link.href.startsWith('http') || ['null', 'javascript'].every((string) => !link.href.startsWith(string)))
                .map((link) => `<a href="${link.href.startsWith('http') ? '' : url}${link.href}">${link.text || link.title || link.alt || '-'}</a><br>`).join('');
            yield utils.writeFile(file, html);
            open_1.default(file);
        }));
    });
}
exports.links = links;
function pagespeed(url) {
    browse(`https://developers.google.com/speed/pagespeed/insights/?url=${url}`);
}
exports.pagespeed = pagespeed;
function pdf(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'pdf');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            yield crawler.pdf(url, file);
            open_1.default(file);
        }));
    });
}
exports.pdf = pdf;
function robots(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://${domain}/robots.txt`;
        try {
            yield utils.isUrlExists(url, null);
            browse(url);
        }
        catch (error) {
            console.log(`Domain name ${domain} does not exists`);
            process.exit(0);
        }
    });
}
exports.robots = robots;
function screenshot(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'png');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            yield crawler.screenshot(url, file);
            open_1.default(file);
        }));
    });
}
exports.screenshot = screenshot;
function source(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'txt');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            const html = yield crawler.querySelector(url, 'html', (element) => element.outerHTML);
            yield utils.writeFile(file, html);
            open_1.default(file);
        }));
    });
}
exports.source = source;
function stack(domain) {
    browse(`https://builtwith.com/${domain}`);
}
exports.stack = stack;
function structured(url) {
    browse(`https://search.google.com/test/rich-results?utm_campaign=sdtt&utm_medium=message&url=${url}&user_agent=1`);
}
exports.structured = structured;
function text(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            const text = yield crawler.querySelector(url, `${options && options.selector || 'body'}`.trim(), (element) => element.innerText);
            yield utils.writeFile(file, text.replace(/\n/g, '<br>'));
            open_1.default(file);
        }));
    });
}
exports.text = text;
function trace(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const file = utils.generateTempFilePath(url, 'json');
        yield genericCommand(() => __awaiter(this, void 0, void 0, function* () {
            yield crawler.trace(url, file);
            open_1.default(file);
        }));
    });
}
exports.trace = trace;
function validate(url, options) {
    if (options === null || options === void 0 ? void 0 : options.css) {
        url = `https://jigsaw.w3.org/css-validator/validator?uri=${url}`;
    }
    else if (options === null || options === void 0 ? void 0 : options.i18n) {
        url = `https://validator.w3.org/i18n-checker/check?uri=${url}`;
    }
    else if (options === null || options === void 0 ? void 0 : options.links) {
        url = `https://validator.w3.org/checklink?uri=${url}`;
    }
    // html
    else {
        url = `https://validator.w3.org/nu/?doc=${url}`;
    }
    browse(url);
}
exports.validate = validate;
