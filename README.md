# wmcli - webmaster cli tools
-----------------------------
Useful tools for webmasters

## Installation
`npm i @nire0510/wmcli -g`

## Usage
Run `wm` from you terminal, to see the tools available:
```
Usage: wm [options] [command]

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  archive <url>               view previous web page versions
  audit [options] <url>       check website performance and SEO
  coverage [options] <url>    view javascript and css usage coverage
  extract [options] <url>     extract elements from a web page
  ip <domain>                 get website IP address
  info [options] <domain>     view website information
  log [options] <url>         log web page activity
  pdf <url>                   create a PDF
  robots <domain>             view domain robots.txt
  rss <domain>                view domain rss feed
  screenshot [options] <url>  take a screenshot
  source <url>                view web page source
  security <domain>           view website security details
  stack [options] <domain>    view website technologies
  trace <url>                 trace web page loading
  validate [options] <url>    validate web page markup
  whois <domain>              view domain information
  help [command]              display help for command
```
