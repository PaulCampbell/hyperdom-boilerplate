(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],3:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":1}],4:[function(require,module,exports){
var VText = require("virtual-dom/vnode/vtext.js")
var domComponent = require('./domComponent');
var hyperdom = require('.');
var deprecations = require('./deprecations');

function ComponentWidget(state, vdom) {
  if (!vdom) {
    throw new Error('hyperdom.html.component([options], vdom) expects a vdom argument');
  }

  this.state = state;
  this.key = state.key;
  var currentRender = hyperdom.currentRender();

  if (typeof vdom === 'function') {
    this.render = function () {
      if (currentRender) {
        currentRender.eventHandlerWrapper = state.on;
      }
      return vdom.apply(this.state, arguments);
    };
    this.canRefresh = true;
  } else {
    vdom = vdom || new VText('');
    this.render = function () {
      return vdom;
    }
  }
  this.cacheKey = state.cacheKey;
  this.component = domComponent();

  var renderFinished = currentRender && currentRender.finished;
  if (renderFinished) {
    this.afterRender = function (fn) {
      renderFinished.then(fn);
    };
  } else {
    this.afterRender = function () {};
  }
}

ComponentWidget.prototype.type = 'Widget';

ComponentWidget.prototype.init = function () {
  var self = this;

  if (self.state.onbeforeadd) {
    self.state.onbeforeadd();
  }

  var vdom = this.render(this);
  if (vdom instanceof Array) {
    throw new Error('vdom returned from component cannot be an array');
  }

  var element = this.component.create(vdom);

  if (self.state.onadd) {
    this.afterRender(function () {
      self.state.onadd(element);
    });
  }

  if (self.state.detached) {
    return document.createTextNode('');
  } else {
    return element;
  }
};

ComponentWidget.prototype.update = function (previous) {
  var self = this;

  var refresh = !this.cacheKey || this.cacheKey !== previous.cacheKey;

  if (refresh) {
    if (self.state.onupdate) {
      this.afterRender(function () {
        self.state.onupdate(self.component.element);
      });
    }
  }

  this.component = previous.component;

  if (previous.state && this.state) {
    var keys = Object.keys(this.state);
    for(var n = 0; n < keys.length; n++) {
      var key = keys[n];
      previous.state[key] = self.state[key];
    }
    this.state = previous.state;
  }

  if (refresh) {
    var element = this.component.update(this.render(this));

    if (self.state.detached) {
      return document.createTextNode('');
    } else {
      return element;
    }
  }
};

ComponentWidget.prototype.refresh = function () {
  this.component.update(this.render(this));
  if (this.state.onupdate) {
    this.state.onupdate(this.component.element);
  }
};

ComponentWidget.prototype.rerender = ComponentWidget.prototype.refresh;

ComponentWidget.prototype.destroy = function (element) {
  var self = this;

  if (self.state.onremove) {
    this.afterRender(function () {
      self.state.onremove(element);
    });
  }

  this.component.destroy();
};

module.exports = function (state, vdom) {
  deprecations.component('hyperdom.html.component is deprecated, please use ViewModels');
  if (typeof state === 'function') {
    return new ComponentWidget({}, state);
  } else if (state.constructor === Object) {
    return new ComponentWidget(state, vdom);
  } else {
    return new ComponentWidget({}, state);
  }
};

