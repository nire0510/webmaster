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
    .command('audit')
    .description('check website performance and SEO')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-ps --pagespeed', 'use google pagespeed')
    .option('-so --seoptimer', 'use seoptimer')
    .action(commands.audit);
program
    .command('coverage')
    .description('view javascript and css usage coverage')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-js, --javascript', 'javascript files coverage (default)')
    .option('-css, --stylesheet', 'stylesheet files coverage')
    .action(commands.coverage);
program
    .command('extract')
    .description('extract elements from a web page')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-s, --selector [selector]', 'wrapper css selector')
    .option('-h, --headers', 'extract headers')
    .option('-l, --links', 'extract links')
    .option('-i, --images', 'extract images and display as table')
    .option('-ig, --images-gallery', 'extract images and display as gallery')
    .option('-t, --text', 'extract text (default)')
    .option('-tc, --text-cloud', 'extract text and display as word cloud')
    .action(commands.extract);
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
    .command('log')
    .description('log web page activity')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-req --requests', 'log http requests (default)')
    .option('-res --responses', 'log http responses')
    .action(commands.log);
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
    .command('rss')
    .description('view domain rss feed')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .action(commands.rss);
program
    .command('screenshot')
    .description('take a screenshot')
    .argument('<url>', 'web page url', validator.isUrl)
    .option('-f, --full-page', 'capture full page')
    .option('-o, --omit-background', 'omit background from screenshot')
    .action(commands.screenshot);
program
    .command('source')
    .description('view web page source')
    .argument('<url>', 'web page url', validator.isUrl)
    .action(commands.source);
program
    .command('security')
    .description('view website security details')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .action(commands.security);
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
    .option('-s, --structured', 'sturctured data')
    .action(commands.validate);
program
    .command('whois')
    .description('view domain information')
    .argument('<domain>', 'website domain name', validator.isHostname)
    .action(commands.whois);
program.parse(process.argv);
