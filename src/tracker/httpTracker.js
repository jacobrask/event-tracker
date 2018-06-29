export default class HttpTracker {
  constructor(config = {}) {
    if (!(this instanceof HttpTracker)) return new HttpTracker(config);
    if (!config.url) {
      throw Error('url is required!');
    }
    this.config = config;
    this.url = config.url;
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

    if (navigator.sendBeacon) {
      if (navigator.sendBeacon(this.url, JSON.stringify(info.value))) {
        typeof info.success === 'function' && info.success(null, null);
        return;
      }
    }

    xhr.open('POST', this.url, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = info.success;
    xhr.onerror = info.failure;
    xhr.send(JSON.stringify(info.value));
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
