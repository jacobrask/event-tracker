/* eslint-disable no-unused-vars */
class VideoEventProxy {
  constructor(iframe) {
    this.iframe = iframe;
    this.originUp = '*';
    this.originDown = 'https://mittmedia.solidtango.com';
    this.statusTimer = null;
    this.statusUpdateInterval = 1000;
    this.initialized = false;

    window.addEventListener(
      'message',
      this.receiveMessageDown.bind(this),
      false
    );

    this.startStatusTimer();
  }

  startStatusTimer() {
    this.statusTimer = window.setInterval((e) => {
      this.requestStatusUpdate();
    }, this.statusUpdateInterval);
  }

  stopStatusTimer() {
    window.clearInterval(this.statusTimer);
    this.statusTimer = null;
  }

  requestStatusUpdate() {
    this.sendMessageDown(this.iframe, 'playing');
  }

  requestMetaData() {
    this.sendMessageDown(this.iframe, 'metadata');
  }

  sendMessageDown(iframe, func) {
    const payload = {
      'event': 'message',
      'func': func
    };
    const message = JSON.stringify(payload);

    iframe.contentWindow.postMessage(
      message, this.originDown
    );
  }

  sendMessageUp(payload) {
    const message = JSON.stringify(payload);

    window.parent.postMessage(
      message, this.originUp
    );
  }

  receiveMessageDown(event) {
    if (this.initialized === false) {
      this.initialized = true;
      this.requestMetaData();
    }
    const data = JSON.parse(event.data);

    switch (data.func) {
      case 'playing':
        this.sendMessageUp({
          'event': 'message',
          'func': data.func,
          'args': data.args,
        });
        break;
      case 'metadata':
        this.sendMessageUp({
          'event': 'message',
          'func': data.func,
          'args': Object.assign({}, data.args, { src: this.iframe.src }),
        });
        break;
      default:
        break;
    }
  }
}

