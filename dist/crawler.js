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
const puppeteer_1 = __importDefault(require("puppeteer"));
class Crawler {
    constructor(options = {}) {
        this.ready = false;
        this.init(options);
    }
    deconstructor() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.browser.close();
        });
    }
    init(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch(options);
            this.ready = true;
        });
    }
    isReady() {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            while (!this.ready) {
                yield this.sleep(200);
            }
            return resolve(true);
        }));
    }
    genericCommand(fnc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.isReady();
            const page = yield this.browser.newPage();
            const results = yield fnc(page);
            yield page.close();
            return results;
        });
    }
    sleep(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => resolve(null), ms);
            });
        });
    }
    coverage(url, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                yield page.coverage[type === 'css' ? 'startCSSCoverage' : 'startJSCoverage']();
                yield page.goto(url, { waitUntil: 'networkidle2' });
                return yield page.coverage[type === 'css' ? 'stopCSSCoverage' : 'stopJSCoverage']();
            }));
            return items;
        });
    }
    intercept(url, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                const items = [];
                type === 'request' && (yield page.setRequestInterception(true));
                page.on(type, (item) => __awaiter(this, void 0, void 0, function* () {
                    items.push(item);
                    if (typeof item.continue === 'function') {
                        item.continue();
                    }
                }));
                yield page.goto(url, { waitUntil: 'networkidle2' });
                return items;
            }));
            return items;
        });
    }
    pdf(url, path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                yield page.goto(url, { waitUntil: 'networkidle2' });
                yield page.pdf({ path, format: 'a4' });
            }));
        });
    }
    querySelector(url, selector, mapper) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const elements = yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield page.goto(url, { waitUntil: 'networkidle2' });
                        return yield page.$eval(selector, mapper);
                    }
                    catch (error) {
                        return Promise.reject(error);
                    }
                }));
                return elements;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    querySelectorAll(url, selector, mapper) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const elements = yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield page.goto(url, { waitUntil: 'networkidle2' });
                        return yield page.$$eval(selector, mapper);
                    }
                    catch (error) {
                        return Promise.reject(error);
                    }
                }));
                return elements;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    screenshot(url, path, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                yield page.goto(url, { waitUntil: 'networkidle2' });
                yield page.screenshot(Object.assign({ path }, options));
            }));
        });
    }
    security(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const details = yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                const response = yield page.goto(url);
                const securityDetails = response.securityDetails();
                if (securityDetails) {
                    return {
                        issuer: securityDetails.issuer(),
                        protocol: securityDetails.protocol(),
                        subjectAlternativeNames: securityDetails.subjectAlternativeNames().join(', '),
                        subjectName: securityDetails.subjectName(),
                        validFrom: new Date(securityDetails.validFrom() * 1000),
                        validTo: new Date(securityDetails.validTo() * 1000),
                    };
                }
                return {};
            }));
            return details;
        });
    }
    trace(url, path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                yield page.tracing.start({ path });
                yield page.goto(url);
                yield page.tracing.stop();
            }));
        });
    }
}
exports.default = Crawler;