module.exports.ComponentWidget = ComponentWidget;

},{".":7,"./deprecations":5,"./domComponent":6,"virtual-dom/vnode/vtext.js":41}],5:[function(require,module,exports){
function deprecationWarning() {
  var warningIssued = false;

  return function (arg) {
    if (!warningIssued) {
      console.warn(arg);
      warningIssued = true;
    }
  };
}

module.exports = {
  refresh: deprecationWarning(),
  currentRender: deprecationWarning(),
  window: deprecationWarning(),
  component: deprecationWarning(),
  renderFunction: deprecationWarning(),
  refreshAfter: deprecationWarning(),
  norefresh: deprecationWarning()
};

},{}],6:[function(require,module,exports){
var createElement = require('virtual-dom/create-element');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var toVdom = require('./toVdom');
var isVdom = require('./isVdom');

function DomComponent(options) {
  this.document = options && options.document;
}

function prepareVdom(object) {
  var vdom = toVdom(object);
  if (!isVdom(vdom)) {
    throw new Error('expected render to return vdom');
  } else {
    return vdom;
  }
}

DomComponent.prototype.create = function (vdom) {
  this.vdom = prepareVdom(vdom);
  return this.element = createElement(this.vdom, {document: this.document});
};

DomComponent.prototype.merge = function (vdom, element) {
  this.vdom = prepareVdom(vdom);
  return this.element = element;
};

DomComponent.prototype.update = function (vdom) {
  var oldVdom = this.vdom;
  this.vdom = prepareVdom(vdom);
  var patches = diff(oldVdom, this.vdom);
  return this.element = patch(this.element, patches);
};

DomComponent.prototype.destroy = function (options) {
  function destroyWidgets(vdom) {
    if (vdom.type === 'Widget') {
      vdom.destroy();
    } else if (vdom.children) {
      vdom.children.forEach(destroyWidgets);
    }
  }

  destroyWidgets(this.vdom);

  if (options && options.removeElement && this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
};

function domComponent(options) {
  return new DomComponent(options);
}

module.exports = domComponent;

},{"./isVdom":8,"./toVdom":16,"virtual-dom/create-element":21,"virtual-dom/diff":22,"virtual-dom/patch":23}],7:[function(require,module,exports){
if (typeof window === 'object') {
  console.log('\n\ncreated with \uD83D\uDE80 using https://github.com/featurist/hyperdom\n\n\n');
}

var rendering = require('./rendering');
var deprecations = require('./deprecations');

exports.html = rendering.html;
exports.jsx = rendering.jsx;
exports.attach = rendering.attach;
exports.replace = rendering.replace;
exports.append = rendering.append;
exports.appendVDom = rendering.appendVDom;
exports.merge = rendering.merge;
exports.binding = rendering.binding;
exports.meta = rendering.html.meta;
exports.refreshify = rendering.html.refreshify;
exports.norefresh = rendering.html.norefresh;

var windowEvents = require('./windowEvents');

exports.html.window = function (attributes) {
  deprecations.window('hyperdom.window is deprecated');
  return windowEvents(attributes);
};

exports.html.component = require('./component');

exports.currentRender = function () {
  return exports._currentRender;
};

},{"./component":4,"./deprecations":5,"./rendering":12,"./windowEvents":19}],8:[function(require,module,exports){
var virtualDomVersion = require("virtual-dom/vnode/version")

module.exports = function(x) {
  var type = x.type;
  if (type == 'VirtualNode' || type == 'VirtualText') {
    return x.version == virtualDomVersion;
  } else {
    return type == 'Widget' || type == 'Thunk';
  }
};

},{"virtual-dom/vnode/version":38}],9:[function(require,module,exports){
module.exports = function (model, property) {
  var hyperdomMeta = model._hyperdomMeta;

  if (!hyperdomMeta) {
    hyperdomMeta = {};
    Object.defineProperty(model, '_hyperdomMeta', {value: hyperdomMeta});
  }

  if (property) {
    var meta = hyperdomMeta[property];

    if (!meta) {
      meta = hyperdomMeta[property] = {};
    }

    return meta;
  } else {
    return hyperdomMeta;
  }
};

},{}],10:[function(require,module,exports){
var hyperdomMeta = require('./meta');
var runRender = require('./runRender');
var hyperdom = require('.');
var Set = require('./set');

var lastId = 0;

function Mount(model, options) {
  var win = (options && options.window) || window;
  this.requestRender = (options && options.requestRender) || win.requestAnimationFrame || win.setTimeout;

  this.model = model;

  this.renderQueued = false;
  this.mountRenderRequested = false;
  this.widgetRendersRequested = undefined;
  this.id = ++lastId;
  this.mounted = true;
}

Mount.prototype.queueRender = function () {
  if (!this.renderQueued) {
    var requestRender = this.requestRender;
    var self = this;

    requestRender(function () {
      self.renderQueued = false;

      if (self.mounted) {
        runRender(self, function () {
          if (self.mountRenderRequested) {
            var vdom = self.render();
            self.component.update(vdom);
            self.mountRenderRequested = false;
          } else if (self.widgetRendersRequested && self.widgetRendersRequested.length) {
            for (var i = 0, l = self.widgetRendersRequested.length; i < l; i++) {
              var w = self.widgetRendersRequested[i];
              w.rerender();
            }
            self.widgetRendersRequested = undefined;
          }
        });
      }
    });

    this.renderQueued = true;
  }
};

Mount.prototype.render = function() {
  return this.renderViewModel(this.model);
};

Mount.prototype.rerender = function () {
  this.mountRenderRequested = true;
  this.queueRender();
};

Mount.prototype.rerenderWidget = function (widget) {
  if (!this.widgetRendersRequested) {
    this.widgetRendersRequested = [];
  }

  this.widgetRendersRequested.push(widget);
  this.queueRender();
};

Mount.prototype._renderViewModel = function(model) {
  var self = this;

  model.rerender = function () {
    self.rerender();
  };
  model.rerenderViewModel = function() {
    var meta = hyperdomMeta(this);
    meta.widgets.forEach(function (w) {
      self.rerenderWidget(w);
    });
  };

  var meta = hyperdomMeta(model);
  if (!meta.mount) {
    meta.mount = this;
  }

  if (!meta.widgets) {
    meta.widgets = new Set();
  }

  if (typeof model.onload == 'function') {
    if (!meta.loaded) {
      meta.loaded = true;
      hyperdom.refreshify(function () { return model.onload(); }, {refresh: 'promise'})();
    }
  }

  var vdom = model.render();

  if (vdom instanceof Array) {
    throw new Error('vdom returned from component cannot be an array');
  }

  if (vdom && vdom.properties) {
    vdom.properties._hyperdomViewModel = model;
  }

  return vdom;
}

Mount.prototype.renderViewModel = function(model) {
  if (typeof model.renderCacheKey === 'function') {
    var meta = hyperdomMeta(model);
    var key = model.renderCacheKey();
    if (key !== undefined && meta.cacheKey === key && meta.cachedVdom) {
      return meta.cachedVdom;
    } else {
      meta.cacheKey = key;
      return meta.cachedVdom = this._renderViewModel(model);
    }
  } else {
    return this._renderViewModel(model);
  }
};

Mount.prototype.detach = function () {
  this.mounted = false;
};

Mount.prototype.remove = function () {
  this.component.destroy({removeElement: true});
  this.mounted = false;
};

module.exports = Mount;

},{".":7,"./meta":9,"./runRender":13,"./set":14}],11:[function(require,module,exports){
var simplePromise = require('./simplePromise');

function Render(mount) {
  this.finished = simplePromise();
  this.mount = mount;
  this.attachment = mount;
}

module.exports = Render;

},{"./simplePromise":15}],12:[function(require,module,exports){
(function (global){
var h = require('./vhtml');
var domComponent = require('./domComponent');
var bindingMeta = require('./meta');
var toVdom = require('./toVdom');
var parseTag = require('virtual-dom/virtual-hyperscript/parse-tag');
var ViewModel = require('./viewModel');
var Mount = require('./mount');
var runRender = require('./runRender');
var deprecations = require('./deprecations');
var hyperdom = require('.');

function isViewModelOrComponent(component) {
  return component
    && ((typeof component.init === 'function'
       && typeof component.update === 'function'
       && typeof component.destroy === 'function') || (typeof component.renderViewModel === 'function'));
}

exports.merge = function (element, render, model, options) {
  var mount = startAttachment(render, model, options, function(mount, domComponentOptions) {
    var component = domComponent(domComponentOptions);
    var currentRender = hyperdom.currentRender;
    currentRender.eventHandlerWrapper = function() {
      return null;
    };
    var vdom = mount.render();
    component.merge(vdom, element);
    return component;
  });

  mount.rerender();

  return mount;
};

exports.append = function (element, render, model, options) {
  return startAttachment(render, model, options, function(mount, domComponentOptions) {
    var component = domComponent(domComponentOptions);
    var vdom = mount.render();
    element.appendChild(component.create(vdom));
    return component;
  });
};

exports.replace = function (element, render, model, options) {
  return startAttachment(render, model, options, function(mount, domComponentOptions) {
    var component = domComponent(domComponentOptions);
    var vdom = mount.render();
    element.parentNode.replaceChild(component.create(vdom), element);
    return component;
  });
};

exports.appendVDom = function (vdom, render, model, options) {
  return startAttachment(render, model, options, function(mount) {
    var component = {
      create: function(newVDom) {
        vdom.children = [];
        if (newVDom) {
          vdom.children.push(newVDom);
        }
      },
      update: function(newVDom) {
        vdom.children = [];
        if (newVDom) {
          vdom.children.push(newVDom);
        }
      }
    };
    component.create(mount.render());
    return component;
  });
};

exports.ViewModel = ViewModel;

function startAttachment(render, model, options, attachToDom) {
  if (typeof render == 'object' && typeof render.render == 'function') {
    return start(render, attachToDom, model);
  } else {
    deprecations.renderFunction('hyperdom.append and hyperdom.replace with render functions are deprecated, please pass a ViewModel');
    return start({render: function () { return render(model); }}, attachToDom, options);
  }
}

function start(model, attachToDom, options) {
  var mount = new Mount(model, options);
  runRender(mount, function () {
    if (options) {
      var domComponentOptions = {document: options.document};
    }
    mount.component = attachToDom(mount, domComponentOptions);
  });
  return mount;
}

var norefresh = {};

function norefreshFunction() {
  return norefresh;
}

function refreshify(fn, options) {
  if (!fn) {
    return fn;
  }

  var currentRender = hyperdom.currentRender();

  if (!currentRender) {
    if (typeof global === 'object') {
      return fn;
    } else {
      throw new Error('You cannot create virtual-dom event handlers outside a render function. See https://github.com/featurist/hyperdom#outside-render-cycle');
    }
  }

  var mount = currentRender.mount;
  var handleEventResult = exports.createEventResultHandler(mount, options);

  if (options && (options.norefresh == true || options.refresh == false)) {
    return fn;
  }

  return function () {
    var result = fn.apply(this, arguments);
    return handleEventResult(result);
  };
}

exports.createEventResultHandler = function(mount, options) {
  var onlyRefreshAfterPromise = options && options.refresh == 'promise';
  var viewModelToRefresh = options && options.viewModel;
  var componentToRefresh = options && options.component;

  function handleEventResult(result, promiseResult) {
    if (result && typeof(result.then) == 'function') {
      result.then(function (result) { handleEventResult(result, true); });
    }

    if (onlyRefreshAfterPromise && !promiseResult) {
      return;
    }

    if (isViewModelOrComponent(result)) {
      mount.rerenderWidget(result);
    } else if (result instanceof Array) {
      for (var i = 0; i < result.length; i++) {
        handleEventResult(result[i]);
      }
    } else if (viewModelToRefresh) {
      viewModelToRefresh.rerenderViewModel();
    } else if (componentToRefresh) {
      componentToRefresh.refresh();
    } else if (result === norefresh) {
      // don't refresh;
    } else if (result === norefreshFunction) {
      deprecations.norefresh('hyperdom.html.norefresh is deprecated, please use hyperdom.norefresh()');
      // don't refresh;
    } else {
      mount.rerender();
      return result;
    }
  }

  return handleEventResult;
};

function bindTextInput(attributes, children, get, set) {
  var textEventNames = ['onkeyup', 'oninput', 'onpaste', 'textInput'];

  var bindingValue = get();
  if (!(bindingValue instanceof Error)) {
    attributes.value = bindingValue != undefined? bindingValue: '';
  }

  attachEventHandler(attributes, textEventNames, function (ev) {
    if (bindingValue != ev.target.value) {
      set(ev.target.value);
    }
  });
}

function sequenceFunctions(handler1, handler2) {
  return function (ev) {
    handler1(ev);
    return handler2(ev);
  };
}

function insertEventHandler(attributes, eventName, handler) {
  var previousHandler = attributes[eventName];
  if (previousHandler) {
    attributes[eventName] = sequenceFunctions(handler, previousHandler);
  } else {
    attributes[eventName] = handler;
  }
}

function attachEventHandler(attributes, eventNames, handler) {
  if (eventNames instanceof Array) {
    for (var n = 0; n < eventNames.length; n++) {
      insertEventHandler(attributes, eventNames[n], handler);
    }
  } else {
    insertEventHandler(attributes, eventNames, handler);
  }
}

function ListenerHook(listener) {
  this.listener = exports.html.refreshify(listener);
}

ListenerHook.prototype.hook = function (element, propertyName) {
  element.addEventListener(propertyName.substring(2), this.listener, false);
};

ListenerHook.prototype.unhook = function (element, propertyName) {
  element.removeEventListener(propertyName.substring(2), this.listener);
};

function customEvent(name) {
  if (typeof Event == 'function') {
    return new Event(name);
  } else {
    var event = document.createEvent('Event');
    event.initEvent(name, false, false);
    return event;
  }
}

var inputTypeBindings = {
  text: bindTextInput,

  textarea: bindTextInput,

  checkbox: function (attributes, children, get, set) {
    attributes.checked = get();

    attachEventHandler(attributes, 'onclick', function (ev) {
      attributes.checked = ev.target.checked;
      set(ev.target.checked);
    });
  },

  radio: function (attributes, children, get, set) {
    var value = attributes.value;
    attributes.checked = get() == attributes.value;
    attributes.on_hyperdomsyncchecked = new ListenerHook(function (event) {
      attributes.checked = event.target.checked;
    });

    attachEventHandler(attributes, 'onclick', function (event) {
      var name = event.target.name;
      if (name) {
        var inputs = document.getElementsByName(name);
        for (var i = 0, l = inputs.length; i < l; i++) {
          inputs[i].dispatchEvent(customEvent('_hyperdomsyncchecked'));
        }
      }
      set(value);
    });
  },

  select: function (attributes, children, get, set) {
    var currentValue = get();

    var options = children.filter(function (child) {
      return child.tagName.toLowerCase() == 'option';
    });

    var values = [];
    var selectedIndex;

    for(var n = 0; n < options.length; n++) {
      var option = options[n];
      var hasValue = option.properties.hasOwnProperty('value');
      var value = option.properties.value;
      var text = option.children.map(function (x) { return x.text; }).join('');

      values.push(hasValue? value: text);

      var selected = value == currentValue || text == currentValue;

      if (selected) {
        selectedIndex = n;
      }

      option.properties.selected = selected;
      option.properties.value = n;
    }

    if (selectedIndex !== undefined) {
      attributes.selectedIndex = selectedIndex;
    }

    attachEventHandler(attributes, 'onchange', function (ev) {
      attributes.selectedIndex = ev.target.selectedIndex;
      set(values[ev.target.value]);
    });
  },

  file: function (attributes, children, get, set) {
    var multiple = attributes.multiple;

    attachEventHandler(attributes, 'onchange', function (ev) {
      if (multiple) {
        set(ev.target.files);
      } else {
        set(ev.target.files[0]);
      }
    });
  }
};

function bindModel(attributes, children, type) {
  var bind = inputTypeBindings[type] || bindTextInput;

  var bindingAttr = makeBinding(attributes.binding);
  bind(attributes, children, bindingAttr.get, bindingAttr.set);
}

function inputType(selector, attributes) {
  if (/^textarea\b/i.test(selector)) {
    return 'textarea';
  } else if (/^select\b/i.test(selector)) {
    return 'select';
  } else {
    return attributes.type || 'text';
  }
}

var renames = {
  for: 'htmlFor',
  class: 'className',
  contenteditable: 'contentEditable',
  tabindex: 'tabIndex',
  colspan: 'colSpan'
};

var dataAttributeRegex = /^data-/;

function prepareAttributes(tag, attributes, childElements) {
  var keys = Object.keys(attributes);
  var dataset;
  var currentRender = hyperdom.currentRender();
  var eventHandlerWrapper = currentRender && currentRender.eventHandlerWrapper;

  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    var attribute = attributes[key];

    if (typeof(attribute) == 'function') {
      if (eventHandlerWrapper) {
        var fn = eventHandlerWrapper.call(undefined, key.replace(/^on/, ''), attribute);
        attributes[key] = typeof fn === 'function'? refreshify(fn): fn;
      } else {
        attributes[key] = refreshify(attribute);
      }
    }

    var rename = renames[key];
    if (rename) {
      attributes[rename] = attribute;
      delete attributes[key];
      continue;
    }

    if (dataAttributeRegex.test(key)) {
      if (!dataset) {
        dataset = attributes.dataset;

        if (!dataset) {
          dataset = attributes.dataset = {};
        }
      }

      var datakey = key
        .replace(dataAttributeRegex, '')
        .replace(/-([a-z])/ig, function(_, x) { return x.toUpperCase(); });

      dataset[datakey] = attribute;
      delete attributes[key];
      continue;
    }
  }

  if (attributes.className) {
    attributes.className = generateClassName(attributes.className);
  }

  if (attributes.binding) {
    bindModel(attributes, childElements, inputType(tag, attributes));
    delete attributes.binding;
  }
}

/**
 * this function is quite ugly and you may be very tempted
 * to refactor it into smaller functions, I certainly am.
 * however, it was written like this for performance
 * so think of that before refactoring! :)
 */
exports.html = function (hierarchySelector) {
  var hasHierarchy = hierarchySelector.indexOf(' ') >= 0;
  var selector, selectorElements;

  if (hasHierarchy) {
    selectorElements = hierarchySelector.match(/\S+/g);
    selector = selectorElements[selectorElements.length - 1];
  } else {
    selector = hierarchySelector;
  }

  var childElements;
  var vdom;
  var tag;
  var attributes = arguments[1];

  if (attributes && attributes.constructor == Object && typeof attributes.render !== 'function') {
    childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 2));
    prepareAttributes(selector, attributes, childElements);
    tag = parseTag(selector, attributes);
    vdom = h(tag, attributes, childElements);
  } else {
    attributes = {};
    childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 1));
    tag = parseTag(selector, attributes);
    vdom = h(tag, attributes, childElements);
  }

  if (hasHierarchy) {
    for(var n = selectorElements.length - 2; n >= 0; n--) {
      vdom = h(selectorElements[n], {}, [vdom]);
    }
  }

  return vdom;
};

