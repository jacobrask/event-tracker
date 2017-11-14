(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Scribe", [], factory);
	else if(typeof exports === 'object')
		exports["Scribe"] = factory();
	else
		root["Scribe"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var MiscHelper = {};

// Needed to handle private browsing in safari and quota exceded
MiscHelper.store = {
  getItem: function getItem(storage, key) {
    return storage.getItem(key);
  },
  setItem: function setItem(storage, key, value) {
    try {
      return storage.setItem(key, value);
    } catch (domException) {
      if (domException.name === 'QuotaExceededError' || domException.name === 'SecurityError' || domException.name === 'NS_ERROR_DOM_QUOTA_REACHED') {}
      return null;
    }
  },

  session: {
    getItem: function getItem(key) {
      return MiscHelper.store.getItem(window.sessionStorage, key);
    },
    setItem: function setItem(key, value) {
      return MiscHelper.store.setItem(sessionStorage, key, value);
    }
  },
  local: {
    getItem: function getItem(key) {
      return MiscHelper.store.getItem(window.localStorage, key);
    },
    setItem: function setItem(key, value) {
      return MiscHelper.store.setItem(localStorage, key, value);
    }
  }
};

MiscHelper.copyFields = function (source, target) {
  var createDelegate = function createDelegate(source, value) {
    return function () {
      return value.apply(source, arguments);
    };
  };

  target = target || {};

  var key = void 0;
  var value = void 0;

  for (key in source) {
    if (!/layerX|Y/.test(key)) {
      value = source[key];

      if (typeof value === 'function') {
        // Bind functions to object being copied (???):
        target[key] = createDelegate(source, value);
      } else {
        target[key] = value;
      }
    }
  }

  return target;
};

MiscHelper.merge = function (o1, o2) {
  var r = void 0;
  var key = void 0;
  var index = void 0;

  if (o1 === undefined) return o1;else if (o2 === undefined) return o1;else if (o1 instanceof Array && o2 instanceof Array) {
    r = [];
    // Copy
    for (index = 0; index < o1.length; index++) {
      r.push(o1[index]);
    }
    // Merge
    for (index = 0; index < o2.length; index++) {
      if (r.length > index) {
        r[index] = MiscHelper.merge(r[index], o2[index]);
      } else {
        r.push(o2[index]);
      }
    }
    return r;
  } else if (o1 instanceof Object && o2 instanceof Object) {
    r = {};
    // Copy:
    for (key in o1) {
      r[key] = o1[key];
    }
    // Merge:
    for (key in o2) {
      if (r[key] !== undefined) {
        r[key] = MiscHelper.merge(r[key], o2[key]);
      } else {
        r[key] = o2[key];
      }
    }
    return r;
  }
  return o2;
};

MiscHelper.toObject = function (olike) {
  var o = {};
  var key = void 0;

  for (key in olike) {
    o[key] = olike[key];
  }

  return o;
};

MiscHelper.genGuid = function () {
  var s4 = function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  };

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

MiscHelper.parseQueryString = function (qs) {
  var pairs = {};

  if (qs.length > 0) {
    var query = qs.charAt(0) === '?' ? qs.substring(1) : qs;

    if (query.length > 0) {
      var vars = query.split('&');

      for (var i = 0; i < vars.length; i++) {
        if (vars[i].length > 0) {
          var pair = vars[i].split('=');

          try {
            var name = decodeURIComponent(pair[0]);
            var value = pair.length > 1 ? decodeURIComponent(pair[1]) : 'true';

            pairs[name] = value;
          } catch (e) {}
        }
      }
    }
  }
  return pairs;
};

MiscHelper.unparseQueryString = function (qs) {
  var kvs = [];
  var k = void 0;
  var v = void 0;

  for (k in qs) {
    if (!qs.hasOwnProperty || qs.hasOwnProperty(k)) {
      v = qs[k];

      kvs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
  }
  var string = kvs.join('&');

  if (string.length > 0) return '?' + string;
  return '';
};

MiscHelper.size = function (v) {
  if (v === undefined) return 0;else if (v instanceof Array) return v.length;else if (v instanceof Object) {
    var size = 0;

    for (var key in v) {
      if (!v.hasOwnProperty || v.hasOwnProperty(key)) ++size;
    }
    return size;
  }return 1;
};

MiscHelper.mapJson = function (v, f) {
  var vp = void 0;
  var vv = void 0;

  if (v instanceof Array) {
    vp = [];
    for (var i = 0; i < v.length; i++) {
      vv = MiscHelper.mapJson(v[i], f);

      if (MiscHelper.size(vv) > 0) vp.push(vv);
    }
    return vp;
  } else if (v instanceof Object) {
    vp = {};
    for (var k in v) {
      vv = MiscHelper.mapJson(v[k], f);

      if (MiscHelper.size(vv) > 0) vp[k] = vv;
    }
    return vp;
  }return f(v);
};

MiscHelper.jsonify = function (v) {
  return MiscHelper.mapJson(v, function (v) {
    if (v === '') return undefined;

    var r = void 0;

    try {
      r = JSON.parse(v);
    } catch (e) {
      r = v;
    }

    return r;
  });
};

MiscHelper.undup = function (f, cutoff) {
  cutoff = cutoff || 250;

  var lastInvoked = 0;

  return function () {
    var curTime = new Date().getTime();
    var delta = curTime - lastInvoked;

    if (delta > cutoff) {
      lastInvoked = curTime;

      return f.apply(this, arguments);
    }
    return undefined;
  };
};

MiscHelper.parseUrl = function (url) {
  var l = document.createElement('a');

  l.href = url;
  if (l.host === '') {
    l.href = l.href;
  }
  return {
    hash: l.hash,
    host: l.host,
    hostname: l.hostname,
    pathname: l.pathname,
    protocol: l.protocol,
    query: MiscHelper.parseQueryString(l.search)
  };
};

MiscHelper.unparseUrl = function (url) {
  return (url.protocol || '') + '//' + (url.host || '') + (url.pathname || '') + MiscHelper.unparseQueryString(url.query) + (url.hash || '');
};

MiscHelper.equals = function (v1, v2) {
  var leftEqualsObject = function leftEqualsObject(o1, o2) {
    for (var k in o1) {
      if (!o1.hasOwnProperty || o1.hasOwnProperty(k)) {
        if (!MiscHelper.equals(o1[k], o2[k])) return false;
      }
    }
    return true;
  };

  if (v1 instanceof Array) {
    if (v2 instanceof Array) {
      if (v1.length !== v2.length) return false;

      for (var i = 0; i < v1.length; i++) {
        if (!MiscHelper.equals(v1[i], v2[i])) {
          return false;
        }
      }

      return true;
    }
    return false;
  } else if (v1 instanceof Object) {
    if (v2 instanceof Object) {
      return leftEqualsObject(v1, v2) && leftEqualsObject(v2, v1);
    }
    return false;
  }
  return v1 === v2;
};

MiscHelper.isSamePage = function (url1, url2) {
  url1 = url1 instanceof String ? MiscHelper.parseUrl(url1) : url1;
  url2 = url2 instanceof String ? MiscHelper.parseUrl(url2) : url2;

  // Ignore the hash when comparing to see if two pages represent the same resource:
  return url1.protocol === url2.protocol && url1.host === url2.host && url1.pathname === url2.pathname && MiscHelper.equals(url1.query, url2.query);
};

MiscHelper.qualifyUrl = function (url) {
  var escapeHTML = function escapeHTML(s) {
    return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
  };

  var el = document.createElement('div');

  el.innerHTML = '<a href="' + escapeHTML(url) + '">x</a>';
  return el.firstChild.href;
};

MiscHelper.padLeft = function (n, p, c) {
  var pad_char = typeof c !== 'undefined' ? c : '0';
  var pad = new Array(1 + p).join(pad_char);

  return (pad + n).slice(-pad.length);
};

exports.default = MiscHelper;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var ArrayUtil = {};

ArrayUtil.removeElement = function (array, from, to) {
  var tail = array.slice((to || from) + 1 || array.length);

  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, _toConsumableArray(tail));
};

ArrayUtil.toArray = function (alike) {
  var arr = [];
  var i = void 0;
  var len = alike.length;

  arr.length = alike.length;

  for (i = 0; i < len; i++) {
    arr[i] = alike[i];
  }

  return arr;
};

ArrayUtil.contains = function (array, el) {
  return ArrayUtil.exists(array, function (e) {
    return e === el;
  });
};

ArrayUtil.diff = function (arr1, arr2) {
  var i = void 0;
  var el = void 0;
  var diff = [];

  for (i = 0; i < arr1.length; i++) {
    el = arr1[i];

    if (!ArrayUtil.contains(arr2, el)) diff.push(el);
  }
  return diff;
};

ArrayUtil.exists = function (array, f) {
  for (var i = 0; i < array.length; i++) {
    if (f(array[i])) return true;
  }
  return false;
};

ArrayUtil.map = function (array, f) {
  var r = [];
  var i = void 0;

  for (i = 0; i < array.length; i++) {
    r.push(f(array[i]));
  }
  return r;
};

exports.default = ArrayUtil;
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConsoleTracker = exports.Scribe = undefined;

var _scribe = __webpack_require__(3);

var _scribe2 = _interopRequireDefault(_scribe);

var _consoleTracker = __webpack_require__(12);

var _consoleTracker2 = _interopRequireDefault(_consoleTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Scribe = _scribe2.default;
exports.ConsoleTracker = _consoleTracker2.default;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _miscUtil = __webpack_require__(0);

var _miscUtil2 = _interopRequireDefault(_miscUtil);

var _domUtil = __webpack_require__(4);

var _domUtil2 = _interopRequireDefault(_domUtil);

var _arrayUtil = __webpack_require__(1);

var _arrayUtil2 = _interopRequireDefault(_arrayUtil);

var _env = __webpack_require__(5);

var _env2 = _interopRequireDefault(_env);

var _geo = __webpack_require__(9);

var _geo2 = _interopRequireDefault(_geo);

var _eventHelper = __webpack_require__(10);

var _eventHelper2 = _interopRequireDefault(_eventHelper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var Scribe = function () {
  function Scribe(options, context) {
    _classCallCheck(this, Scribe);

    if (!(this instanceof Scribe)) return new Scribe(options, context);
    options = options || {};
    context = context || {};

    this.options = options;
    this.context = context;
    this.trackerInstance = options.tracker;

    this.initialize();
  }

  _createClass(Scribe, [{
    key: 'options',
    value: function options() {
      return this.options;
    }
  }, {
    key: 'context',
    value: function context() {
      return this.context;
    }

    /**
     * Initializes Scribe. This is called internally by the constructor and does
     * not need to be called manually.
     */

  }, {
    key: 'initialize',
    value: function initialize() {
      var self = this;

      this.options = _miscUtil2.default.merge({
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

      this.context = _miscUtil2.default.merge({
        session_id: _env2.default.getSessionId(),
        visitor_id: _env2.default.getVisitorId()
      }, this.context);

      // Always assume that Javascript is the culprit of leaving the page
      // (we'll detect and intercept clicks on links and buttons as best
      // as possible and override this assumption in these cases):
      this.javascriptRedirect = true;

      self.oldHash = document.location.hash;

      var trackJump = function trackJump(hash) {
        if (self.oldHash !== hash) {
          // Guard against tracking more than once
          var id = hash.substring(1);

          // If it's a real node, get it so we can capture node data:
          var targetNode = document.getElementById(id);

          var data = _miscUtil2.default.merge({
            url: _miscUtil2.default.parseUrl(document.location)
          }, targetNode ? _domUtil2.default.getNodeDescriptor(targetNode) : { id: id });

          self.track('jump', {
            target: data,
            source: {
              url: _miscUtil2.default.merge(_miscUtil2.default.parseUrl(document.location), {
                hash: self.oldHash // Override the hash
              })
            }
          });

          self.oldHash = hash;
        }
      };

      // Try to obtain geo location if possible:
      if (this.options.resolveGeo) {
        _geo2.default.geoip(function (position) {
          self.context.geo = position;
        });
      }

      // Track page view
      if (this.options.trackPageViews) {
        _eventHelper2.default.onready(function () {
          // Track page view, but only after the DOM has loaded:
          self.pageview();
        });
      }

      // Track clicks
      if (this.options.trackClicks) {
        _eventHelper2.default.onready(function () {
          // Track all clicks to the document:
          _eventHelper2.default.onevent(document.body, 'click', true, function (e) {
            var ancestors = _domUtil2.default.getAncestors(e.target);

            // Do not track clicks on links, these are tracked separately!
            if (!_arrayUtil2.default.exists(ancestors, function (e) {
              return e.tagName === 'A';
            })) {
              self.track('click', {
                target: _domUtil2.default.getNodeDescriptor(e.target)
              });
            }
          });
        });
      }

      // Track hash changes:
      if (this.options.trackHashChanges) {
        _eventHelper2.default.onhashchange(function (e) {
          trackJump(e.hash);
        });
      }

      // Track all engagement:
      if (this.options.trackEngagement) {
        _eventHelper2.default.onengage(function (start, end) {
          self.track('engage', {
            target: _domUtil2.default.getNodeDescriptor(start.target),
            duration: end.timeStamp - start.timeStamp
          });
        });
      }

      // Track all clicks on links:
      if (this.options.trackElementClicks) {
        _domUtil2.default.monitorElements(this.options.clickElementSelectors, function (el) {
          _eventHelper2.default.onevent(el, 'click', true, function (e) {
            // return if this click it created with createEvent and not by a real click
            // Neat but doesn't work in IE, Safari
            // if(!e.isTrusted) return;

            var target = e.target;

            // TODO: Make sure the link is actually to a page.
            // It's a click, not a Javascript redirect:
            self.javascriptRedirect = false;
            setTimeout(function () {
              self.javascriptRedirect = true;
            }, 500);

            var parsedUrl = _miscUtil2.default.parseUrl(el.href);
            var value = { target: _miscUtil2.default.merge({ url: parsedUrl }, _domUtil2.default.getNodeDescriptor(el)) };

            if (_miscUtil2.default.isSamePage(parsedUrl, document.location.href)) {
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
              self.track('click', value, function () {
                // It's a click, not a Javascript redirect:
                self.javascriptRedirect = false;

                // Simulate a click to the original element if we were waiting on the tracker:
                if (self.options.waitOnTracker) _domUtil2.default.simulateMouseEvent(target, 'click');
              });
            }
          });
        });
      }

      // Track JavaScript-based redirects, which can occur without warning:
      if (this.options.trackRedirects) {
        _eventHelper2.default.onexit(function (e) {
          if (self.javascriptRedirect) {
            self.trackLater('redirect');
          }
        });
      }

      // Track form submissions:
      if (this.options.trackSubmissions) {
        _eventHelper2.default.onsubmit(function (e) {
          if (e.form) {
            if (!e.form.formId) {
              e.form.formId = _miscUtil2.default.genGuid();
            }

            self.trackLater('formsubmit', {
              form: _miscUtil2.default.merge({ formId: e.form.formId }, _domUtil2.default.getFormData(e.form))
            });
          }
        });
      }
      // Track form abandonments:

      // Load and send any pending events:
      this._loadOutbox();
      this._sendOutbox();
    }
  }, {
    key: '_saveOutbox',
    value: function _saveOutbox() {
      _miscUtil2.default.store.local.setItem('scribe_outbox', JSON.stringify(this.outbox));
    }
  }, {
    key: '_loadOutbox',
    value: function _loadOutbox() {
      this.outbox = JSON.parse(_miscUtil2.default.store.local.getItem('scribe_outbox') || '[]');
    }
  }, {
    key: '_sendOutbox',
    value: function _sendOutbox() {
      var messages = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.outbox[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var message = _step.value;

          var event_type = message.value.type;

          // Specially modify redirect, formSubmit events to save the new URL,
          // because the URL is not known at the time of the event:
          if (_arrayUtil2.default.contains(['browser:redirect', 'browser:formSubmit'], event_type)) {
            message.value.target = _miscUtil2.default.jsonify(_miscUtil2.default.merge(message.value.target || {}, { url: _miscUtil2.default.parseUrl(document.location) }));
          }

          // If source and target urls are the same, change redirect events
          // to reload events:
          if (event_type === 'browser:redirect') {
            try {
              // See if it's a redirect (= different url) or reload (= same url):
              var sourceUrl = _miscUtil2.default.unparseUrl(message.value.source.url);
              var targetUrl = _miscUtil2.default.unparseUrl(message.value.target.url);

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
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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

  }, {
    key: '_createEvent',
    value: function _createEvent(name) {
      var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      props.timestamp = props.timestamp || new Date().toISOString();
      props.type = 'browser:' + name;
      props.source = _miscUtil2.default.merge(_env2.default.getPageloadData(), props.source || {});
      return _miscUtil2.default.jsonify(_miscUtil2.default.merge(this.context, props));
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

  }, {
    key: 'track',
    value: function track(name, props, success, failure) {
      this.trackerInstance.tracker({
        value: this._createEvent(name, props),
        success: success,
        failure: failure
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

  }, {
    key: 'trackLater',
    value: function trackLater(name, props, index) {
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

  }, {
    key: 'pageview',
    value: function pageview() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.location;
      var success = arguments[1];
      var failure = arguments[2];

      this.track('pageview', {}, success, failure);
    }
  }]);

  return Scribe;
}();

exports.default = Scribe;
module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _miscUtil = __webpack_require__(0);

var _miscUtil2 = _interopRequireDefault(_miscUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var DomUtil = {};

DomUtil.getFormData = function (node) {
  var acc = {};

  var setField = function setField(name, value) {
    if (name === '') name = 'anonymous';

    var oldValue = acc[name];

    if (oldValue != null) {
      if (oldValue instanceof Array) {
        acc[name].push(value);
      } else {
        acc[name] = [oldValue, value];
      }
    } else {
      acc[name] = value;
    }
  };

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = node.elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var child = _step.value;

      var nodeType = child.tagName.toLowerCase();

      if (nodeType === 'input' || nodeType === 'textfield') {
        // INPUT or TEXTFIELD element.
        // Make sure auto-complete is not turned off for the field:
        if ((child.getAttribute('autocomplete') || '').toLowerCase() !== 'off') {
          // Make sure it's not a password:
          if (child.type !== 'password') {
            // Make sure it's not a radio or it's a checked radio:
            if (child.type !== 'radio' || child.checked) {
              setField(child.name, child.value);
            }
          }
        }
      } else if (nodeType === 'select') {
        // SELECT element:
        var option = child.options[child.selectedIndex];

        setField(child.name, option.value);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return acc;
};

DomUtil.monitorElements = function (selectors, onnew, refresh) {
  refresh = refresh || 50;

  var checker = function checker() {
    var i = void 0;
    var curElements = [];
    var foundElements = void 0;

    for (i = 0; i < selectors.length; i++) {
      foundElements = document.querySelectorAll(selectors[i]);
      curElements.push.apply(curElements, _toConsumableArray(foundElements));
    }

    for (i = 0; i < curElements.length; i++) {
      var el = curElements[i];

      var scanned = el.getAttribute('scribe_scanned');

      if (!scanned) {
        el.setAttribute('scribe_scanned', true);
        try {
          onnew(el);
        } catch (e) {
          window.onerror(e);
        }
      }
    }

    setTimeout(checker, refresh);
  };

  setTimeout(checker, 0);
};

DomUtil.getDataset = function (node) {
  if (typeof node.dataset !== 'undefined') {
    return _miscUtil2.default.toObject(node.dataset);
  } else if (node.attributes) {
    var dataset = {};

    var attrs = node.attributes;

    for (var i = 0; i < attrs.length; i++) {
      var name = attrs[i].name;
      var value = attrs[i].value;

      if (name.indexOf('data-') === 0) {
        name = name.substr('data-'.length);

        dataset[name] = value;
      }
    }

    return dataset;
  }return {};
};

DomUtil.genCssSelector = function (node) {
  var sel = '';

  while (node !== document.body) {
    var id = node.id;
    var classes = node.className.split(' ').join('.');
    var tagName = node.nodeName.toLowerCase();

    if (id && id !== '') id = '#' + id;
    if (classes !== '') classes = '.' + classes;

    var prefix = tagName + id + classes;

    var parent = node.parentNode;

    var nthchild = 1;

    for (var i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i] === node) break;else {
        var childTagName = parent.childNodes[i].tagName;

        if (childTagName !== undefined) {
          nthchild = nthchild + 1;
        }
      }
    }

    if (sel !== '') sel = '>' + sel;

    sel = prefix + ':nth-child(' + nthchild + ')' + sel;

    node = parent;
  }

  return sel;
};

DomUtil.getNodeDescriptor = function (node) {
  return {
    id: node.id,
    selector: DomUtil.genCssSelector(node),
    title: node.title === '' ? undefined : node.title,
    data: DomUtil.getDataset(node)
  };
};

DomUtil.getAncestors = function (node) {
  var cur = node;
  var result = [];

  while (cur && cur !== document.body) {
    result.push(cur);
    cur = cur.parentNode;
  }

  return result;
};

DomUtil.simulateMouseEvent = function (element, eventName, options) {
  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
  };

  options = _miscUtil2.default.merge({
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  }, options || {});

  var oEvent = void 0;
  var eventType = null;

  for (var name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) {
      eventType = name;break;
    }
  }

  if (!eventType) throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType === 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView, options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
    }
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    var evt = document.createEventObject();

    oEvent = _miscUtil2.default.merge(evt, options);
    try {
      element.fireEvent('on' + eventName, oEvent);
    } catch (error) {
      // IE nonsense:
      element.fireEvent('on' + eventName);
    }
  }
  return element;
};

exports.default = DomUtil;
module.exports = exports['default'];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _detectBrowser = __webpack_require__(6);

var _miscUtil = __webpack_require__(0);

var _miscUtil2 = _interopRequireDefault(_miscUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Env = {};

Env.getBrowserData = function () {
  var plugins = null; // Env.getPluginsData()
  var browser = (0, _detectBrowser.detect)();

  return {
    ua: navigator.userAgent,
    name: browser && browser.name,
    version: browser && browser.version,
    platform: browser && browser.os,
    language: navigator.language || navigator.userLanguage || navigator.systemLanguage,
    plugins: plugins
  };
};

Env.getUrlData = function () {
  var l = document.location;

  return {
    hash: l.hash,
    host: l.host,
    hostname: l.hostname,
    pathname: l.pathname,
    protocol: l.protocol,
    query: _miscUtil2.default.parseQueryString(l.search)
  };
};

Env.getDocumentData = function () {
  return {
    title: document.title
  };
};

Env.getReferrerData = function () {
  return document.referrer && _miscUtil2.default.parseUrl(document.referrer) || undefined;
};

Env.getScreenData = function () {
  return {
    height: screen.height,
    width: screen.width,
    color_depth: screen.colorDepth
  };
};

Env.getLocaleData = function () {
  // "Mon Apr 15 2013 12:21:35 GMT-0600 (MDT)"
  //
  var results = new RegExp('([A-Z]+-[0-9]+) \\(([A-Z]+)\\)').exec(new Date().toString());

  var gmtOffset = void 0;
  var timezone = void 0;

  if (results && results.length >= 3) {
    gmtOffset = results[1];
    timezone = results[2];
  }

  return {
    language: navigator.systemLanguage || navigator.userLanguage || navigator.language,
    timezone_offset: new Date().getTimezoneOffset(),
    gmt_offset: gmtOffset,
    timezone: timezone
  };
};
Env.getPageloadData = function () {
  return {
    url: Env.getUrlData(),
    referrer: Env.getReferrerData(),
    browser: Env.getBrowserData(),
    document: Env.getDocumentData(),
    screen: Env.getScreenData(),
    locale: Env.getLocaleData()
  };
};

Env.getPluginsData = function () {
  var plugins = [];
  var p = navigator.plugins;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = p[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pi = _step.value;

      plugins.push({
        name: pi.name,
        description: pi.description,
        filename: pi.filename,
        version: pi.version,
        mimeType: pi.length > 0 ? {
          type: pi[0].type,
          description: pi[0].description,
          suffixes: pi[0].suffixes
        } : undefined
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return plugins;
};

Env.getSessionId = function () {
  var session_id = _miscUtil2.default.store.session.getItem('scribe_sid') || _miscUtil2.default.genGuid();

  _miscUtil2.default.store.session.setItem('scribe_sid', session_id);
  return session_id;
};

Env.getVisitorId = function () {
  var visitor_id = _miscUtil2.default.store.local.getItem('scribe_vid') || _miscUtil2.default.genGuid();

  _miscUtil2.default.store.local.setItem('scribe_vid', visitor_id);
  return visitor_id;
};

/*
// Todo: Should be broken out
Env.getMMData = () => ({
  site_id: window.SiteObject.site_id,
  payway_id: window.user.payway_id,
  comscore_id: window.MiscUtil.get_cookie('m_visitor'),
  article_id: window.PageObject && window.PageObject.article_id || null,
  content_keywords: window.content_keywords,
  consumer_location: window.MiscUtil.get_cookie('consumer_location')
});

// Todo: Should be broken out
Env.getSparrowData = () => ({
  status_code: window.SiteObject.status_code,
  section: window.SiteObject.section,
  controller: window.SiteObject.controller_name,
  action: window.SiteObject.action_name
});
*/

exports.default = Env;
module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
  # detect-browser

  This is a package that attempts to detect a browser vendor and version (in
  a semver compatible format) using a navigator useragent in a browser or
  `process.version` in node.

  ## NOTE: Version 2.x release

  Release 2.0 introduces a breaking API change (hence the major release)
  which requires invocation of a `detect` function rather than just inclusion of
  the module.  PR [#46](https://github.com/DamonOehlman/detect-browser/pull/46)
  provides more context as to why this change has been made.

  ## Example Usage

  <<< examples/simple.js

  Or you can use a switch statement:

  <<< examples/switch.js

  ## Adding additional browser support

  The current list of browsers that can be detected by `detect-browser` is
  not exhaustive. If you have a browser that you would like to add support for
  then please submit a pull request with the implementation.

  Creating an acceptable implementation requires two things:

  1. A test demonstrating that the regular expression you have defined identifies
     your new browser correctly.  Examples of this can be found in the 
     `test/logic.js` file.

  2. Write the actual regex to the `lib/detectBrowser.js` file. In most cases adding
     the regex to the list of existing regexes will be suitable (if usage of `detect-brower`
     returns `undefined` for instance), but in some cases you might have to add it before
     an existing regex.  This would be true for a case where you have a browser that
     is a specialised variant of an existing browser but is identified as the
     non-specialised case.

  When writing the regular expression remember that you would write it containing a
  single [capturing group](https://regexone.com/lesson/capturing_groups) which
  captures the version number of the browser.

**/

function detect() {
  var nodeVersion = getNodeVersion();
  if (nodeVersion) {
    return nodeVersion;
  } else if (typeof navigator !== 'undefined') {
    return parseUserAgent(navigator.userAgent);
  }

  return null;
}

function detectOS(userAgentString) {
  var rules = getOperatingSystemRules();
  var detected = rules.filter(function (os) {
    return os.rule && os.rule.test(userAgentString);
  })[0];

  return detected ? detected.name : null;
}

function getNodeVersion() {
  var isNode = typeof navigator === 'undefined' && typeof process !== 'undefined';
  return isNode ? {
    name: 'node',
    version: process.version.slice(1),
    os: __webpack_require__(8).type().toLowerCase()
  } : null;
}

function parseUserAgent(userAgentString) {
  var browsers = getBrowserRules();
  if (!userAgentString) {
    return null;
  }

  var detected = browsers.map(function(browser) {
    var match = browser.rule.exec(userAgentString);
    var version = match && match[1].split(/[._]/).slice(0,3);

    if (version && version.length < 3) {
      version = version.concat(version.length == 1 ? [0, 0] : [0]);
    }

    return match && {
      name: browser.name,
      version: version.join('.')
    };
  }).filter(Boolean)[0] || null;

  if (detected) {
    detected.os = detectOS(userAgentString);
  }

  return detected;
}

function getBrowserRules() {
  return buildRules([
    [ 'edge', /Edge\/([0-9\._]+)/ ],
    [ 'yandexbrowser', /YaBrowser\/([0-9\._]+)/ ],
    [ 'vivaldi', /Vivaldi\/([0-9\.]+)/ ],
    [ 'kakaotalk', /KAKAOTALK\s([0-9\.]+)/ ],
    [ 'chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
    [ 'phantomjs', /PhantomJS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'crios', /CriOS\/([0-9\.]+)(:?\s|$)/ ],
    [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
    [ 'fxios', /FxiOS\/([0-9\.]+)/ ],
    [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
    [ 'opera', /OPR\/([0-9\.]+)(:?\s|$)$/ ],
    [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/ ],
    [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/ ],
    [ 'ie', /MSIE\s(7\.0)/ ],
    [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
    [ 'android', /Android\s([0-9\.]+)/ ],
    [ 'ios', /Version\/([0-9\._]+).*Mobile.*Safari.*/ ],
    [ 'safari', /Version\/([0-9\._]+).*Safari/ ]
  ]);
}

function getOperatingSystemRules() {
  return buildRules([
    [ 'iOS', /iP(hone|od|ad)/ ],
    [ 'Android OS', /Android/ ],
    [ 'BlackBerry OS', /BlackBerry|BB10/ ],
    [ 'Windows Mobile', /IEMobile/ ],
    [ 'Amazon OS', /Kindle/ ],
    [ 'Windows 3.11', /Win16/ ],
    [ 'Windows 95', /(Windows 95)|(Win95)|(Windows_95)/ ],
    [ 'Windows 98', /(Windows 98)|(Win98)/ ],
    [ 'Windows 2000', /(Windows NT 5.0)|(Windows 2000)/ ],
    [ 'Windows XP', /(Windows NT 5.1)|(Windows XP)/ ],
    [ 'Windows Server 2003', /(Windows NT 5.2)/ ],
    [ 'Windows Vista', /(Windows NT 6.0)/ ],
    [ 'Windows 7', /(Windows NT 6.1)/ ],
    [ 'Windows 8', /(Windows NT 6.2)/ ],
    [ 'Windows 8.1', /(Windows NT 6.3)/ ],
    [ 'Windows 10', /(Windows NT 10.0)/ ],
    [ 'Windows ME', /Windows ME/ ],
    [ 'Open BSD', /OpenBSD/ ],
    [ 'Sun OS', /SunOS/ ],
    [ 'Linux', /(Linux)|(X11)/ ],
    [ 'Mac OS', /(Mac_PowerPC)|(Macintosh)/ ],
    [ 'QNX', /QNX/ ],
    [ 'BeOS', /BeOS/ ],
    [ 'OS/2', /OS\/2/ ],
    [ 'Search Bot', /(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves\/Teoma)|(ia_archiver)/ ]
  ]);
}

function buildRules(ruleTuples) {
  return ruleTuples.map(function(tuple) {
    return {
      name: tuple[0],
      rule: tuple[1]
    };
  });
}

module.exports = {
  detect: detect,
  detectOS: detectOS,
  getNodeVersion: getNodeVersion,
  parseUserAgent: parseUserAgent
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports) {

exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var Geo = {};

Geo.geoip = function (success, failure) {
  // MaxMind GeoIP2 JavaScript API:
  if (typeof geoip2 !== 'undefined') {
    geoip2.city(function (results) {
      success({
        latitude: success.location.latitude,
        longitude: success.location.longitude
      });
    }, failure, {
      timeout: 2000,
      w3c_geolocation_disabled: true
    });
  }
};

exports.default = Geo;
module.exports = exports['default'];

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _miscUtil = __webpack_require__(0);

var _miscUtil2 = _interopRequireDefault(_miscUtil);

var _handler = __webpack_require__(11);

var _handler2 = _interopRequireDefault(_handler);

var _arrayUtil = __webpack_require__(1);

var _arrayUtil2 = _interopRequireDefault(_arrayUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventHelper = {};

EventHelper.onready = function (f) {
  if (document.body != null) f();else setTimeout(function () {
    EventHelper.onready(f);
  }, 10);
};

EventHelper.onevent = function (el, type, capture, f_) {
  var fixup = function fixup(f) {
    return function (e) {
      if (!e) e = window.event;

      // Perform a shallow clone (Firefox bugs):
      e = _miscUtil2.default.copyFields(e);

      e.target = e.target || e.srcElement;
      e.keyCode = e.keyCode || e.which || e.charCode;
      e.which = e.which || e.keyCode;
      e.charCode = typeof e.which === 'number' ? e.which : e.keyCode;
      e.timeStamp = e.timeStamp || new Date().getTime();

      if (e.target && e.target.nodeType === 3) e.target = e.target.parentNode;

      var retVal = void 0;

      if (!e.preventDefault) {
        e.preventDefault = function () {
          retVal = false;
        };
      }

      return f(e) || retVal;
    };
  };

  var f = fixup(f_);

  if (el.addEventListener) {
    el.addEventListener(type, f, capture);
  } else if (el.attachEvent) {
    el.attachEvent('on' + type, f);
  }
};

EventHelper.onexit = function () {
  var unloaded = false;

  var handler = new _handler2.default();

  var handleUnload = function handleUnload(e) {
    if (!unloaded) {
      handler.dispatch(e);
      unloaded = true;
    }
  };

  EventHelper.onevent(window, 'unload', undefined, handleUnload);

  var replaceUnloader = function replaceUnloader(obj) {
    var oldUnloader = obj.onunload || function (e) {};

    obj.onunload = function (e) {
      handleUnload();

      oldUnloader(e);
    };
  };

  replaceUnloader(window);

  EventHelper.onready(function () {
    replaceUnloader(document.body);
  });

  return function (f) {
    handler.push(f);
  };
}();

EventHelper.onengage = function () {
  var handler = new _handler2.default();
  var events = [];

  EventHelper.onready(function () {
    EventHelper.onevent(document.body, 'mouseover', true, function (e) {
      events.push(e);
    });

    EventHelper.onevent(document.body, 'mouseout', true, function (end) {
      var i = void 0;
      var start = void 0;

      for (i = events.length - 1; i >= 0; i--) {
        if (events[i].target === end.target) {
          start = events[i];
          _arrayUtil2.default.removeElement(events, i);
          break;
        }
      }

      if (start !== undefined) {
        var delta = end.timeStamp - start.timeStamp;

        if (delta >= 1000 && delta <= 20000) {
          handler.dispatch(start, end);
        }
      }
    });
  });

  return function (f) {
    handler.push(f);
  };
}();

EventHelper.onhashchange = function () {
  var handler = new _handler2.default();
  var lastHash = document.location.hash;

  var dispatch = function dispatch(e) {
    var newHash = document.location.hash;

    if (lastHash !== newHash) {
      lastHash = newHash;

      e.hash = newHash;

      handler.dispatch(e);
    }
  };

  if (window.onhashchange) {
    EventHelper.onevent(window, 'hashchange', false, dispatch);
  } else {
    setInterval(function () {
      dispatch({});
    }, 25);
  }

  return function (f) {
    handler.push(f);
  };
}();

EventHelper.onerror = function () {
  var handler = new _handler2.default();

  if (typeof window.onerror === 'function') handler.push(window.onerror);

  window.onerror = function (err, url, line) {
    handler.dispatch(err, url, line);
  };

  return function (f) {
    handler.push(f);
  };
}();

EventHelper.onsubmit = function () {
  var handler = new _handler2.default();

  var handle = _miscUtil2.default.undup(function (e) {
    handler.dispatch(e);
  });

  EventHelper.onready(function () {
    EventHelper.onevent(document.body, 'submit', true, function (e) {
      handle(e);
    });

    // Intercept enter keypresses which will submit the form in most browsers.
    EventHelper.onevent(document.body, 'keypress', false, function (e) {
      if (e.keyCode === 13) {
        var target = e.target;
        var form = target.form;

        if (form) {
          e.form = form;
          handle(e);
        }
      }
    });

    // Intercept clicks on any buttons:
    EventHelper.onevent(document.body, 'click', false, function (e) {
      var target = e.target;
      var targetType = (target.type || '').toLowerCase();

      if (target.form && (targetType === 'submit' || targetType === 'button')) {
        e.form = target.form;
        handle(e);
      }
    });
  });

  return function (f) {
    handler.push(f);
  };
}();

exports.default = EventHelper;
module.exports = exports['default'];

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Handler = function () {
  function Handler() {
    _classCallCheck(this, Handler);

    this.handlers = [];
    this.onerror = console && console.log || window.onerror || function (e) {};
  }

  _createClass(Handler, [{
    key: "push",
    value: function push(f) {
      this.handlers.push(f);
    }
  }, {
    key: "dispatch",
    value: function dispatch() {
      var args = Array.prototype.slice.call(arguments, 0);
      var i = void 0;

      for (i = 0; i < this.handlers.length; i++) {
        try {
          this.handlers[i].apply(null, args);
        } catch (e) {
          onerror(e);
        }
      }
    }
  }]);

  return Handler;
}();

exports.default = Handler;
module.exports = exports["default"];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConsoleTracker = function () {
  function ConsoleTracker(config) {
    _classCallCheck(this, ConsoleTracker);

    if (!(this instanceof ConsoleTracker)) return new ConsoleTracker(config);

    this.config = config;
  }

  _createClass(ConsoleTracker, [{
    key: 'tracker',
    value: function tracker(info) {
      var value = info.value;

      if (typeof console !== 'undefined') {
        console.log(value);

        info.success && setTimeout(info.success, 0);
      } else {
        info.failure && setTimeout(info.failure, 0);
      }
    }
  }]);

  return ConsoleTracker;
}();

exports.default = ConsoleTracker;
module.exports = exports['default'];

/***/ })
/******/ ]);
});
//# sourceMappingURL=Scribe.js.map