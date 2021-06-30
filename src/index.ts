import { Command } from 'commander';
import * as commands from './commands';
import * as validator from './validator';

const program = new Command();

program
  .version('0.0.1');

program
  .command('archive')
  .description('view web page versions')
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
  .description('view website technology stack')
  .argument('<domain>', 'website domain name', validator.isHostname)
  .action(commands.stack);

program
  .command('text')
  .description('view web page text')
  .argument('<url>', 'web page url', validator.isUrl)
  .option('-s, --selector [selector]', 'wrapper css selector')
  .action(commands.text);

program
  .command('trace')
  .description('trace web page')
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