exports.jsx = function (tag, attributes) {
  var childElements = toVdom.recursive(Array.prototype.slice.call(arguments, 2));
  if (attributes) {
    prepareAttributes(tag, attributes, childElements);
  }
  return h(tag, attributes || {}, childElements);
};

Object.defineProperty(exports.html, 'currentRender', {get: function () {
  deprecations.currentRender('hyperdom.html.currentRender is deprecated, please use hyperdom.currentRender() instead');
  return exports.html._currentRender;
}});

Object.defineProperty(exports.html, 'refresh', {get: function () {
  deprecations.refresh('hyperdom.html.refresh is deprecated, please use viewModel.rerender() instead');
  return exports.html._refresh;
}});

function refreshAfter(promise) {
  deprecations.refreshAfter('hyperdom.html.refreshAfter is deprecated');
  var refresh = exports.html.refresh;

  promise.then(refresh);
}

exports.html.refreshify = refreshify;
exports.html.refreshAfter = refreshAfter;
exports.html.norefresh = norefresh;

function makeBinding(b, options) {
  var binding = b instanceof Array
    ?  bindingObject.apply(undefined, b)
    : b;

  binding.set = refreshify(binding.set, options);

  return binding;
}

function makeConverter(converter) {
  if (typeof converter == 'function') {
    return {
      view: function (model) {
        return model;
      },
      model: function (view) {
        return converter(view);
      }
    };
  } else {
    return converter;
  }
}

