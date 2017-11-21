import MiscUtil from 'miscUtil';
import DomUtil from 'domUtil';
import ArrayUtil from 'arrayUtil';
import Env from 'env';
import EventHelper from 'eventHelper';
// import BrowserDetect from 'browserDetect';

const EVENT_TYPE_VERSION = 1;
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
  constructor(options = {}, context = {}, user = {}, content = {}) {
    if (!(this instanceof Scribe)) return new Scribe(options, context);

    this.rootEvent = {};
    this.options = options;
    this.context = context;
    this.user = user;
    this.content = content;
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

    this.options = MiscUtil.merge({
      waitOnTracker: false,
      trackPageViews: false,
      trackClicks: false,
      trackHashChanges: false,
      trackEngagement: false,
      trackElementClicks: false,
      trackRedirects: false,
      trackSubmissions: false,
      clickElementSelectors: ['a']
    }, this.options);

    this.user = MiscUtil.merge({
      clientId: Env.getVisitorId()
    }, this.user);

    this.rootEvent =
    MiscUtil.merge({
      sessionId: Env.getSessionId()
    }, this.rootEvent);

    // Always assume that Javascript is the culprit of leaving the page
    // (we'll detect and intercept clicks on links and buttons as best
    // as possible and override this assumption in these cases):
    this.javascriptRedirect = true;

    self.oldHash = document.location.hash;

    const trackJump = hash => {
      if (self.oldHash !== hash) { // Guard against tracking more than once
        const id = hash.substring(1);

        // If it's a real node, get it so we can capture node data:
        const targetNode = document.getElementById(id);

        const data = MiscUtil.merge({
          url: MiscUtil.parseUrl(document.location)
        }, targetNode ? DomUtil.getNodeDescriptor(targetNode) : { id });

        self.track('jump', {
          eventCustomData: {
            target: data
          },
          source: {
            url: MiscUtil.merge(MiscUtil.parseUrl(document.location), {
              hash: self.oldHash // Override the hash
            })
          }
        });

        self.oldHash = hash;
      }
    };

    // Track page view
    if (this.options.trackPageViews) {
      EventHelper.onready(() => {
        // Track page view, but only after the DOM has loaded:
        self.pageview();
      });
    }

    // Track clicks
    if (this.options.trackClicks) {
      EventHelper.onready(() => {
        // Track all clicks to the document:
        EventHelper.onevent(document.body, 'click', true, e => {
          const ancestors = DomUtil.getAncestors(e.target);

          // Do not track clicks on links, these are tracked separately!
          if (!ArrayUtil.exists(ancestors, e => e.tagName === 'A')) {
            self.track('click', {
              eventCustomData: {
                target: DomUtil.getNodeDescriptor(e.target)
              }
            });
          }
        });
      });
    }

    // Track hash changes:
    if (this.options.trackHashChanges) {
      EventHelper.onhashchange(e => {
        trackJump(e.hash);
      });
    }

    // Track all engagement:
    if (this.options.trackEngagement) {
      EventHelper.onengage((start, end) => {
        self.track('engage', {
          eventCustomData: {
            target: DomUtil.getNodeDescriptor(start.target),
            duration: end.timeStamp - start.timeStamp
          }
        });
      });
    }

    // Track all clicks on links:
    if (this.options.trackElementClicks) {
      DomUtil.monitorElements(this.options.clickElementSelectors, el => {
        EventHelper.onevent(el, 'click', true, e => {
          // return if this click it created with createEvent and not by a real click
          // Neat but doesn't work in IE, Safari
          // if(!e.isTrusted) return;

          const target = e.target;

          // TODO: Make sure the link is actually to a page.
          // It's a click, not a Javascript redirect:
          self.javascriptRedirect = false;
          setTimeout(() => { self.javascriptRedirect = true; }, 500);

          const parsedUrl = MiscUtil.parseUrl(el.href);
          const value = {
            eventCustomData: {
              target: MiscUtil.merge({ url: parsedUrl }, DomUtil.getNodeDescriptor(el))
            }
          };

          if (MiscUtil.isSamePage(parsedUrl, document.location.href)) {
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
      EventHelper.onexit(e => {
        if (self.javascriptRedirect) {
          self.trackLater('redirect');
        }
      });
    }

    // Track form submissions:
    if (this.options.trackSubmissions) {
      EventHelper.onsubmit(e => {
        if (e.form) {
          if (!e.form.formId) {
            e.form.formId = MiscUtil.genGuid();
          }

          self.trackLater('formsubmit', {
            eventCustomData: { form: MiscUtil.merge({ formId: e.form.formId }, DomUtil.getFormData(e.form)) }
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
    MiscUtil.store.local.setItem('scribe_outbox', JSON.stringify(this.outbox));
  }

  _loadOutbox() {
    this.outbox = JSON.parse(MiscUtil.store.local.getItem('scribe_outbox') || '[]');
  }

  _sendOutbox() {
    const messages = [];

    for (const message of this.outbox) {
      const event_type = message.value.type;

      // Specially modify redirect, formSubmit events to save the new URL,
      // because the URL is not known at the time of the event:
      if (ArrayUtil.contains(['browser:redirect', 'browser:formSubmit'], event_type)) {
        message.value.eventCustomData = message.value.eventCustomData || {};
        message.value.eventCustomData.target = MiscUtil.jsonify(MiscUtil.merge(message.value.eventCustomData.target || {}, { url: MiscUtil.parseUrl(document.location) }));
      }

      // If source and target urls are the same, change redirect events
      // to reload events:
      if (event_type === 'browser:redirect') {
        try {
          // See if it's a redirect (= different url) or reload (= same url):
          const sourceUrl = MiscUtil.unparseUrl(message.value.source.url);
          const targetUrl = MiscUtil.unparseUrl(message.value.eventCustomData.target.url);

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
        this.trackerInstance.tracker({ value: messages });
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
    props.eventId = MiscUtil.genGuid();
    props.eventTypeVersion = EVENT_TYPE_VERSION;
    props.clientTimestamp = props.clientTimestamp || (new Date()).toISOString();
    props.type = `browser:${name}`;
    props.source = MiscUtil.merge(Env.getPageloadData(), props.source || {});
    const rootEvent = MiscUtil.merge({
      context: this.context,
      user: this.user,
      content: this.content
    }, this.rootEvent);

    return MiscUtil.jsonify(MiscUtil.merge(rootEvent, props));
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
      this.outbox.push({ value: this._createEvent(name, props) });
      index = this.outbox.length - 1;
    } else {
      this.outbox[index] = { value: this._createEvent(name, props) };
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
