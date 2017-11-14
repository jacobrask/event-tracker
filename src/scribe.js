import Util from 'utils';
import DomUtil from 'domUtil';
import ArrayUtil from 'arrayUtil';
import Env from 'env';
import Geo from 'geo';
import Events from 'events';
// import BrowserDetect from 'browserDetect';

/**
 * Constructs a new Scribe Analytics tracker.
 *
 * @constructor Scribe
 *
 * @param options.tracker   The tracker to use for tracking events.
 *                          Must be: function(collection, event).
 *
 */
export default class Scribe {
  constructor(options, context) {
    options = options || {};
    context = context || {};

    this.options = options;
    this.context = context;
    this.trackerInstance = options.tracker;

    this.initialize();
  }

  options() {
    return this.options;
  }

  context() {
    return this.context;
  }

  /**
   * Initializes Scribe. This is called internally by the constructor and does
   * not need to be called manually.
   */
  initialize() {
    const self = this;

    this.options = Util.merge({
      bucket: 'none',
      breakoutUsers: false,
      breakoutVisitors: false,
      waitOnTracker: false,
      resolveGeo: false,
      trackPageViews: false,
      trackClicks: false,
      trackHashChanges: false,
      trackEngagement: false,
      trackElementClicks: false,
      trackRedirects: false,
      trackSubmissions: false,
      clickElementSelectors: ['a']
    }, this.options);

    // Always assume that Javascript is the culprit of leaving the page
    // (we'll detect and intercept clicks on links and buttons as best
    // as possible and override this assumption in these cases):
    this.javascriptRedirect = true;

    this.context = {};

    this.context.fingerprint = Env.getFingerprint();

    this.context.session_id = ((() => {
      const session_id = Util.store.session.getItem('scribe_sid') || Util.genGuid();

      Util.store.session.setItem('scribe_sid', session_id);

      return session_id;
    }))();

    // this.context.visitor_id = ((() => window.Util.visitor_id()))();

    self.oldHash = document.location.hash;

    const trackJump = hash => {
      if (self.oldHash !== hash) { // Guard against tracking more than once
        const id = hash.substring(1);

        // If it's a real node, get it so we can capture node data:
        const targetNode = document.getElementById(id);

        const data = Util.merge({
          url: Util.parseUrl(document.location)
        }, targetNode ? DomUtil.getNodeDescriptor(targetNode) : {id});

        self.track('jump', {
          target: data,
          source: {
            url: Util.merge(Util.parseUrl(document.location), {
              hash: self.oldHash // Override the hash
            })
          }
        });

        self.oldHash = hash;
      }
    };

    // Try to obtain geo location if possible:
    if (this.options.resolveGeo) {
      Geo.geoip(position => {
        self.context.geo = position;
      });
    }

    // Track page view
    if (this.options.trackPageViews) {
      Events.onready(() => {
        // Track page view, but only after the DOM has loaded:
        self.pageview();
      });
    }

    // Track clicks
    if (this.options.trackClicks) {
      Events.onready(() => {
        // Track all clicks to the document:
        Events.onevent(document.body, 'click', true, e => {
          const ancestors = DomUtil.getAncestors(e.target);

          // Do not track clicks on links, these are tracked separately!
          if (!ArrayUtil.exists(ancestors, e => e.tagName === 'A')) {
            self.track('click', {
              target: DomUtil.getNodeDescriptor(e.target)
            });
          }
        });
      });
    }

    // Track hash changes:
    if (this.options.trackHashChanges) {
      Events.onhashchange(e => {
        trackJump(e.hash);
      });
    }

    // Track all engagement:
    if (this.options.trackEngagement) {
      Events.onengage((start, end) => {
        self.track('engage', {
          target: DomUtil.getNodeDescriptor(start.target),
          duration: end.timeStamp - start.timeStamp
        });
      });
    }

    // Track all clicks on links:
    if (this.options.trackElementClicks) {
      DomUtil.monitorElements(this.options.clickElementSelectors, el => {
        Events.onevent(el, 'click', true, e => {
          // return if this click it created with createEvent and not by a real click
          // Neat but doesn't work in IE, Safari
          // if(!e.isTrusted) return;

          const target = e.target;

          // TODO: Make sure the link is actually to a page.
          // It's a click, not a Javascript redirect:
          self.javascriptRedirect = false;
          setTimeout(() => {self.javascriptRedirect = true;}, 500);

          const parsedUrl = Util.parseUrl(el.href);
          const value = {target: Util.merge({url: parsedUrl}, DomUtil.getNodeDescriptor(el))};

          if (Util.isSamePage(parsedUrl, document.location.href)) {
            // User is jumping around the same page. Track here in case the
            // client prevents the default action and the hash doesn't change
            // (otherwise it would be tracked by onhashchange):
            self.oldHash = undefined;

            trackJump(document.location.hash);
          } else if (parsedUrl.hostname === document.location.hostname) {
            // We are linking to a page on the same site. There's no need to send
            // the event now, we can safely send it later:
            self.trackLater('click', value);
          } else {
            if (self.options.waitOnTracker) e.preventDefault();

            // We are linking to a page that is not on this site. So we first
            // wait to send the event before simulating a different click
            // on the link. This ensures we don't lose the event if the user
            // does not return to this site ever again.
            self.track('click',
              value,
              () => {
                // It's a click, not a Javascript redirect:
                self.javascriptRedirect = false;

                // Simulate a click to the original element if we were waiting on the tracker:
                if (self.options.waitOnTracker) DomUtil.simulateMouseEvent(target, 'click');
              }
            );
          }
        });
      });
    }

    // Track JavaScript-based redirects, which can occur without warning:
    if (this.options.trackRedirects) {
      Events.onexit(e => {
        if (self.javascriptRedirect) {
          self.trackLater('redirect');
        }
      });
    }

    // Track form submissions:
    if (this.options.trackSubmissions) {
      Events.onsubmit(e => {
        if (e.form) {
          if (!e.form.formId) {
            e.form.formId = Util.genGuid();
          }

          self.trackLater('formsubmit', {
            form: Util.merge({formId: e.form.formId}, DomUtil.getFormData(e.form))
          });
        }
      });
    }
    // Track form abandonments:

    // Load and send any pending events:
    this._loadOutbox();
    this._sendOutbox();
  }