function chainConverters(startIndex, converters) {
  function makeConverters() {
    if (!_converters) {
      _converters = new Array(converters.length - startIndex);

      for(var n = startIndex; n < converters.length; n++) {
        _converters[n - startIndex] = makeConverter(converters[n]);
      }
    }
  }

  if ((converters.length - startIndex) == 1) {
    return makeConverter(converters[startIndex]);
  } else {
    var _converters;
    return {
      view: function (model) {
        makeConverters();
        var intermediateValue = model;
        for(var n = 0; n < _converters.length; n++) {
          intermediateValue = _converters[n].view(intermediateValue);
        }
        return intermediateValue;
      },

      model: function (view) {
        makeConverters();
        var intermediateValue = view;
        for(var n = _converters.length - 1; n >= 0; n--) {
          intermediateValue = _converters[n].model(intermediateValue);
        }
        return intermediateValue;
      }
    };
  }
}

function bindingObject(model, property) {
  var _meta;
  function hyperdomMeta() {
    return _meta || (_meta = bindingMeta(model, property));
  }

  if (arguments.length > 2) {
    var converter = chainConverters(2, arguments);

    return {
      get: function() {
        var meta = hyperdomMeta();
        var modelValue = model[property];
        var modelText;

        if (meta.error) {
          return meta.view;
        } else if (meta.view === undefined) {
          modelText = converter.view(modelValue);
          meta.view = modelText;
          return modelText;
        } else {
          var previousValue = converter.model(meta.view);
          modelText = converter.view(modelValue);
          var normalisedPreviousText = converter.view(previousValue);

          if (modelText === normalisedPreviousText) {
            return meta.view;
          } else {
            meta.view = modelText;
            return modelText;
          }
        }
      },

      set: function(view) {
        var meta = hyperdomMeta();
        meta.view = view;

        try {
          model[property] = converter.model(view, model[property]);
          delete meta.error;
        } catch (e) {
          meta.error = e;
        }
      },

      meta: function() {
        return hyperdomMeta();
      }
    };
  } else {
    return {
      get: function () {
        return model[property];
      },

      set: function (value) {
        model[property] = value;
      },

      meta: function() {
        return hyperdomMeta();
      }
    };
  }
}

