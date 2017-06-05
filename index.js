/**
 * @class Maybe
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Maybe = factory();
  }
}(this, function(undefined) {

  /**
   * Maybe monad can be created with or without the new keyword.
   * This wraps an object and allows a deep selector (optional) and a default
   * value (optional). It is safe to wrap another Maybe object.
   *
   * @example
   * var example = { foo: { bar: { baz: 'foobarbaz' } } };
   * var x = new Maybe(example, 'foo.bar.baz'); // new is optional
   * var y = Maybe(example, 'foo.nosuchthing.baz');
   * x.value() // => 'foobarbaz'
   * y.value() // => null
   *
   * @alias Maybe
   * @constructor
   * @param obj {*} - the original value. Can be anything.
   * @param selctor {string} - (optional) used to safely pick a deep value from obj.
   * @param def {*} - (optional) a default value if obj or any level of the selector resolves to nothing.
   */
  function Maybe(obj, selector, def) {
    if (obj instanceof Maybe) { return obj; }
    if (!(this instanceof Maybe)) { return new Maybe(obj, selector, def); }
    this._value = Maybe.safeRead(obj, selector);
    this.setDefaultValue(def);
  }

  /**
   * Check if the value resolves to nothing.
   * @returns {boolean}
   */
  Maybe.prototype.isNothing = function() {
    return (this._value == null);
  };

  /**
   * Sets the default returned from value() when this Maybe is nothing.
   *
   * @example
   * Maybe(null)
   *   .setDefaultValue('foobar')
   *   .value(); // => 'foobar'
   *
   * @param def {*} - a default value
   * @chainable
   */
  Maybe.prototype.setDefaultValue = function(def) {
    this._default = (def != null) ? def : null;
    return this;
  };

  /**
   * Convert the Maybe to a resolved value. Either the value or the deafult if
   * this Maybe is nothing.
   * @param def {*} - (optional) use as default value overridding any previous defaults.
   * @returns {*} a value, the default value, or null
   */
  Maybe.prototype.value = function(def) {
    return !this.isNothing() ? this._value :
      (def != null ? def : this._default);
  };

  /**
   * Perform a transformation or action unless the value is nothing. This is
   * the main way to interface with a Maybe. The functions' return value will
   * be the new value propagated through the chain. Returning undefined (a
   * function with no return value) does not mutate the previous value (no-op).
   * Return null if you want to the Maybe to be nothing.
   *
   * @example
   * Maybe('foo')
   *   .bind(function(v) { return v + 'bar'; })
   *   .bind(function(v) { console.log(v); }) // foobar
   *   .bind(function(v) { return v + 'baz'; })
   *   .value(); // => 'foobarbaz'
   *
   * Maybe('foo')
   *   .bind(function(v) { return null; })
   *   .bind(function(v) { return v + 'baz'; })
   *   .value(); // => null
   *
   * @param fn {function} - a function to execute if this Maybe is not nothing.
   * @returns {Maybe} a Maybe object
   */
  Maybe.prototype.bind = function(fn) {
    if (this.isNothing()) { return this; }
    var ret = fn.call(this, this._value);
    if (ret === undefined) { return this; }
    return new Maybe(ret, null, this._default);
  };

  /**
   * Execute/mutate with the function if this Maybe is nothing.
   *
   * @example
   * Maybe(null)
   *   .bind(function(v) { return v + 'foo'; })
   *   .nothing(function() { return 'bar'; })
   *   .bind(function(v) { return v + 'foo'; })
   *   .value(); // => 'barfoo'
   *
   * @param fn {function} - a function to execute if this Maybe is nothing.
   * @returns {Maybe} a Maybe object
   */
  Maybe.prototype.nothing = function(fn) {
    if (!this.isNothing()) { return this; }
    return new Maybe(fn(), null, this._default);
  };

  /**
   * Helper to return a selector from a value object.
   *
   * @example
   * Maybe({ foo: { bar: 'baz' } })
   *   .get('foo.bar')
   *   .value(); // 'baz'
   *
   * @param selector {string} - the property selector to get from the value.
   * @returns {Maybe} a Maybe object
   */
  Maybe.prototype.get = function(selector) {
    return new Maybe(this._value, selector, this._default);
  };

  /**
   * Invoke a method with args on the object if Maybe is not nothing.
   *
   * @example
   * Maybe(['foo', 'bar', 'baz'])
   *   .invoke('join', ', ')
   *   .value(); // => 'foo, bar, baz'
   *
   * @param selector {string} - the property selector to get from the value.
   * @returns {Maybe} a Maybe object
   */
  Maybe.prototype.invoke = function(fnName) {
    if (this.isNothing()) { return this; }
    var fn = this.get(fnName).value(null);
    var args = (2 <= arguments.length) ? [].slice.call(arguments, 1) : [];
    var ret = (fn == null) ? null : fn.apply(this.value_, args);
    if (ret === undefined) { return this; }
    return new Maybe(ret, null, this._default);
  };

  /**
   * Compare two Maybe objects. Maybes considered nothing are equal.
   *
   * @param other {*} - The other value to compare.
   * @returns {boolean}
   */
  Maybe.prototype.isEqual = function(other) {
    var comparitor = new Maybe(other);
    if (this.isNothing() && comparitor.isNothing()) {
      return true;
    }
    return this._value === comparitor._value;
  };

  /**
   * Coerce the value to a string.
   *
   * @example
   * Maybe([1, 2, 3])
   *   .toString(); // => '1,2,3'
   *
   * @param def {*} - (optional) use as default value overridding any previous
   * @returns {string} a String
   */
  Maybe.prototype.toString = function(def) {
    return '' + this.value(def || this._default || '');
  };

  /**
   * Coerce the value to JSON.
   *
   * @example
   * Maybe({ foo: { bar: 'baz' } })
   *   .toJSON(); // => '{foo:{bar:"baz"}}'
   * Maybe(null)
   *   .toJSON(); // => '{}'
   *
   * @param def {*} - (optional) use as default value overridding any previous
   * @param replacer {function} - (optional) See JSON.stringify()
   * @param space {number} - (optional) See JSON.stringify()
   * @returns {string} a JSON encoded String
   */
  Maybe.prototype.toJSONString = function(def, replacer, space) {
    var val = this.value(def || this._default || {});
    return JSON.stringify(val, replacer, space);
  };

  /**
   * A utility function to safely recurse through an object based on a selector.
   * if any value in the chain resolves to nothing then this will simple return
   * null. Used internally to look up values when constructing a Maybe object.
   *
   * @example
   * var obj = { foo: { bar: { baz: 'foobar' } } };
   * Maybe.safeRead(obj, 'foo.bar.baz'); // => 'foobar'
   *
   * @param obj {object} - the object to traverse.
   * @param selector {string} - the selector to pick from the obj.
   * @returns {*} any value or null.
   */
  Maybe.safeRead = function(obj, selector) {
    if (obj == null) { return null; }
    if (!selector || selector.length === 0) { return obj; }
    if ('string' === typeof selector) {
      selector = selector.split('.');
    }
    return Maybe.safeRead(obj[selector.shift()], selector);
  };

  return Maybe;

}));
