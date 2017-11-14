export default class ConsoleTracker {
  constructor(config) {
    if (!(this instanceof ConsoleTracker)) return new ConsoleTracker(config);

    this.config = config;
  }

  tracker(info) {
    const value = info.value;

    if (typeof console !== 'undefined') {
      console.log(value);

      info.success && setTimeout(info.success, 0);
    } else {
      info.failure && setTimeout(info.failure, 0);
    }
  }
}
