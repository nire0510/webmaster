import open from 'open';
import ora from 'ora';
import Crawler from './crawler';
import * as utils from './utils';

const crawler = new Crawler();

function browse(url: string): void {
  open(url);
  process.exit(0);
}

async function genericCommand(fnc: Function) {
  const spinner = ora('wait...');

  spinner.start();
  try {
    await fnc();
  }
  catch (error) {
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

export async function headers(url: string, options: any) {
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(async () => {
    const headers: HTMLElement[] = await crawler.querySelectorAll(url,
      `${options && options.selector || ''} h1, h2, h3, h4, h5, h6`.trim(),
      (elements: Element[]) => elements.map((element) => ({
        tagName: element.tagName,
        content: element.textContent,
      })));
    const html = headers
      .map((header: any) => `<${header.tagName}>${header.content}</${header.tagName}>`)
      .sort((a, b) => a < b ? -1 : 1)
      .join('');

    await utils.writeFile(file, html);
    open (file);
  });
}

export async function images(url: string, options: any) {
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(async () => {
    const images: HTMLElement[] = await crawler.querySelectorAll(url,
      `${options && options.selector || ''} img`.trim(),
      (elements: Element[]) => elements.map((element) => ({
        src: element.getAttribute('src'),
        alt: element.getAttribute('alt'),
        title: element.getAttribute('title'),
      })));
    const html = images
      .map((image: any) => `<img src="${image.src.startsWith('http') ? '' : url}${image.src}" title="${image.title || image.alt}">`).join('');

    await utils.writeFile(file, html);
    open (file);
  });
}

export function info(domain: string, options: any): void {
  let url;

  if (options?.similarweb) {
    url = `https://www.similarweb.com/website/${domain}`;
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

export async function links(url: string, options: any): Promise<void> {
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(async () => {
    const links: HTMLElement[] = await crawler.querySelectorAll(url,
      `${options && options.selector || ''} a`.trim(),
      (elements: Element[]) => elements.map((element) => ({
        text: element.textContent,
        href: element.getAttribute('href'),
        alt: element.getAttribute('alt'),
        title: element.getAttribute('title'),
      })));
    const html = links
      .filter((link: any) => link.href.startsWith('http') || ['null', 'javascript'].every((string) => !link.href.startsWith(string)))
      .map((link: any) => `<a href="${link.href.startsWith('http') ? '' : url}${link.href}">${link.text || link.title || link.alt || '-'}</a><br>`).join('');

    await utils.writeFile(file, html);
    open (file);
  });
}

export function pagespeed(url: string): void {
  browse(`https://developers.google.com/speed/pagespeed/insights/?url=${url}`);
}

export async function pdf(url: string) {
  const file = utils.generateTempFilePath(url, 'pdf');

  await genericCommand(async () => {
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

export async function screenshot(url: string) {
  const file = utils.generateTempFilePath(url, 'png');

  await genericCommand(async () => {
    await crawler.screenshot(url, file);
    open(file);
  });
}

export async function source(url: string): Promise<void> {
  const file = utils.generateTempFilePath(url, 'txt');

  await genericCommand(async () => {
    const html: string = await crawler.querySelector(url,
      'html',
      (element: Element) => element.outerHTML);

    await utils.writeFile(file, html);
    open (file);
  });
}

export function stack(domain: string): void {
  browse(`https://builtwith.com/${domain}`);
}

export function structured(url: string): void {
  browse(`https://search.google.com/test/rich-results?utm_campaign=sdtt&utm_medium=message&url=${url}&user_agent=1`);
}

export async function text(url: string, options: any) {
  const file = utils.generateTempFilePath(url, 'html');

  await genericCommand(async () => {
    const text: string = await crawler.querySelector(url,
      `${options && options.selector || 'body'}`.trim(),
      (element: any) => element.innerText);

    await utils.writeFile(file, text.replace(/\n/g, '<br>'));
    open (file);
  });
}

export async function trace(url: string) {
  const file = utils.generateTempFilePath(url, 'json');

  await genericCommand(async () => {
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
  // html
  else {
    url = `https://validator.w3.org/nu/?doc=${url}`;
  }

  browse(url);
}
