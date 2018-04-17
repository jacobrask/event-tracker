export default class ConsoleTracker {
  constructor(config) {
    if (!(this instanceof ConsoleTracker)) return new ConsoleTracker(config);
    this.config = config;
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
    const value = info.value;

    if (typeof console !== 'undefined') {
      console.log(value);

      info.success && setTimeout(info.success, 0);
    } else {
      info.failure && setTimeout(info.failure, 0);
    }
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
