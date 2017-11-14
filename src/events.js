
const Events = {};

Events.onready = f => {
  if (document.body != null) f();
  else setTimeout(() => {Events.onready(f);}, 10);
};

Events.onevent = (el, type, capture, f_) => {
  const fixup = f => e => {
    if (!e) e = window.event;

    // Perform a shallow clone (Firefox bugs):
    e = Util.copyFields(e);

    e.target    = e.target || e.srcElement;
    e.keyCode   = e.keyCode || e.which || e.charCode;
    e.which     = e.which || e.keyCode;
    e.charCode  = (typeof e.which === "number") ? e.which : e.keyCode;
    e.timeStamp = e.timeStamp || (new Date()).getTime();

    if (e.target && e.target.nodeType == 3) e.target = e.target.parentNode;

    let retVal;

    if (!e.preventDefault) {
      e.preventDefault = () => {
        retVal = false;
      };
    }

    return f(e) || retVal;
  };

  const f = fixup(f_);

  if (el.addEventListener) {
    el.addEventListener(type, f, capture);
  } else if (el.attachEvent)  {
    el.attachEvent(`on${type}`, f);
  }
};

Events.onexit = ((() => {
  let unloaded = false;

  const handler = new Handler();

  const handleUnload = e => {
    if (!unloaded) {
      handler.dispatch(e);
      unloaded = true;
    }
  };

  Events.onevent(window, 'unload', undefined, handleUnload);

  const replaceUnloader = obj => {
    const oldUnloader = obj.onunload || ((e => {}));

    obj.onunload = e => {
      handleUnload();

      oldUnloader(e);
    };
  };

  replaceUnloader(window);

  Events.onready(() => {
    replaceUnloader(document.body);
  });

  return f => {
    handler.push(f);
  };
}))();

Events.onengage = ((() => {
  const handler = new Handler();
  const events = [];

  Events.onready(() => {
    Events.onevent(document.body, 'mouseover', true, e => {
      events.push(e);
    });

    Events.onevent(document.body, 'mouseout', true, end => {
      let i;
      let start;

      for (i = events.length - 1; i >= 0; i--) {
        if (events[i].target === end.target) {
          start = events[i];
          ArrayUtil.removeElement(events, i);
          break;
        }
      }

      if (start !== undefined) {
        const delta = (end.timeStamp - start.timeStamp);

        if (delta >= 1000 && delta <= 20000) {
          handler.dispatch(start, end);
        }
      }
    });
  });

  return f => {
    handler.push(f);
  };
}))();

Events.onhashchange = ((() => {
  const handler = new Handler();
  let lastHash = document.location.hash;

  const dispatch = e => {
    const newHash = document.location.hash;

    if (lastHash != newHash) {
      lastHash = newHash;

      e.hash = newHash;

      handler.dispatch(e);
    }
  };

  if (window.onhashchange) {
    Events.onevent(window, 'hashchange', false, dispatch);
  } else {
    setInterval(() => { dispatch({}); }, 25);
  }

  return f => {
    handler.push(f);
  };
}))();

Events.onerror = ((() => {
  const handler = new Handler();

  if (typeof window.onerror === 'function') handler.push(window.onerror);

  window.onerror = (err, url, line) => { handler.dispatch(err, url, line); };

  return f => {
    handler.push(f);
  };
}))();

Events.onsubmit = ((() => {
  const handler = new Handler();

  const handle = Util.undup(e => {
    handler.dispatch(e);
  });

  Events.onready(() => {
    Events.onevent(document.body, 'submit', true, e => {
      handle(e);
    });

    // Intercept enter keypresses which will submit the form in most browsers.
    Events.onevent(document.body, 'keypress', false, e => {
      if (e.keyCode == 13) {
        const target = e.target;
        const form = target.form;

        if (form) {
          e.form = form;
          handle(e);
        }
      }
    });

    // Intercept clicks on any buttons:
    Events.onevent(document.body, 'click', false, e => {
      const target = e.target;
      const targetType = (target.type || '').toLowerCase();

      if (target.form && (targetType === 'submit' || targetType === 'button')) {
        e.form = target.form;
        handle(e);
      }
    });
  });

  return f => {
    handler.push(f);
  };
}))();

export default Events;
