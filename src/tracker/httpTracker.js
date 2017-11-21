export default class HttpTracker {
  constructor(config = {}) {
    if (!(this instanceof HttpTracker)) return new HttpTracker(config);
    if (!config.url) {
      throw Error('url is required!');
    }
    this.config = config;
    this.url = config.url;
  }

  tracker(info) {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', this.url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.withCredentials = true;
    xhr.onload = info.success;
    xhr.onerror = info.failure;
    xhr.send(JSON.stringify(info.value));
  }
}
