export default class HttpTracker {
  constructor(config = {}) {
    if (!(this instanceof HttpTracker)) return new HttpTracker(config);
    if (!config.url) {
      throw Error('url is required!');
    }
    this.config = config;
    this.url = config.url;
    // This is because if a bug in chrome for ios (https://bugs.chromium.org/p/chromium/issues/detail?id=878562)
    this.first = true;
    if (config.filters) {
      this.filters = config.filters;
      this._tracker = this._filterAndTrack.bind(this);
    } else {
      this._tracker = this._track.bind(this);
    }
  }

  tracker(info) {
    this._tracker(info);
  }

  _track(info) {
    const xhr = new XMLHttpRequest();

    // !this.first is because if a bug in chrome for ios (https://bugs.chromium.org/p/chromium/issues/detail?id=878562)
    if (!this.first && navigator.sendBeacon) {
      if (navigator.sendBeacon(this.url, JSON.stringify(info.value))) {
        typeof info.success === 'function' && info.success(null, null);
        return;
      }
    }

    // this.first is because if a bug in chrome for ios (https://bugs.chromium.org/p/chromium/issues/detail?id=878562)
    xhr.open('POST', this.url, this.first);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.withCredentials = true;
    xhr.onload = info.success;
    xhr.onerror = info.failure;
    xhr.send(JSON.stringify(info.value));

    // This is because if a bug in chrome for ios (https://bugs.chromium.org/p/chromium/issues/detail?id=878562)
    this.first = false;
  }

  _filterAndTrack(info) {
    if (Array.isArray(info.value)) {
      info.value = info.value.filter(this._validate.bind(this));
      if (info.value.length > 0) this._track(info);
    } else {
      if (this._validate(info.value)) this._track(info);
    }
  }

  _validate(value) {
    return !this.filters.some((v)=> !v(value));
  }
}