exports.binding = makeBinding;
exports.html.binding = makeBinding;
exports.html.meta = bindingMeta;

function rawHtml() {
  var selector;
  var html;
  var options;

  if (arguments.length == 2) {
    selector = arguments[0];
    html = arguments[1];
    options = {innerHTML: html};
    return exports.html(selector, options);
  } else {
    selector = arguments[0];
    options = arguments[1];
    html = arguments[2];
    options.innerHTML = html;
    return exports.html(selector, options);
  }
}

exports.html.rawHtml = rawHtml;


function generateConditionalClassNames(obj) {
  return Object.keys(obj).filter(function (key) {
    return obj[key];
  }).join(' ') || undefined;
}

function generateClassName(obj) {
  if (typeof(obj) == 'object') {
    if (obj instanceof Array) {
      var names = obj.map(function(item) {
        return generateClassName(item);
      });
      return names.join(' ') || undefined;
    } else {
      return generateConditionalClassNames(obj);
    }
  } else {
    return obj;
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{".":7,"./deprecations":5,"./domComponent":6,"./meta":9,"./mount":10,"./runRender":13,"./toVdom":16,"./vhtml":17,"./viewModel":18,"virtual-dom/virtual-hyperscript/parse-tag":31}],13:[function(require,module,exports){
var hyperdom = require('.');
var Render = require('./render');
var rendering = require('./rendering');

function refreshOutOfRender() {
  throw new Error('Please assign hyperdom.html.refresh during a render cycle if you want to use it in event handlers. See https://github.com/featurist/hyperdom#refresh-outside-render-cycle');
}

module.exports = function(mount, fn) {
  var render = new Render(mount);

  try {
    hyperdom._currentRender = render;

    rendering.html._currentRender = render;
    rendering.html._refresh = rendering.createEventResultHandler(mount);

    fn();
  } finally {
    render.finished.fulfill();
    hyperdom._currentRender = undefined;

    rendering.html._refresh = refreshOutOfRender;
    rendering.html._currentRender = undefined;
  }
};

},{".":7,"./render":11,"./rendering":12}],14:[function(require,module,exports){
if (typeof Set === 'function') {
  module.exports = Set;
} else {
  module.exports = function() {
    this.items = [];
  };

  module.exports.prototype.add = function(widget) {
    if (this.items.indexOf(widget) == -1) {
      this.items.push(widget);
    }
  };

  module.exports.prototype.delete = function(widget) {
    var i = this.items.indexOf(widget);
    if (i !== -1) {
      this.items.splice(i, 1);
    }
  };

  module.exports.prototype.forEach = function(fn) {
    for(var n = 0; n < this.items.length; n++) {
      fn(this.items[n]);
    }
  };
}

},{}],15:[function(require,module,exports){
function SimplePromise () {
  this.listeners = [];
}

SimplePromise.prototype.fulfill = function (value) {
  if (!this.isFulfilled) {
    this.isFulfilled = true;
    this.value = value;
    this.listeners.forEach(function (listener) {
      listener();
    });
  }
};

SimplePromise.prototype.then = function (success) {
  if (this.isFulfilled) {
    var self = this;
    setTimeout(function () {
      success(self.value);
    });
  } else {
    this.listeners.push(success);
  }
};

module.exports = function () {
  return new SimplePromise();
};

},{}],16:[function(require,module,exports){
var vtext = require("virtual-dom/vnode/vtext.js")
var rendering = require('./rendering');
var isVdom = require('./isVdom');

function toVdom(object) {
  if (object === undefined || object === null) {
    return new vtext('');
  } else if (typeof(object) != 'object') {
    return new vtext(String(object));
  } else if (object instanceof Date) {
    return new vtext(String(object));
  } else if (object instanceof Error) {
    return new vtext(object.toString());
  } else if (isVdom(object)) {
    return object;
  } else if (typeof object.render === 'function') {
    return new rendering.ViewModel(object);
  } else {
    return new vtext(JSON.stringify(object));
  }
}

module.exports = toVdom;

function addChild(children, child) {
  if (child instanceof Array) {
    for (var n = 0; n < child.length; n++) {
      addChild(children, child[n]);
    }
  } else {
    children.push(toVdom(child));
  }
}

module.exports.recursive = function (child) {
  var children = [];
  addChild(children, child);
  return children;
};

},{"./isVdom":8,"./rendering":12,"virtual-dom/vnode/vtext.js":41}],17:[function(require,module,exports){
'use strict';

var VNode = require('virtual-dom/vnode/vnode.js');
var isHook = require('virtual-dom/vnode/is-vhook');

var softSetHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js');

module.exports = h;

function h(tagName, props, children) {
  var tag = tagName;

  // support keys
  if (props.hasOwnProperty('key')) {
    var key = props.key;
    props.key = undefined;
  }

  // support namespace
  if (props.hasOwnProperty('namespace')) {
    var namespace = props.namespace;
    props.namespace = undefined;
  }

  // fix cursor bug
  if (tag.toLowerCase() === 'input' &&
    !namespace &&
    props.hasOwnProperty('value') &&
    props.value !== undefined &&
    !isHook(props.value)
  ) {
    props.value = softSetHook(props.value);
  }

  return new VNode(tag, props, children, key, namespace);
}

},{"virtual-dom/virtual-hyperscript/hooks/soft-set-hook.js":30,"virtual-dom/vnode/is-vhook":34,"virtual-dom/vnode/vnode.js":39}],18:[function(require,module,exports){
var domComponent = require('./domComponent');
var hyperdomMeta = require('./meta');
var hyperdom = require('.');

function ViewModel(model) {
  var currentRender = hyperdom.currentRender();

  this.currentRender = currentRender;
  this.model = model;
  this.key = model.renderKey;
  this.component = undefined;
  this.mount = currentRender.mount;
}

ViewModel.prototype.type = 'Widget';

ViewModel.prototype.init = function () {
  var self = this;

  var vdom = this.render();

  var meta = hyperdomMeta(this.model);
  meta.widgets.add(this);

  this.component = domComponent();
  var element = this.component.create(vdom);

  if (self.model.onadd) {
    this.currentRender.finished.then(function () {
      self.model.onadd(element);
    });
  }

  if (self.model.detached) {
    return document.createTextNode('');
  } else {
    return element;
  }
};

ViewModel.prototype.update = function (previous) {
  var self = this;

  if (self.model.onupdate) {
    this.currentRender.finished.then(function () {
      self.model.onupdate(self.component.element);
    });
  }

  this.component = previous.component;

  var element = this.component.update(this.render());

  if (self.model.detached) {
    return document.createTextNode('');
  } else {
    return element;
  }
};

ViewModel.prototype.render = function () {
  return this.mount.renderViewModel(this.model);
};

ViewModel.prototype.rerender = function () {
  this.component.update(this.render());
  if (this.model.onupdate) {
    this.model.onupdate(this.component.element);
  }
};

ViewModel.prototype.destroy = function (element) {
  var self = this;

  var meta = hyperdomMeta(this.model);
  meta.widgets.delete(this);

  if (self.model.onremove) {
    this.currentRender.finished.then(function () {
      self.model.onremove(element);
    });
  }

  this.component.destroy();
};

module.exports = ViewModel;

},{".":7,"./domComponent":6,"./meta":9}],19:[function(require,module,exports){
var domComponent = require('./domComponent');
var rendering = require('./rendering');
var VText = require("virtual-dom/vnode/vtext.js")

function WindowWidget(attributes) {
  this.attributes = attributes;
  this.vdom = new VText('');
  this.component = domComponent();

  var self = this;
  this.cache = {};
  Object.keys(this.attributes).forEach(function (key) {
    self.cache[key] = rendering.html.refreshify(self.attributes[key]);
  });
}

WindowWidget.prototype.type = 'Widget';

WindowWidget.prototype.init = function () {
  applyPropertyDiffs(window, {}, this.attributes, {}, this.cache);
  return this.element = document.createTextNode('');
};

function uniq(array) {
  var sortedArray = array.slice();
  sortedArray.sort();

  var last;

  for(var n = 0; n < sortedArray.length;) {
    var current = sortedArray[n];

    if (last === current) {
      sortedArray.splice(n, 1);
    } else {
      n++;
    }
    last = current;
  }

  return sortedArray;
}

function applyPropertyDiffs(element, previous, current, previousCache, currentCache) {
  uniq(Object.keys(previous).concat(Object.keys(current))).forEach(function (key) {
    if (/^on/.test(key)) {
      var event = key.slice(2);

      var prev = previous[key];
      var curr = current[key];
      var refreshPrev = previousCache[key];
      var refreshCurr = currentCache[key];

      if (prev !== undefined && curr === undefined) {
        element.removeEventListener(event, refreshPrev);
      } else if (prev !== undefined && curr !== undefined && prev !== curr) {
        element.removeEventListener(event, refreshPrev);
        element.addEventListener(event, refreshCurr);
      } else if (prev === undefined && curr !== undefined) {
        element.addEventListener(event, refreshCurr);
      }
    }
  });
}

WindowWidget.prototype.update = function (previous) {
  applyPropertyDiffs(window, previous.attributes, this.attributes, previous.cache, this.cache);
  this.component = previous.component;
  return this.element;
};

WindowWidget.prototype.destroy = function () {
  applyPropertyDiffs(window, this.attributes, {}, this.cache, {});
};

module.exports = function (attributes) {
  return new WindowWidget(attributes);
};

},{"./domComponent":6,"./rendering":12,"virtual-dom/vnode/vtext.js":41}],20:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],21:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":25}],22:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":43}],23:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":28}],24:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":34,"is-object":20}],25:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":32,"../vnode/is-vnode.js":35,"../vnode/is-vtext.js":36,"../vnode/is-widget.js":37,"./apply-properties":24,"global/document":3}],26:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],27:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":37,"../vnode/vpatch.js":40,"./apply-properties":24,"./update-widget":29}],28:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":25,"./dom-index":26,"./patch-op":27,"global/document":3,"x-is-array":44}],29:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":37}],30:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],31:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":2}],32:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":33,"./is-vnode":35,"./is-vtext":36,"./is-widget":37}],33:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],34:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],35:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":38}],36:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":38}],37:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],38:[function(require,module,exports){
module.exports = "2"

},{}],39:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":33,"./is-vhook":34,"./is-vnode":35,"./is-widget":37,"./version":38}],40:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":38}],41:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":38}],42:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":34,"is-object":20}],43:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":32,"../vnode/is-thunk":33,"../vnode/is-vnode":35,"../vnode/is-vtext":36,"../vnode/is-widget":37,"../vnode/vpatch":40,"./diff-props":42,"x-is-array":44}],44:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],45:[function(require,module,exports){
'use strict';

