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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const commands = __importStar(require("./commands"));
const validator = __importStar(require("./validator"));
const program = new commander_1.Command();
program
    .version('0.0.1');
program
    .command('archive')
    .description('view previous web page versions')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.archive);
program
    .command('headers')
    .description('view web page text headers')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-s, --selector [selector]', 'wrapper css selector')
    .action(commands.headers);
program
    .command('images')
    .description('view web page images')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-s, --selector [selector]', 'wrapper css selector')
    .option('-g, --gallery', 'display images as gallery')
    .option('-t, --table', 'display images in table (default')
    .action(commands.images);
program
    .command('ip')
    .description('get website IP address')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .action(commands.ip);
program
    .command('info')
    .description('view website information')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .option('-al, --alexa', 'use alexa')
    .option('-sw, --similarweb', 'use similarweb')
    .option('-wm, --wmtips', 'use wmtips (default)')
    .action(commands.info);
program
    .command('links')
    .description('view web page links')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-s --selector [selector]', 'wrapper css selector')
    .action(commands.links);
program
    .command('log')
    .description('log web page activity')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-req --requests', 'log http requests')
    .option('-res --responses', 'log http responses')
    .action(commands.log);
program
    .command('pagespeed')
    .description('run web page speed test')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.pagespeed);
program
    .command('pdf')
    .description('create a PDF')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.pdf);
program
    .command('robots')
    .description('view domain robots.txt')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .action(commands.robots);
program
    .command('screenshot')
    .description('take a screenshot')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.screenshot);
program
    .command('source')
    .description('view web page source')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.source);
program
    .command('stack')
    .description('view website technologies')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .option('-bw, --builtwith', 'use builtwith')
    .option('-nc, --netcraft', 'use netcraft')
    .option('-st, --similartech', 'use similartech')
    .option('-wa, --wappalyzer', 'use wappalyzer')
    .action(commands.stack);
program
    .command('structured')
    .description('test web page structured data')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.structured);
program
    .command('text')
    .description('view web page text')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-s, --selector [selector]', 'wrapper css selector')
    .action(commands.text);
program
    .command('trace')
    .description('trace web page loading')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.trace);
program
    .command('validate')
    .description('validate web page markup')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-c, --css', 'css checker')
    .option('-h, --html', 'html checker (default)')
    .option('-i, --i18n', 'internationalization checker')
    .option('-l, --links', 'broken links checker')
    .action(commands.validate);
program.parse(process.argv);