import open from 'open';
import ora from 'ora';
import puppeteer from 'puppeteer';
import Crawler from './crawler';
import * as utils from './utils';

const spinner = ora('wait...');

function browse(url: string | any, options?: any): void {
  if (typeof url === 'string') {
    open(url);
  }
  else {
    open(url[Object.keys(options)
      .find((key) => Object.keys(url).includes(key)) || Object.keys(url)[0]]);
  }

  process.exit(0);
}

async function execute(command: string): Promise<void> {
  await genericCommand(null, async () => {
    const info = await utils.execute(command);

    spinner.succeed(info);
  });
}

async function genericCommand(crawler: Crawler | null, fnc: any): Promise<void> {
  spinner.start();
  try {
    await fnc();
  }
  catch (error) {
    // console.error(error);
    spinner.fail('An error has occurred. Is URL correct?');
    process.exit(0);
  }
  finally {
    spinner.stop();
    crawler && await crawler.deconstructor();
  }
}

export async function archive(url: string): Promise<void> {
  browse(`https://web.archive.org/web/*/${url}`);
}

export function audit(url: string, options: any): void {
  browse({
    pagespeed: `https://developers.google.com/speed/pagespeed/insights/?url=${url}`,
    seoptimer: `https://www.seoptimer.com/${url}`,
  }, options);
}

export async function coverage(url: string, options: any): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(crawler, async () => {
    const coverage: any[] = await crawler.coverage(url, options?.stylesheet ? 'css' : 'js');

    const items = coverage.map((entry) => {
      const item = {
        'URL': entry.url,
        'Total Bytes': entry.text.length,
        'Used Bytes': entry.ranges.reduce((a: number, c: any) => a + c.end - c.start - 1, 0),
        'Usage': 'N/A',
      };

      item['Usage'] = `${(item['Used Bytes'] / item['Total Bytes'] * 100).toFixed(2)}%`;

      return item;
    });

    await utils.writeFile(file, await utils.generateFileFromTemplate('table', items));
    open (file);
  });
}

export async function extract(url: string, options: any): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(crawler, async () => {
    if (options?.headers) {
      const headers: HTMLElement[] = await crawler.querySelectorAll(url,
        `${options && options.selector || ''} h1, h2, h3, h4, h5, h6`.trim(),
        (elements: Element[]) => elements.map((element) => ({
          'Tag Name': element.tagName,
          'Content': element.textContent,
        })));

      await utils.writeFile(file, await utils.generateFileFromTemplate('table', headers));
    }
    else if (options?.links) {
      const links: HTMLElement[] = await crawler.querySelectorAll(url,
        `${options && options.selector || ''} a`.trim(),
        (elements: Element[]) => elements.map((element) => ({
          'Href': element.getAttribute('href'),
          'Text': element.textContent,
          'Title': element.getAttribute('title'),
        })));

      await utils.writeFile(file, await utils.generateFileFromTemplate('table', links));
    }
    else if (options?.images || options?.imagesGallery) {
      const images: HTMLElement[] = await crawler.querySelectorAll(url,
        `${options && options.selector || ''} img`.trim(),
        (elements: Element[]) => elements.map((element) => ({
          'Title': element.getAttribute('title'),
          'Alternate Text': element.getAttribute('alt'),
          'Source': element.getAttribute('src'),
        })));

      if (options?.imagesGallery) {
        const html = images
          .map((image: any) => `<img src="${image['Source'].startsWith('http') ? '' : url}${image['Source']}" title="${image['Title'] || image['Alternate Text']}">`).join('');

        await utils.writeFile(file, html);
      }
      else {
        await utils.writeFile(file, await utils.generateFileFromTemplate('table', images));
      }
    }
    // text
    else {
      const text: string = await crawler.querySelector(url,
        `${options && options.selector || 'body'}`.trim(),
        (element: any) => element.innerText);

      if (options?.textCloud) {
        const wordCount = utils.countWords(text);
        const wordCountArray = Object.keys(wordCount)
          .map((word: string) => ({
            word,
            count: wordCount[word],
          }));
        await utils.writeFile(file, await utils.generateFileFromTemplate('cloud', wordCountArray));
      }
      else {
        await utils.writeFile(file, text.replace(/\n/g, '<br>'));
      }
    }

    open (file);
  });
}