  _saveOutbox() {
    Util.store.local.setItem('scribe_outbox', JSON.stringify(this.outbox));
  }

  _loadOutbox() {
    this.outbox = JSON.parse(Util.store.local.getItem('scribe_outbox') || '[]');
  }

  _sendOutbox() {
    const messages = [];

    for (const message of this.outbox) {
      const event_type = message.value.type;

      // Specially modify redirect, formSubmit events to save the new URL,
      // because the URL is not known at the time of the event:
      if (ArrayUtil.contains(['browser:redirect', 'browser:formSubmit'], event_type)) {
        message.value.target = Util.jsonify(Util.merge(message.value.target || {}, {url: Util.parseUrl(document.location)}));
      }

      // If source and target urls are the same, change redirect events
      // to reload events:
      if (event_type === 'browser:redirect') {
        try {
          // See if it's a redirect (= different url) or reload (= same url):
          const sourceUrl = Util.unparseUrl(message.value.source.url);
          const targetUrl = Util.unparseUrl(message.value.target.url);

          if (sourceUrl === targetUrl) {
            // It's a reload:
            message.value.type = 'browser:reload';
          }
        } catch (e) {
          window.onerror && window.onerror(e);
        }
      }

      messages.push(message.value);
    }

    if (messages.length > 0) {
      try {
        this.trackerInstance.tracker({value: messages});
      } catch (e) {
        // Don't let one bad apple spoil the batch.
        window.onerror && window.onerror(e);
      }
    }
    this.outbox = [];
    this._saveOutbox();
  }

  /**
   * A utility function to create an event. Adds timestamp, stores the name
   * of the event and contextual data, and generates an idiomatic, trimmed
   * JSON objects that contains all event details.
   */
  _createEvent(name, props = {}) {
    props.timestamp = props.timestamp || (new Date()).toISOString();
    props.type = `browser:${name}`;
    props.source = Util.merge(Env.getPageloadData(), props.source || {});
    // Todo: Should be broken out
    props.mm = Env.getMMData();
    return Util.jsonify(Util.merge(this.context, props));
  }

  /**
   * Tracks an event now.
   *
   * @memberof Scribe
   *
   * @param name        The name of the event, such as 'downloaded trial'.
   * @param props       An arbitrary JSON object describing properties of the event.
   * @param callback    A function to call when the tracking is complete.
   *
   */
  track(name, props, success, failure) {
    this.trackerInstance.tracker({
      value: this._createEvent(name, props),
      success,
      failure
    });
  }

  /**
   * Tracks an event later. The event will only be tracked if the user visits
   * some page on the same domain that has Scribe Analytics installed.
   *
   * This function is mainly useful when the user is leaving the page and
   * there is not enough time to capture some user behavior.
   *
   * @memberof Scribe
   *
   * @param name        The name of the event, such as 'downloaded trial'.
   * @param props       An arbitrary JSON object describing properties of the event.
   *
   */
  trackLater(name, props, index) {
    if (index === undefined) {
      this.outbox.push({value: this._createEvent(name, props)});
      index = this.outbox.length - 1;
    } else {
      this.outbox[index] = {value: this._createEvent(name, props)};
    }

    this._saveOutbox();
    return index;
  }

  /**
   * Tracks a page view.
   *
   */
  pageview(url = document.location, success, failure) {
    this.track('pageview', {}, success, failure);
  }
}