var _jsxFileName = '/Users/paulcampbell/_src/hyperdom_boilerplate/src/app.js';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @jsx hyperdom.jsx */
var hyperdom = require('hyperdom');

var tabs = [{ name: 'Home', renderMethod: 'renderHome', id: 'home' }, { name: 'Contacts', renderMethod: 'renderContacts', id: 'contacts' }];

var App = function () {
  function App() {
    _classCallCheck(this, App);

    this.currentTab = this.findTabById('home');
    this.contacts = [{ name: 'Jimmy' }, { name: 'Robert' }, { name: 'John Paul' }, { name: 'John' }];
  }

  App.prototype.setTab = function setTab(tabId) {
    this.currentTab = this.findTabById(tabId);
    history.pushState({ tab: tabId }, this.currentTab.title, '/' + tabId);
  };

  App.prototype.findTabById = function findTabById(tabId) {
    return tabs.filter(function (tab) {
      return tab.id === tabId;
    })[0];
  };

  App.prototype.renderHome = function renderHome() {
    return hyperdom.jsx(
      'div',
      { 'class': 'homeTab', __source: {
          fileName: _jsxFileName,
          lineNumber: 30
        }
      },
      hyperdom.jsx(
        'h1',
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 31
          }
        },
        'Hyperdom Boilerplate'
      ),
      hyperdom.jsx(
        'p',
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 32
          }
        },
        'Now then'
      )
    );
  };

  App.prototype.renderContacts = function renderContacts() {
    return hyperdom.jsx(
      'div',
      { 'class': 'contactsTab', __source: {
          fileName: _jsxFileName,
          lineNumber: 37
        }
      },
      hyperdom.jsx(
        'h1',
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 38
          }
        },
        'Contacts'
      ),
      hyperdom.jsx(
        'ul',
        { 'class': 'contactsList', __source: {
            fileName: _jsxFileName,
            lineNumber: 39
          }
        },
        this.contacts.map(function (c) {
          return hyperdom.jsx(
            'li',
            { 'class': 'contactsList-contact', __source: {
                fileName: _jsxFileName,
                lineNumber: 41
              }
            },
            c.name
          );
        })
      )
    );
  };

  App.prototype.renderPage = function renderPage(currentTab) {
    return hyperdom.jsx(
      'div',
      {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 49
        }
      },
      this[currentTab.renderMethod]()
    );
  };

  App.prototype.render = function render() {
    var _this = this;

    return hyperdom.jsx(
      'div',
      {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 55
        }
      },
      hyperdom.jsx(
        'nav',
        {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 56
          }
        },
        hyperdom.jsx(
          'ul',
          {
            __source: {
              fileName: _jsxFileName,
              lineNumber: 57
            }
          },
          hyperdom.jsx(
            'li',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 58
              }
            },
            hyperdom.jsx(
              'a',
              { 'class': 'homeLink', href: '#', onclick: function onclick(ev) {
                  ev.preventDefault();_this.setTab('home');
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 58
                }
              },
              'Home'
            )
          ),
          hyperdom.jsx(
            'li',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 59
              }
            },
            hyperdom.jsx(
              'a',
              { 'class': 'contactsLink', href: '#', onclick: function onclick(ev) {
                  ev.preventDefault();_this.setTab('contacts');
                }, __source: {
                  fileName: _jsxFileName,
                  lineNumber: 59
                }
              },
              'Contacts'
            )
          )
        )
      ),
      this.renderPage(this.currentTab)
    );
  };

  return App;
}();

module.exports = App;

},{"hyperdom":7}],46:[function(require,module,exports){
'use strict';

var App = require('./app');
var hyperdom = require('hyperdom');

hyperdom.append(document.body, new App({}));

},{"./app":45,"hyperdom":7}]},{},[46])
//# sourceMappingURL=index.max.js.map