export function info(domain: string, options: any): void {
  browse({
    wmtips: `https://www.wmtips.com/tools/info/s/${domain}`,
    alexa: `https://www.alexa.com/siteinfo/${domain}`,
    similarweb: `https://www.similarweb.com/website/${domain}`,
  }, options);
}

export async function ip(domain: string): Promise<void> {
  await execute(`dig +short ${domain} A`);
}

export async function log(url: string, options: any): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(crawler, async () => {
    const items = await crawler.intercept(url, options?.responses ? 'response' : 'request');
    const urlObject = new URL(url);

    await utils.writeFile(file, await utils.generateFileFromTemplate('table', items.map((item) => {
      if (options?.responses) {
        const response = (item as puppeteer.HTTPResponse);

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
        const request = (item as puppeteer.HTTPRequest);

        return {
          'Url': request.url(),
          'Method': request.method(),
          'Resource Type': request.resourceType(),
          'Post Data': JSON.stringify(request.postData()),
          'External': !request.url().startsWith(urlObject.origin),
        };
      }
    })));
    open (file);
  });
}

export async function pdf(url: string): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'pdf');

  await genericCommand(crawler, async () => {
    await crawler.pdf(url, file);
    open(file);
  });
}

export async function robots(domain: string): Promise<void> {
  await genericCommand(null, async () => {
    const url = `https://${domain}/robots.txt`;

    try {
      const isUrlExists = await utils.isUrlExists(url);

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
  });
}

export async function rss(domain: string): Promise<void> {
  await genericCommand(null, async () => {
    const crawler = new Crawler();
    const origin = `https://${domain}`;
    const rss = await crawler.querySelectorAll(origin, 'head > link[type="application/rss+xml"]', ([link]: HTMLLinkElement[]) => link ? link.getAttribute('href') : null);

    if (rss && Array.isArray(rss) && rss.length) {
      spinner.succeed(`RSS found: ${rss[0]}`);
      browse(rss[0]);
    }
    else {
      [
        `${origin}/feed`,
        `${origin}/feeds/posts/default`,
      ].find(async (url) => {
        const isUrlExists = await utils.isUrlExists(url);

        if (isUrlExists) {
          spinner.succeed(`RSS found: ${url}`);
          browse(url);

          return true;
        }

        return false;
      });
    }
  });
}

export async function screenshot(url: string, options: any): Promise<void> {
  const crawler = new Crawler({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  } as puppeteer.LaunchOptions);
  const file = utils.generateTempFilePath(url, 'png');

  await genericCommand(crawler, async () => {
    await crawler.screenshot(url, file, {
      fullPage: options?.fullPage,
      omitBackground: options?.omitBackground,
    });
    open(file);
  });
}

export async function security(domain: string): Promise<void> {
  const crawler = new Crawler();
  const origin = `https://${domain}`;
  const file = utils.generateTempFilePath(origin, 'json');

  await genericCommand(crawler, async () => {
    const securityDetails: any = await crawler.security(origin);

    await utils.writeFile(file, JSON.stringify(securityDetails, null, 2));
    open (file);
  });
}

export async function source(url: string): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'txt');

  await genericCommand(crawler, async () => {
    const html: string = await crawler.querySelector(url,
      'html',
      (element: Element) => element.outerHTML);

    await utils.writeFile(file, html);
    open (file);
  });
}

export function stack(domain: string, options: any): void {
  browse({
    builtwith: `https://builtwith.com/${domain}`,
    netcraft: `https://sitereport.netcraft.com/?url=${domain}`,
    similartech: `https://www.similartech.com/websites/${domain}`,
    wappalyzer: `https://www.wappalyzer.com/lookup/${domain}`,
  }, options);
}

export async function trace(url: string): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'json');

  await genericCommand(crawler, async () => {
    await crawler.trace(url, file);
    open(file);
  });
}

export function validate(url: string, options: { [key: string]: string }): void {
  browse({
    html: `https://validator.w3.org/nu/?doc=${url}`,
    css: `https://jigsaw.w3.org/css-validator/validator?uri=${url}`,
    i18n: `https://validator.w3.org/i18n-checker/check?uri=${url}`,
    links: `https://validator.w3.org/checklink?uri=${url}`,
    structured: `https://search.google.com/test/rich-results?utm_campaign=sdtt&utm_medium=message&url=${url}&user_agent=1`,
  }, options);
}

export async function whois(domain: string): Promise<void> {
  await execute(`whois ${domain}`);
}
