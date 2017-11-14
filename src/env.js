import BrowserDetect from 'browserDetect';
import Util from 'utils';

const Env = {};

Env.getFingerprint = () => window.fgrprnt;

Env.getBrowserData = () => {
  const plugins = null; // Env.getPluginsData()

  return ({
    ua: navigator.userAgent,
    name: BrowserDetect.browser,
    version: BrowserDetect.version,
    platform: BrowserDetect.OS,
    language: navigator.language || navigator.userLanguage || navigator.systemLanguage,
    plugins
  });
};

Env.getUrlData = () => {
  const l = document.location;

  return ({
    hash: l.hash,
    host: l.host,
    hostname: l.hostname,
    pathname: l.pathname,
    protocol: l.protocol,
    query: Util.parseQueryString(l.search)
  });
};

Env.getDocumentData = () => ({
  title: document.title
});

Env.getReferrerData = () => document.referrer && Util.parseUrl(document.referrer) || undefined;

Env.getScreenData = () => ({
  height: screen.height,
  width: screen.width,
  color_depth: screen.colorDepth
});

Env.getLocaleData = () => {
  // "Mon Apr 15 2013 12:21:35 GMT-0600 (MDT)"
  //
  const results = new RegExp('([A-Z]+-[0-9]+) \\(([A-Z]+)\\)').exec((new Date()).toString());

  let gmtOffset;
  let timezone;

  if (results && results.length >= 3) {
    gmtOffset = results[1];
    timezone = results[2];
  }

  return ({
    language: navigator.systemLanguage || navigator.userLanguage || navigator.language,
    timezone_offset: (new Date()).getTimezoneOffset(),
    gmt_offset: gmtOffset,
    timezone
  });
};
Env.getPageloadData = () => ({
  url: Env.getUrlData(),
  referrer: Env.getReferrerData(),
  browser: Env.getBrowserData(),
  document: Env.getDocumentData(),
  screen: Env.getScreenData(),
  locale: Env.getLocaleData(),
  sparrow: Env.getSparrowData()
});

Env.getPluginsData = () => {
  const plugins = [];
  const p = navigator.plugins;

  for (const pi of p) {
    plugins.push({
      name: pi.name,
      description: pi.description,
      filename: pi.filename,
      version: pi.version,
      mimeType: (pi.length > 0) ? ({
        type: pi[0].type,
        description: pi[0].description,
        suffixes: pi[0].suffixes
      }) : undefined
    });
  }

  return plugins;
};

// Todo: Should be broken out
Env.getMMData = () => ({
  site_id: window.SiteObject.site_id,
  payway_id: window.user.payway_id,
  comscore_id: window.Util.get_cookie('m_visitor'),
  article_id: window.PageObject && window.PageObject.article_id || null,
  content_keywords: window.content_keywords,
  consumer_location: window.Util.get_cookie('consumer_location')
});

// Todo: Should be broken out
Env.getSparrowData = () => ({
  status_code: window.SiteObject.status_code,
  section: window.SiteObject.section,
  controller: window.SiteObject.controller_name,
  action: window.SiteObject.action_name
});

export default Env;
