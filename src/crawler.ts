import puppeteer from 'puppeteer';

export default class Crawler {
  browser: any;
  headless: boolean;
  ready: boolean = false;

  constructor(headless: boolean = true) {
    this.headless = headless;
    this.init();
  }

  async deconstructor() {
    await this.browser.close();
  }

  async init() {
    this.browser = await puppeteer.launch();
    this.ready = true;
  }

  private isReady(): Promise<boolean> {
    return new Promise(async (resolve) => {
      while (!this.ready) {
        await this.sleep(200);
      }

      return resolve(true);
    });
  }

  private async genericCommand(fnc: Function): Promise<any> {
    await this.isReady();

    const page = await this.browser.newPage();
    const results = await fnc(page);

    await page.close();

    return results;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), ms);
    });
  }

  async intercept(url: string, type: string): Promise<any[]> {
    const items = await this.genericCommand(async (page: puppeteer.Page) => {
      const items: any[] = [];

      await page.setRequestInterception(true);
      switch (type) {
        case 'response':
          page.on('response', async (response: puppeteer.HTTPResponse) => {
            items.push({
              url: response.url(),
              status: response.status(),
              statusText: response.statusText(),
              headers: response.headers(),
            });
          })
          break;
        case 'request':
        default:
          page.on('request', async (request: puppeteer.HTTPRequest) => {
            items.push({
              url: request.url(),
              method: request.method(),
              headers: request.headers(),
              resourceType: request.resourceType(),
              postData: request.postData(),
            });

            return request.continue();
          });
          break;
      }
      await page.goto(url, { waitUntil: 'networkidle2' });

      return items;
    });

    return items;
  }

  async pdf(url: string, path: string) {
    await this.genericCommand(async (page: puppeteer.Page) => {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.pdf({ path, format: 'a4' });
    });
  }

  async querySelector(url: string, selector: string, mapper: any): Promise<any> {
    try {
      const elements = await this.genericCommand(async (page: puppeteer.Page) => {
        try {
          await page.goto(url, { waitUntil: 'networkidle2' });

          return await page.$eval(selector, mapper);
        }
        catch (error) {
          return Promise.reject(error);
        }
      });

      return elements;
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async querySelectorAll(url: string, selector: string, mapper: any): Promise<any[]> {
    try {
      const elements = await this.genericCommand(async (page: puppeteer.Page) => {
        try {
          await page.goto(url, { waitUntil: 'networkidle2' });

          return await page.$$eval(selector, mapper);
        }
        catch (error) {
          return Promise.reject(error);
        }
      });

      return elements;
    }
    catch (error) {
      return Promise.reject(error);
    }
  }

  async screenshot(url: string, path: string) {
    await this.genericCommand(async (page: puppeteer.Page) => {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.screenshot({ path });
    });
  }

  async trace(url: string, path: string) {
    await this.genericCommand(async (page: puppeteer.Page) => {
      await page.tracing.start({ path });
      await page.goto(url);
      await page.tracing.stop();
    });
  }
}
