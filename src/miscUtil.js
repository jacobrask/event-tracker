const MiscHelper = {};

// Needed to handle private browsing in safari and quota exceded
MiscHelper.store = {
  getItem(storage, key) {
    return storage.getItem(key);
  },
  setItem(storage, key, value) {
    try {
      return storage.setItem(key, value);
    } catch (domException) {
      if (domException.name === 'QuotaExceededError' ||
        domException.name === 'SecurityError' ||
        domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      }
      return null;
    }
  },
  session: {
    getItem(key) { return MiscHelper.store.getItem(window.sessionStorage, key); },
    setItem(key, value) { return MiscHelper.store.setItem(sessionStorage, key, value); }
  },
  local: {
    getItem(key) { return MiscHelper.store.getItem(window.localStorage, key); },
    setItem(key, value) { return MiscHelper.store.setItem(localStorage, key, value); }
  }
};

MiscHelper.copyFields = (source, target) => {
  const createDelegate = (source, value) => function () {
    return value.apply(source, arguments);
  };

  target = target || {};

  let key;
  let value;

  for (key in source) {
    if (!/layerX|Y/.test(key)) {
      value = source[key];

      if (typeof value === 'function') {
        // Bind functions to object being copied (???):
        target[key] = createDelegate(source, value);
      } else {
        target[key] = value;
      }
    }
  }

  return target;
};

MiscHelper.merge = (o1, o2) => {
  let r;
  let key;
  let index;

  if (o1 === undefined) return o1;
  else if (o2 === undefined) return o1;
  else if (o1 instanceof Array && o2 instanceof Array) {
    r = [];
    // Copy
    for (index = 0; index < o1.length; index++) {
      r.push(o1[index]);
    }
    // Merge
    for (index = 0; index < o2.length; index++) {
      if (r.length > index) {
        r[index] = MiscHelper.merge(r[index], o2[index]);
      } else {
        r.push(o2[index]);
      }
    }
    return r;
  } else if (o1 instanceof Object && o2 instanceof Object) {
    r = {};
    // Copy:
    for (key in o1) {
      r[key] = o1[key];
    }
    // Merge:
    for (key in o2) {
      if (r[key] !== undefined) {
        r[key] = MiscHelper.merge(r[key], o2[key]);
      } else {
        r[key] = o2[key];
      }
    }
    return r;
  }
  return o2;

};

MiscHelper.toObject = olike => {
  const o = {};
  let key;

  for (key in olike) {
    o[key] = olike[key];
  }

  return o;
};

MiscHelper.genGuid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);

  return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

MiscHelper.parseQueryString = qs => {
  const pairs = {};

  if (qs.length > 0) {
    const query = qs.charAt(0) === '?' ? qs.substring(1) : qs;

    if (query.length > 0) {
      const vars = query.split('&');

      for (let i = 0; i < vars.length; i++) {
        if (vars[i].length > 0) {
          const pair = vars[i].split('=');

          try {
            const name = decodeURIComponent(pair[0]);
            const value = (pair.length > 1) ? decodeURIComponent(pair[1]) : 'true';

            pairs[name] = value;
          } catch (e) { }
        }
      }
    }
  }
  return pairs;
};

MiscHelper.unparseQueryString = qs => {
  const kvs = [];
  let k;
  let v;

  for (k in qs) {
    if (!qs.hasOwnProperty || qs.hasOwnProperty(k)) {
      v = qs[k];

      kvs.push(
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
      );
    }
  }
  const string = kvs.join('&');

  if (string.length > 0) return `?${string}`;
  return '';
};

MiscHelper.size = v => {
  if (v === undefined) return 0;
  else if (v instanceof Array) return v.length;
  else if (v instanceof Object) {
    let size = 0;

    for (const key in v) {
      if (!v.hasOwnProperty || v.hasOwnProperty(key)) ++size;
    }
    return size;
  } return 1;
};

MiscHelper.mapJson = (v, f) => {
  let vp;
  let vv;

  if (v instanceof Array) {
    vp = [];
    for (let i = 0; i < v.length; i++) {
      vv = MiscHelper.mapJson(v[i], f);

      if (MiscHelper.size(vv) > 0) vp.push(vv);
    }
    return vp;
  } else if (v instanceof Object) {
    vp = {};
    for (const k in v) {
      vv = MiscHelper.mapJson(v[k], f);

      if (MiscHelper.size(vv) > 0) vp[k] = vv;
    }
    return vp;
  } return f(v);
};

MiscHelper.jsonify = v => MiscHelper.mapJson(v, v => {
  if (v === '') return undefined;

  let r;

  try {
    r = JSON.parse(v);
  } catch (e) {
    r = v;
  }

  return r;

});

MiscHelper.undup = (f, cutoff) => {
  cutoff = cutoff || 250;

  let lastInvoked = 0;

  return function () {
    const curTime = (new Date()).getTime();
    const delta = curTime - lastInvoked;

    if (delta > cutoff) {
      lastInvoked = curTime;

      return f.apply(this, arguments);
    }
    return undefined;

  };
};

MiscHelper.parseUrl = url => {
  const l = document.createElement('a');

  l.href = url;
  if (l.host === '') {
    l.href = l.href;
  }
  return {
    hash: l.hash,
    host: l.host,
    hostname: l.hostname,
    pathname: l.pathname,
    protocol: l.protocol,
    query: MiscHelper.parseQueryString(l.search)
  };
};

MiscHelper.unparseUrl = url => `${url.protocol || ''}//${url.host || ''}${url.pathname || ''}${MiscHelper.unparseQueryString(url.query)}${url.hash || ''}`;

MiscHelper.equals = (v1, v2) => {
  const leftEqualsObject = (o1, o2) => {
    for (const k in o1) {
      if (!o1.hasOwnProperty || o1.hasOwnProperty(k)) {
        if (!MiscHelper.equals(o1[k], o2[k])) return false;
      }
    }
    return true;
  };

  if (v1 instanceof Array) {
    if (v2 instanceof Array) {
      if (v1.length !== v2.length) return false;

      for (let i = 0; i < v1.length; i++) {
        if (!MiscHelper.equals(v1[i], v2[i])) {
          return false;
        }
      }

      return true;
    }
    return false;

  } else if (v1 instanceof Object) {
    if (v2 instanceof Object) {
      return leftEqualsObject(v1, v2) && leftEqualsObject(v2, v1);
    }
    return false;

  }
  return v1 === v2;

};

MiscHelper.isSamePage = (url1, url2) => {
  url1 = url1 instanceof String ? MiscHelper.parseUrl(url1) : url1;
  url2 = url2 instanceof String ? MiscHelper.parseUrl(url2) : url2;

  // Ignore the hash when comparing to see if two pages represent the same resource:
  return url1.protocol === url2.protocol &&
    url1.host === url2.host &&
    url1.pathname === url2.pathname &&
    MiscHelper.equals(url1.query, url2.query);
};

MiscHelper.qualifyUrl = url => {
  const escapeHTML = s => s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');

  const el = document.createElement('div');

  el.innerHTML = `<a href="${escapeHTML(url)}">x</a>`;
  return el.firstChild.href;
};

MiscHelper.padLeft = (n, p, c) => {
  const pad_char = typeof c !== 'undefined' ? c : '0';
  const pad = new Array(1 + p).join(pad_char);

  return (pad + n).slice(-pad.length);
};

export default MiscHelper;
