class Handler {
  constructor() {
    this.handlers = [];
    this.onerror = (console && console.log) || window.onerror || ((e => {}));
  }

  push(f) {
    this.handlers.push(f);
  }

  dispatch() {
    const args = Array.prototype.slice.call(arguments, 0);
    let i;

    for (i = 0; i < this.handlers.length; i++) {
      try {
        this.handlers[i].apply(null, args);
      } catch (e) {
        onerror(e);
      }
    }
  }
}

export default Handler;
