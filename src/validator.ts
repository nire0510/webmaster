import commander from 'commander';

export function isHostname(input: string): string {
  if (!/^\w+\.\w+(\.\w+)?$/.test(input)) {
    throw new commander.InvalidOptionArgumentError('Not a valid hostname, e.g. google.com');
  }

  return input;
}

export function isUrl(input: string): string {
  if (!/^https?:\/\//.test(input)) {
    return `https://${input}`;
  }

  return input;
}
