import MiscUtil from 'miscUtil';
import DomUtil from 'domUtil';
import ArrayUtil from 'arrayUtil';
import Env from 'env';
import EventHelper from 'eventHelper';
import merge from 'lodash.merge';

const EVENT_TYPE_VERSION = 1;
/**
 * Constructs a new EventTracker Analytics tracker.
 *
 * @constructor EventTracker
 *
 * @param options.tracker   The tracker to use for tracking events.
 *                          Must be: function(collection, event).
 *
 */

export default class EventTracker {
  constructor(options = {}, initialData = {}) {
    if (!(this instanceof EventTracker)) return new EventTracker(options, initialData);

    this.rootEvent = {};
    this.options = options;
    this.trackerInstance = options.tracker;

    this.context = initialData.context;
    this.user = initialData.user;
    this.content = initialData.content;

    this.initialize();
  }

  options() {
    return this.options;
  }

  context() {
    return this.context;
  }

  setContext(context) {
    this.context = context;
  }

  content() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }

  user() {
    return this.user;
  }

  setUser(user) {
    this.user = user;
  }

  /**
   * Initializes EventTracker. This is called internally by the constructor and does
   * not need to be called manually.
   */
  initialize() {
    const self = this;

    this.options = merge({
      waitOnTracker: false,
      trackPageViews: false,
      trackClicks: false,
      trackActiveTime: false,
      trackHashChanges: false,
      trackEngagement: false,
      trackElementClicks: false,
      trackRedirects: false,
      trackSubmissions: false,
      clickElementSelectors: ['a'],
      eventTypePrefix: 'browser',
      eventTypeVersion: EVENT_TYPE_VERSION,
      postProcessors: []
    }, this.options);

    this.rootEvent =
    merge({
      sessionId: Env.getSessionId(),
      clientId: Env.getClientId(),
      rootEventId: MiscUtil.genGuid()
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

        const data = merge({
          url: MiscUtil.parseUrl(document.location)
        }, targetNode ? DomUtil.getNodeDescriptor(targetNode) : { id });

        self.track('jump', {
          eventCustomData: {
            target: data
          },
          source: {
            url: merge(MiscUtil.parseUrl(document.location), {
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
          // Beware, this should check if trackElementSelectors is true and if current element is in clickElementSelectors.
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
              target: merge({ url: parsedUrl }, DomUtil.getNodeDescriptor(el))
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
            eventCustomData: { form: merge({ formId: e.form.formId }, DomUtil.getFormData(e.form)) }
          });
        }
      });
    }
    // Track form abandonments:

    // Track active time
    if (this.options.trackActiveTime) {
      const trackTime = {
        trackIndex: null,
        startTime: null,
        endTime: null,
        secondsActive: 0,
        lastActive: null,
        updateTime: function () {
          if (this.lastActive !== null && (Date.now() - this.lastActive) / 1000 < 5) {
            this.secondsActive = this.secondsActive + 1;
            this.startTime = this.startTime || (new Date()).toISOString();
            this.trackIndex = self.trackLater('activetime', {
              eventCustomData: {
                activetime: {
                  startTime: this.startTime,
                  endTime: (new Date()).toISOString(),
                  secondsActive: this.secondsActive
                }
              }
            }, this.trackIndex);
          }
        },
        updateActive: function () {
          this.lastActive = Date.now();
        }
      };

      document.addEventListener('mousemove', trackTime.updateActive.bind(trackTime));
      document.addEventListener('keydown', trackTime.updateActive.bind(trackTime));
      document.addEventListener('scroll', trackTime.updateActive.bind(trackTime));
      setInterval(trackTime.updateTime.bind(trackTime), 1000);
    }

    this.outbox = [];

    if (!navigator.sendBeacon) {
      // Load and send any pending events:
      this._sendOutboxes();

      // Mark outbox as done on unload
      window.addEventListener('unload', (event) => {
        this._finishOutbox();
      });
    } else {
      window.addEventListener('unload', (event) => {
        this._sendOutbox(this.outbox);
      });
    }
  }

  _finishOutbox() {
    let outboxes = JSON.parse(MiscUtil.store.local.getItem('event_tracker_outboxes') || '{}');

    outboxes[this.rootEvent.rootEventId] = { finished: true, datetime: Date.now() };
    MiscUtil.store.local.setItem('event_tracker_outboxes', JSON.stringify(outboxes));
  }
  _saveOutbox() {
    MiscUtil.store.local.setItem('event_tracker_outbox_' + this.rootEvent.rootEventId, JSON.stringify(this.outbox));
    let outboxes = JSON.parse(MiscUtil.store.local.getItem('event_tracker_outboxes') || '{}');

    outboxes[this.rootEvent.rootEventId] = { finished: false, datetime: Date.now() };
    MiscUtil.store.local.setItem('event_tracker_outboxes', JSON.stringify(outboxes));
  }
  _sendOutboxes() {
    let outboxes = JSON.parse(MiscUtil.store.local.getItem('event_tracker_outboxes') || '{}');

    outboxes = Object.entries(outboxes).filter(([rootEventId, value], index, arr) => {
      if (value.finished === true) {
        let outbox = JSON.parse(MiscUtil.store.local.getItem('event_tracker_outbox_' + rootEventId) || '[]');

        this._sendOutbox(outbox);
        MiscUtil.store.local.removeItem('event_tracker_outbox_' + rootEventId);
        return false;
      }

      if (Date.now() - value.datetime > 24 * 60 * 60 * 1000) {
        let outbox = JSON.parse(MiscUtil.store.local.getItem('event_tracker_outbox_' + rootEventId) || '[]');

        this._sendOutbox(outbox);
        MiscUtil.store.local.removeItem('event_tracker_outbox_' + rootEventId);
        return false;
      }
      return true;
    });

    if (outboxes !== undefined && outboxes.length > 0) {
      outboxes = Object.assign(...outboxes.map(d => ({ [d[0]]: d[1] })));
      MiscUtil.store.local.setItem('event_tracker_outboxes', JSON.stringify(outboxes));
    } else {
      MiscUtil.store.local.setItem('event_tracker_outboxes', JSON.stringify({}));
    }
  }

  _sendOutbox(outbox) {
    const messages = [];

    for (const message of outbox) {
      const eventType = message.value.eventType;

      // Specially modify redirect, formSubmit events to save the new URL,
      // because the URL is not known at the time of the event:
      if (ArrayUtil.contains([`${this.options.eventTypePrefix}:redirect`, `${this.options.eventTypePrefix}:formSubmit`], eventType)) {
        message.value.eventCustomData = message.value.eventCustomData || {};
        message.value.eventCustomData.target = MiscUtil.jsonify(merge(message.value.eventCustomData.target || {}, { url: MiscUtil.parseUrl(document.location) }));
      }

      // If source and target urls are the same, change redirect events
      // to reload events:
      if (eventType === `${this.options.eventTypePrefix}:redirect`) {
        try {
          // See if it's a redirect (= different url) or reload (= same url):
          const sourceUrl = MiscUtil.unparseUrl(message.value.source.url);
          const targetUrl = MiscUtil.unparseUrl(message.value.eventCustomData.target.url);

          if (sourceUrl === targetUrl) {
            // It's a reload:
            message.value.eventType = `${this.options.eventTypePrefix}:reload`;
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
  }

  /**
   * A utility function to create an event. Adds timestamp, stores the name
   * of the event and contextual data, and generates an idiomatic, trimmed
   * JSON objects that contains all event details.
   */
  _createEvent(name, props = {}) {
    props.eventId = props.eventId || MiscUtil.genGuid();
    props.eventTypeVersion = props.eventTypeVersion || this.options.eventTypeVersion;
    props.clientTimestamp = props.clientTimestamp || (new Date()).toISOString();
    props.eventType = `${this.options.eventTypePrefix}:${name}`;
    props.source = merge(Env.getPageloadData(), props.source || {});
    const rootEvent = merge({
      context: this.context,
      user: this.user,
      content: this.content
    }, this.rootEvent);
    const merged = merge(rootEvent, props);

    this.options.postProcessors.map(function (fn) {
      fn(merged);
    });

    return MiscUtil.jsonify(merged);
  }

  /**
   * Tracks an event now.
   *
   * @memberof EventTracker
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
   * some page on the same domain that has EventTracker Analytics installed.
   *
   * This function is mainly useful when the user is leaving the page and
   * there is not enough time to capture some user behavior.
   *
   * @memberof EventTracker
   *
   * @param name        The name of the event, such as 'downloaded trial'.
   * @param props       An arbitrary JSON object describing properties of the event.
   *
   */
  trackLater(name, props, index) {

    if (index === undefined || index === null) {
      this.outbox.push({ value: this._createEvent(name, props) });
      index = this.outbox.length - 1;
    } else {
      this.outbox[index] = { value: this._createEvent(name, props) };
    }
    if (!navigator.sendBeacon) {
      this._saveOutbox();
    }
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
