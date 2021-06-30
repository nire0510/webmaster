import commander from 'commander';

export function isHostname(input: string, dummyPrevious: any): string {
  if (!/^\w+\.\w+(\.\w+)?$/.test(input)) {
    throw new commander.InvalidOptionArgumentError('Not a valid hostname, e.g. google.com');
  }

  return input;
}

export function isUrl(input: string, dummyPrevious: any): string {
  if (!/^https?:\/\//.test(input)) {
    throw new commander.InvalidOptionArgumentError('Not a valid url');
  }

  return input;
}
