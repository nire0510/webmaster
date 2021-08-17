import fs from 'fs';
import { exec } from 'child_process';
import https from 'https';
import os from 'os';
import path from 'path';

function readFile(file: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(file, 'utf8', function (error, content) {
      if (error) {
        return reject(error);
      }

      resolve(content);
    });
  });
}

/**
 * Returns a temporary file path
 * @param {string} url URL
 * @param {string} ext File extension
 * @returns {string}
 */
export function generateTempFilePath(url: string, ext: string): string {
  return `${os.tmpdir()}/${url.replace(/\W/g, '')}.${ext}`;
}

export async function generateFileFromTemplate(template: string, data: any[] = []): Promise<string> {
  const markup = await readFile(path.resolve(`${__dirname}/templates/${template}.html`));

  return markup.replace('[]', JSON.stringify(data));
}

export async function isUrlExists(input: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    https
      .request(input, { method: 'HEAD' }, (res) => {
        if (res && res.statusCode && (res.statusCode >=  200 && res.statusCode < 400)) {
          return resolve(true);
        }

        return resolve(false);
      })
      .on('error', (err) => {
        reject(err);
      })
      .end();
  });
}

export async function writeFile(file: string, content: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fs.writeFile(file, content, function (err) {
      if (err) {
        return reject(err);
      }

      resolve(file);
    });
  });
}

export function execute(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr);
      }

      return resolve(stdout);
    });
  });
}

export function countWords(content: string): { [key: string]: number } {
  const output = {};

  content
    .toLowerCase()
    .replace(/[.,]/g, '')
    .split(/\s+/)
    .reduce((output: { [key: string]: number }, word: string) => {
      if (output[word]) {
        output[word]++;
      }
      else {
        output[word] = 1;
      }

      return output;
    }, output);

  return output;
}
