import fs from 'fs';
import { exec } from 'child_process';
import https from 'https';
import os from 'os';

/**
 * Returns a temporary file path
 * @param {string} url URL
 * @param {string} ext File extension
 * @returns {string}
 */
export function generateTempFilePath(url: string, ext: string): string {
  return `${os.tmpdir()}/${url.replace(/\W/g, '')}.${ext}`;
}

export function toTable(data: any[]) {
  const headers = Object.keys(data[0]).map((key: string) => `<th>${key}</th>`).join('');
  const rows = data.map((item: any) => `<tr>` + Object.keys(item).map((key: string) => `<td>${item[key]}</td>`).join('') + `</tr>`).join('');

  return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;

}

export async function isUrlExists(input: string, dummyPrevious: any): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https
      .request(input, { method: 'HEAD' }, (/* res */) => {
        resolve(input);
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
  })
}

export function execute(command: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr);
      }

      return resolve(stdout);
    });
  })
}
