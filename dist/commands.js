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
exports.whois = exports.validate = exports.translate = exports.trace = exports.stack = exports.source = exports.security = exports.screenshot = exports.rss = exports.robots = exports.pdf = exports.log = exports.ip = exports.info = exports.extract = exports.coverage = exports.audit = exports.archive = void 0;
const open_1 = __importDefault(require("open"));
const ora_1 = __importDefault(require("ora"));
const crawler_1 = __importDefault(require("./crawler"));
const utils = __importStar(require("./utils"));
const spinner = ora_1.default('wait...');
function browse(url, options) {
    if (typeof url === 'string') {
        open_1.default(url);
    }
    else {
        open_1.default(url[Object.keys(options)
            .find((key) => Object.keys(url).includes(key)) || Object.keys(url)[0]]);
    }
    process.exit(0);
}
function execute(command) {
    return __awaiter(this, void 0, void 0, function* () {
        yield genericCommand(null, () => __awaiter(this, void 0, void 0, function* () {
            const info = yield utils.execute(command);
            spinner.succeed(info);
        }));
    });
}
function genericCommand(crawler, fnc) {
    return __awaiter(this, void 0, void 0, function* () {
        spinner.start();
        try {
            yield fnc();
        }
        catch (error) {
            // console.error(error);
            spinner.fail('An error has occurred. Is URL correct?');
            process.exit(0);
        }
        finally {
            spinner.stop();
            crawler && (yield crawler.deconstructor());
        }
    });
}
function archive(url) {
    return __awaiter(this, void 0, void 0, function* () {
        browse(`https://web.archive.org/web/*/${url}`);
    });
}
exports.archive = archive;
function audit(url, options) {
    browse({
        pagespeed: `https://developers.google.com/speed/pagespeed/insights/?url=${url}`,
        seoptimer: `https://www.seoptimer.com/${url}`,
    }, options);
}
exports.audit = audit;
function coverage(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            const coverage = yield crawler.coverage(url, (options === null || options === void 0 ? void 0 : options.stylesheet) ? 'css' : 'js');
            const items = coverage.map((entry) => {
                const item = {
                    'URL': entry.url,
                    'Total Bytes': entry.text.length,
                    'Used Bytes': entry.ranges.reduce((a, c) => a + c.end - c.start - 1, 0),
                    'Usage': 'N/A',
                };
                item['Usage'] = `${(item['Used Bytes'] / item['Total Bytes'] * 100).toFixed(2)}%`;
                return item;
            });
            yield utils.writeFile(file, yield utils.generateFileFromTemplate('table', items));
            open_1.default(file);
        }));
    });
}
exports.coverage = coverage;
function extract(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            if (options === null || options === void 0 ? void 0 : options.headers) {
                const headers = yield crawler.querySelectorAll(url, [
                    `${options && options.selector || ''} h1`.trim(),
                    `${options && options.selector || ''} h2`.trim(),
                    `${options && options.selector || ''} h3`.trim(),
                    `${options && options.selector || ''} h4`.trim(),
                    `${options && options.selector || ''} h5`.trim(),
                    `${options && options.selector || ''} h6`.trim(),
                ].join(','), (elements) => elements.map((element) => ({
                    'Tag Name': element.tagName,
                    'Content': element.textContent,
                })));
                yield utils.writeFile(file, yield utils.generateFileFromTemplate('table', headers));
            }
            else if (options === null || options === void 0 ? void 0 : options.links) {
                const links = yield crawler.querySelectorAll(url, `${options && options.selector || ''} a`.trim(), (elements) => elements.map((element) => ({
                    'Href': decodeURI(element.getAttribute('href') || ''),
                    'Text': element.textContent,
                    'Title': element.getAttribute('title'),
                })));
                yield utils.writeFile(file, yield utils.generateFileFromTemplate('table', links));
            }
            else if ((options === null || options === void 0 ? void 0 : options.images) || (options === null || options === void 0 ? void 0 : options.imagesGallery)) {
                const images = yield crawler.querySelectorAll(url, `${options && options.selector || ''} img`.trim(), (elements) => elements.map((element) => ({
                    'Title': element.getAttribute('title'),
                    'Alternate Text': element.getAttribute('alt'),
                    'Source': element.getAttribute('src'),
                })));
                if (options === null || options === void 0 ? void 0 : options.imagesGallery) {
                    const html = images
                        .map((image) => `<img src="${image['Source'].startsWith('http') ? '' : url}${image['Source']}" title="${image['Title'] || image['Alternate Text']}">`).join('');
                    yield utils.writeFile(file, html);
                }
                else {
                    yield utils.writeFile(file, yield utils.generateFileFromTemplate('table', images));
                }
            }
            // text
            else {
                const text = yield crawler.querySelector(url, `${options && options.selector || 'body'}`.trim(), (element) => element.innerText);
                if (options === null || options === void 0 ? void 0 : options.textCloud) {
                    const wordCount = utils.countWords(text);
                    const wordCountArray = Object.keys(wordCount)
                        .map((word) => ({
                        word,
                        count: wordCount[word],
                    }));
                    yield utils.writeFile(file, yield utils.generateFileFromTemplate('cloud', wordCountArray));
                }
                else {
                    yield utils.writeFile(file, text.replace(/\n/g, '<br>'));
                }
            }
            open_1.default(file);
        }));
    });
}
exports.extract = extract;
function info(domain, options) {
    browse({
        wmtips: `https://www.wmtips.com/tools/info/s/${domain}`,
        alexa: `https://www.alexa.com/siteinfo/${domain}`,
        similarweb: `https://www.similarweb.com/website/${domain}`,
        w3techs: `https://w3techs.com/sites/info/${domain}`,
    }, options);
}
exports.info = info;
function ip(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        yield execute(`dig +short ${domain} A`);
    });
}
exports.ip = ip;
function log(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'html');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            const items = yield crawler.intercept(url, (options === null || options === void 0 ? void 0 : options.responses) ? 'response' : 'request');
            const urlObject = new URL(url);
            yield utils.writeFile(file, yield utils.generateFileFromTemplate('table', items.map((item) => {
                if (options === null || options === void 0 ? void 0 : options.responses) {
                    const response = item;
                    return {
                        'Url': response.url(),
                        'Status': response.status(),
                        'Status Text': response.statusText(),
                        'Content Type': response.headers()['content-type'],
                        'Cache': response.fromCache(),
                        'Service Worker': response.fromServiceWorker(),
                        'Success': response.ok(),
                        'Remote Address': `${response.remoteAddress().ip}${response.remoteAddress().port ? `:${response.remoteAddress().port}` : ''}`,
                        'External': !response.url().startsWith(urlObject.origin),
                    };
                }
                else {
                    const request = item;
                    return {
                        'Url': request.url(),
                        'Method': request.method(),
                        'Resource Type': request.resourceType(),
                        'Post Data': JSON.stringify(request.postData()),
                        'External': !request.url().startsWith(urlObject.origin),
                    };
                }
            })));
            open_1.default(file);
        }));
    });
}
exports.log = log;
function pdf(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'pdf');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            yield crawler.pdf(url, file);
            open_1.default(file);
        }));
    });
}
exports.pdf = pdf;
function robots(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        yield genericCommand(null, () => __awaiter(this, void 0, void 0, function* () {
            const url = `https://${domain}/robots.txt`;
            try {
                const isUrlExists = yield utils.isUrlExists(url);
                if (isUrlExists) {
                    spinner.succeed(`robots.txt found: ${url}`);
                    return browse(url);
                }
                spinner.warn(`robots.txt file could not be found for domain ${domain}`);
            }
            catch (error) {
                spinner.fail(`Domain name ${domain} does not exists`);
                process.exit(0);
            }
        }));
    });
}
exports.robots = robots;
function rss(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        yield genericCommand(null, () => __awaiter(this, void 0, void 0, function* () {
            const crawler = new crawler_1.default();
            const origin = `https://${domain}`;
            const rss = yield crawler.querySelectorAll(origin, 'head > link[type="application/rss+xml"]', ([link]) => link ? link.getAttribute('href') : null);
            if (rss && Array.isArray(rss) && rss.length) {
                spinner.succeed(`RSS found: ${rss[0]}`);
                browse(rss[0]);
            }
            else {
                [
                    `${origin}/feed`,
                    `${origin}/feeds/posts/default`,
                ].find((url) => __awaiter(this, void 0, void 0, function* () {
                    const isUrlExists = yield utils.isUrlExists(url);
                    if (isUrlExists) {
                        spinner.succeed(`RSS found: ${url}`);
                        browse(url);
                        return true;
                    }
                    return false;
                }));
            }
        }));
    });
}
exports.rss = rss;
function screenshot(url, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default({
            defaultViewport: {
                width: 1920,
                height: 1080,
            },
        });
        const file = utils.generateTempFilePath(url, 'png');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            yield crawler.screenshot(url, file, {
                fullPage: options === null || options === void 0 ? void 0 : options.fullPage,
                omitBackground: options === null || options === void 0 ? void 0 : options.omitBackground,
            });
            open_1.default(file);
        }));
    });
}
exports.screenshot = screenshot;
function security(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const origin = `https://${domain}`;
        const file = utils.generateTempFilePath(origin, 'json');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            const securityDetails = yield crawler.security(origin);
            yield utils.writeFile(file, JSON.stringify(securityDetails, null, 2));
            open_1.default(file);
        }));
    });
}
exports.security = security;
function source(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'txt');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            const html = yield crawler.querySelector(url, 'html', (element) => element.outerHTML);
            yield utils.writeFile(file, html);
            open_1.default(file);
        }));
    });
}
exports.source = source;
function stack(domain, options) {
    browse({
        builtwith: `https://builtwith.com/${domain}`,
        netcraft: `https://sitereport.netcraft.com/?url=${domain}`,
        similartech: `https://www.similartech.com/websites/${domain}`,
        wappalyzer: `https://www.wappalyzer.com/lookup/${domain}`,
    }, options);
}
exports.stack = stack;
function trace(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const crawler = new crawler_1.default();
        const file = utils.generateTempFilePath(url, 'json');
        yield genericCommand(crawler, () => __awaiter(this, void 0, void 0, function* () {
            yield crawler.trace(url, file);
            open_1.default(file);
        }));
    });
}
exports.trace = trace;
function translate(url) {
    browse(`https://translate.google.com/translate?sl=autoS&u=${url}`);
}
exports.translate = translate;
function validate(url, options) {
    browse({
        html: `https://validator.w3.org/nu/?doc=${url}`,
        css: `https://jigsaw.w3.org/css-validator/validator?uri=${url}`,
        i18n: `https://validator.w3.org/i18n-checker/check?uri=${url}`,
        links: `https://validator.w3.org/checklink?uri=${url}`,
        structured: `https://search.google.com/test/rich-results?utm_campaign=sdtt&utm_medium=message&url=${url}&user_agent=1`,
    }, options);
}
exports.validate = validate;
function whois(domain) {
    return __awaiter(this, void 0, void 0, function* () {
        yield execute(`whois ${domain}`);
    });
}
exports.whois = whois;
