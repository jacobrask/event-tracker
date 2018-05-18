import merge from 'lodash.merge';

import MiscUtil from 'miscUtil';

const DomUtil = {};

DomUtil.getFormData = node => {
  const acc = {};

  const setField = (name, value) => {
    if (name === '') name = 'anonymous';

    const oldValue = acc[name];

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

  for (const child of node.elements) {
    const nodeType = child.tagName.toLowerCase();

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
      const option = child.options[child.selectedIndex];

      setField(child.name, option.value);
    }
  }

  return acc;
};

DomUtil.monitorElements = (selectors, onnew, refresh) => {
  refresh = refresh || 50;

  const checker = () => {
    let i;
    const curElements = [];
    let foundElements;

    for (i = 0; i < selectors.length; i++) {
      foundElements = document.querySelectorAll(selectors[i]);
      curElements.push(...foundElements);
    }

    for (i = 0; i < curElements.length; i++) {
      const el = curElements[i];

      const scanned = el.getAttribute('event_tracker_scanned');

      if (!scanned) {
        el.setAttribute('event_tracker_scanned', true);
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

DomUtil.getDataset = node => {
  if (typeof node.dataset !== 'undefined') {
    return MiscUtil.toObject(node.dataset);
  } else if (node.attributes) {
    const dataset = {};

    const attrs = node.attributes;

    for (let i = 0; i < attrs.length; i++) {
      let name = attrs[i].name;
      const value = attrs[i].value;

      if (name.indexOf('data-') === 0) {
        name = name.substr('data-'.length);

        dataset[name] = value;
      }
    }

    return dataset;
  } return {};
};

DomUtil.genCssSelector = node => {
  let sel = '';

  while (node !== document.body) {
    let id = node.id;
    let classes = node.className.split(' ').join('.');
    const tagName = node.nodeName.toLowerCase();

    if (id && id !== '') id = `#${id}`;
    if (classes !== '') classes = `.${classes}`;

    const prefix = tagName + id + classes;

    const parent = node.parentNode;

    let nthchild = 1;

    for (let i = 0; i < parent.childNodes.length; i++) {
      if (parent.childNodes[i] === node) break;
      else {
        const childTagName = parent.childNodes[i].tagName;

        if (childTagName !== undefined) {
          nthchild = nthchild + 1;
        }
      }
    }

    if (sel !== '') sel = `>${sel}`;

    sel = `${prefix}:nth-child(${nthchild})${sel}`;

    node = parent;
  }

  return sel;
};

DomUtil.getNodeDescriptor = node => ({
  id: node.id,
  selector: DomUtil.genCssSelector(node),
  title: node.title === '' ? undefined : node.title,
  data: DomUtil.getDataset(node)
});

DomUtil.getAncestors = node => {
  let cur = node;
  const result = [];

  while (cur && cur !== document.body) {
    result.push(cur);
    cur = cur.parentNode;
  }

  return result;
};

DomUtil.simulateMouseEvent = (element, eventName, options) => {
  const eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
  };

  options = merge({
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

  let oEvent;
  let eventType = null;

  for (const name in eventMatchers) {
    if (eventMatchers[name].test(eventName)) { eventType = name; break; }
  }

  if (!eventType) throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

  if (document.createEvent) {
    oEvent = document.createEvent(eventType);
    if (eventType === 'HTMLEvents') {
      oEvent.initEvent(eventName, options.bubbles, options.cancelable);
    } else {
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
        options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
        options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element
      );
    }
    element.dispatchEvent(oEvent);
  } else {
    options.clientX = options.pointerX;
    options.clientY = options.pointerY;
    const evt = document.createEventObject();

    oEvent = merge(evt, options);
    try {
      element.fireEvent(`on${eventName}`, oEvent);
    } catch (error) {
      // IE nonsense:
      element.fireEvent(`on${eventName}`);
    }
  }
  return element;
};

export default DomUtil;
