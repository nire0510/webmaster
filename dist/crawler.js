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
    constructor(headless = true) {
        this.ready = false;
        this.headless = headless;
        this.init();
    }
    deconstructor() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.browser.close();
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch();
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
    screenshot(url, path) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.genericCommand((page) => __awaiter(this, void 0, void 0, function* () {
                yield page.goto(url, { waitUntil: 'networkidle2' });
                yield page.screenshot({ path });
            }));
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
