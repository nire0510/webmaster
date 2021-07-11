import open from 'open';
import ora from 'ora';
import puppeteer from 'puppeteer';
import Crawler from './crawler';
import * as utils from './utils';

function browse(url: string): void {
  open(url);
  process.exit(0);
}

async function genericCommand(crawler: Crawler, fnc: Function) {
  const spinner = ora('wait...');

  spinner.start();
  try {
    await fnc();
  }
  catch (error) {
    // console.error(error);
    console.error();
    console.error('An error has occurred. Is URL correct?');
    process.exit(0);
  }
  finally {
    spinner.stop();
    await crawler.deconstructor();
  }
}

export async function archive(url: string): Promise<void> {
  browse(`https://web.archive.org/web/*/${url}`);
}

export function audit(url: string, options: any): void {
  if (options?.seoptimer) {
    url = `https://www.seoptimer.com/${url}`;
  }
  // pagespeed
  else {
    url = `https://developers.google.com/speed/pagespeed/insights/?url=${url}`;
  }

  browse(url);
}

export async function coverage(url: string, options: any) {
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
      }

      item['Usage'] = `${(item['Used Bytes'] / item['Total Bytes'] * 100).toFixed(2)}%`;

      return item;
    });

    await utils.writeFile(file, await utils.generateFileFromTemplate('table', items));
    open (file);
  });
}

export async function extract(url: string, options: any) {
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
  let url;

  if (options?.similarweb) {
    url = `https://www.similarweb.com/website/${domain}`;
  }
  else if (options?.alexa) {
    url = `https://www.alexa.com/siteinfo/${domain}`;
  }
  else {
    url = `https://www.wmtips.com/tools/info/s/${domain}`;
  }

  browse(url);
}

export async function ip(domain: string): Promise<void> {
  try {
    const ip = await utils.execute(`dig +short ${domain} A`);

    console.log(ip);
  }
  catch (error) {
    console.error(error);
  }
  finally {
    process.exit(0);
  }
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

export async function pdf(url: string) {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'pdf');

  await genericCommand(crawler, async () => {
    await crawler.pdf(url, file);
    open(file);
  });
}

export async function robots(domain: string) {
  const url = `https://${domain}/robots.txt`;

  try {
    await utils.isUrlExists(url, null);
    browse(url);
  }
  catch (error) {
    console.log(`Domain name ${domain} does not exists`);
    process.exit(0);
  }
}

export async function screenshot(url: string, options: any) {
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

export async function security(url: string): Promise<void> {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'json');

  await genericCommand(crawler, async () => {
    const securityDetails: any = await crawler.security(url);

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
  let url;

  if (options?.netcraft) {
    url = `https://sitereport.netcraft.com/?url=${domain}`;
  }
  else if (options?.wappalyzer) {
    url = `https://www.wappalyzer.com/lookup/${domain}`;
  }
  else if (options?.similartech) {
    url = `https://www.similartech.com/websites/${domain}`;
  }
  // builtwith
  else {
    url = `https://builtwith.com/${domain}`;
  }

  browse(url);
}

export async function trace(url: string) {
  const crawler = new Crawler();
  const file = utils.generateTempFilePath(url, 'json');

  await genericCommand(crawler, async () => {
    await crawler.trace(url, file);
    open(file);
  });
}

export function validate(url: string, options: any): void {
  if (options?.css) {
    url = `https://jigsaw.w3.org/css-validator/validator?uri=${url}`;
  }
  else if (options?.i18n) {
    url = `https://validator.w3.org/i18n-checker/check?uri=${url}`;
  }
  else if (options?.links) {
    url = `https://validator.w3.org/checklink?uri=${url}`;
  }
  else if (options?.structured) {
    url = `https://search.google.com/test/rich-results?utm_campaign=sdtt&utm_medium=message&url=${url}&user_agent=1`;
  }
  // html
  else {
    url = `https://validator.w3.org/nu/?doc=${url}`;
  }

  browse(url);
}

export async function whois(domain: string): Promise<void> {
  try {
    const info = await utils.execute(`whois ${domain}`);

    console.log(info);
  }
  catch (error) {
    console.error(error);
  }
  finally {
    process.exit(0);
  }
}
