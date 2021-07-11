import puppeteer from 'puppeteer';

export default class Crawler {
  browser: any;
  ready: boolean = false;

  constructor(options: puppeteer.LaunchOptions = {}) {
    this.init(options);
  }

  async deconstructor() {
    await this.browser.close();
  }

  async init(options: puppeteer.LaunchOptions = {}) {
    this.browser = await puppeteer.launch(options);
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

  async coverage(url: string, type: string) {
    const items = await this.genericCommand(async (page: puppeteer.Page) => {
      await page.coverage[type === 'css' ? 'startCSSCoverage' : 'startJSCoverage']();
      await page.goto(url, { waitUntil: 'networkidle2' });

      return await page.coverage[type === 'css' ? 'stopCSSCoverage' : 'stopJSCoverage']();
    });

    return items;
  }

  async intercept(url: string, type: any): Promise<any[]> {
    const items = await this.genericCommand(async (page: puppeteer.Page) => {
      const items: any[] = [];

      type === 'request' && await page.setRequestInterception(true);
      page.on(type, async (item: any) => {
        items.push(item);

        if (typeof item.continue === 'function') {
          item.continue();
        }
      });
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

  async screenshot(url: string, path: string, options: puppeteer.ScreenshotOptions = {}) {
    await this.genericCommand(async (page: puppeteer.Page) => {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.screenshot({
        path,
        ...options
      });
    });
  }

  async security(url: string): Promise<any> {
    const details = await this.genericCommand(async (page: puppeteer.Page) => {
      const response = await page.goto(url);
      const securityDetails = response.securityDetails();

      if (securityDetails) {
        return {
          issuer: securityDetails.issuer(),
          protocol: securityDetails.protocol(),
          subjectAlternativeNames: securityDetails.subjectAlternativeNames().join(', '),
          subjectName: securityDetails.subjectName(),
          validFrom: new Date(securityDetails.validFrom() * 1000),
          validTo: new Date(securityDetails.validTo() * 1000),
        }
      }

      return {};
    });

    return details;
  }

  async trace(url: string, path: string) {
    await this.genericCommand(async (page: puppeteer.Page) => {
      await page.tracing.start({ path });
      await page.goto(url);
      await page.tracing.stop();
    });
  }
}
