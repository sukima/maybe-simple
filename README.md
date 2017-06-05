# Yet Another Maybe Monad

Designed as a simple drop in module. This monad includes support for deep
object properties lookup and ability to invoke functions on objects.

**But why?** Most Maybe monad libraries are full featured and heavy. They try
to mimic Haskel. And many work on values and not object properties. When
working in JS I find I often want a simple *optional* like construct which will
let me deal with objects that violate the Law of Demeter (typically a nested
object from an API. I need a simple way to grab data deep down in a safe way
without having JS blowup with undefined problems. Rails has a `try`, Swift has
optionals, CoffeeScript has a `?` guard, but JS has *nothing* (pun intended).

## Install

#### NPM

```console
$ npm install --save maybe-simple
```

#### Yarn

```console
$ yarn add maybe-simple
```

#### Usage

```js
var Maybe = require('maybe-simple');
```

<a name="Maybe"></a>

## Maybe
**Kind**: global class  

* [Maybe](#Maybe)
    * [new Maybe(obj, selctor, def)](#new_Maybe_new)
    * _instance_
        * [.isNothing()](#Maybe+isNothing) ⇒ <code>boolean</code>
        * [.setDefaultValue(def)](#Maybe+setDefaultValue) ↩︎
        * [.value(def)](#Maybe+value) ⇒ <code>\*</code>
        * [.bind(fn)](#Maybe+bind) ⇒ [<code>Maybe</code>](#Maybe)
        * [.nothing(fn)](#Maybe+nothing) ⇒ [<code>Maybe</code>](#Maybe)
        * [.get(selector)](#Maybe+get) ⇒ [<code>Maybe</code>](#Maybe)
        * [.invoke(selector)](#Maybe+invoke) ⇒ [<code>Maybe</code>](#Maybe)
        * [.isEqual(other)](#Maybe+isEqual) ⇒ <code>boolean</code>
        * [.toString(def)](#Maybe+toString) ⇒ <code>string</code>
        * [.toJSONString(def, replacer, space)](#Maybe+toJSONString) ⇒ <code>string</code>
    * _static_
        * [.safeRead(obj, selector)](#Maybe.safeRead) ⇒ <code>\*</code>

<a name="new_Maybe_new"></a>

### new Maybe(obj, selctor, def)
Maybe monad can be created with or without the new keyword.
This wraps an object and allows a deep selector (optional) and a default
value (optional). It is safe to wrap another Maybe object.


| Param | Type | Description |
| --- | --- | --- |
| obj | <code>\*</code> | the original value. Can be anything. |
| selctor | <code>string</code> | (optional) used to safely pick a deep value from obj. |
| def | <code>\*</code> | (optional) a default value if obj or any level of the selector resolves to nothing. |

**Example**  
```js
var example = { foo: { bar: { baz: 'foobarbaz' } } };
var x = new Maybe(example, 'foo.bar.baz'); // new is optional
var y = Maybe(example, 'foo.nosuchthing.baz');
x.value() // => 'foobarbaz'
y.value() // => null
```
<a name="Maybe+isNothing"></a>

### maybe.isNothing() ⇒ <code>boolean</code>
Check if the value resolves to nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
<a name="Maybe+setDefaultValue"></a>

### maybe.setDefaultValue(def) ↩︎
Sets the default returned from value() when this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Chainable**  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | a default value |

**Example**  
```js
Maybe(null)
  .setDefaultValue('foobar')
  .value(); // => 'foobar'
```
<a name="Maybe+value"></a>

### maybe.value(def) ⇒ <code>\*</code>
Convert the Maybe to a resolved value. Either the value or the deafult if
this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>\*</code> - a value, the default value, or null  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous defaults. |

<a name="Maybe+bind"></a>

### maybe.bind(fn) ⇒ [<code>Maybe</code>](#Maybe)
Perform a transformation or action unless the value is nothing. This is
the main way to interface with a Maybe. The functions' return value will
be the new value propagated through the chain. Returning undefined (a
function with no return value) does not mutate the previous value (no-op).
Return null if you want to the Maybe to be nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | a function to execute if this Maybe is not nothing. |

**Example**  
```js
Maybe('foo')
  .bind(function(v) { return v + 'bar'; })
  .bind(function(v) { console.log(v); }) // foobar
  .bind(function(v) { return v + 'baz'; })
  .value(); // => 'foobarbaz'

Maybe('foo')
  .bind(function(v) { return null; })
  .bind(function(v) { return v + 'baz'; })
  .value(); // => null
```
<a name="Maybe+nothing"></a>

### maybe.nothing(fn) ⇒ [<code>Maybe</code>](#Maybe)
Execute/mutate with the function if this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | a function to execute if this Maybe is nothing. |

**Example**  
```js
Maybe(null)
  .bind(function(v) { return v + 'foo'; })
  .nothing(function() { return 'bar'; })
  .bind(function(v) { return v + 'foo'; })
  .value(); // => 'barfoo'
```
<a name="Maybe+get"></a>

### maybe.get(selector) ⇒ [<code>Maybe</code>](#Maybe)
Helper to return a selector from a value object.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | the property selector to get from the value. |

**Example**  
```js
Maybe({ foo: { bar: 'baz' } })
  .get('foo.bar')
  .value(); // 'baz'
```
<a name="Maybe+invoke"></a>

### maybe.invoke(selector) ⇒ [<code>Maybe</code>](#Maybe)
Invoke a method with args on the object if Maybe is not nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | the property selector to get from the value. |

**Example**  
```js
Maybe(['foo', 'bar', 'baz'])
  .invoke('join', ', ')
  .value(); // => 'foo, bar, baz'
```
<a name="Maybe+isEqual"></a>

### maybe.isEqual(other) ⇒ <code>boolean</code>
Compare two Maybe objects. Maybes considered nothing are equal.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  

| Param | Type | Description |
| --- | --- | --- |
| other | <code>\*</code> | The other value to compare. |

<a name="Maybe+toString"></a>

### maybe.toString(def) ⇒ <code>string</code>
Coerce the value to a string.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>string</code> - a String  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous |

**Example**  
```js
Maybe([1, 2, 3])
  .toString(); // => '1,2,3'
```
<a name="Maybe+toJSONString"></a>

### maybe.toJSONString(def, replacer, space) ⇒ <code>string</code>
Coerce the value to JSON.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>string</code> - a JSON encoded String  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous |
| replacer | <code>function</code> | (optional) See JSON.stringify() |
| space | <code>number</code> | (optional) See JSON.stringify() |

**Example**  
```js
Maybe({ foo: { bar: 'baz' } })
  .toJSON(); // => '{foo:{bar:"baz"}}'
Maybe(null)
  .toJSON(); // => '{}'
```
<a name="Maybe.safeRead"></a>

### Maybe.safeRead(obj, selector) ⇒ <code>\*</code>
A utility function to safely recurse through an object based on a selector.
if any value in the chain resolves to nothing then this will simple return
null. Used internally to look up values when constructing a Maybe object.

**Kind**: static method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>\*</code> - any value or null.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | the object to traverse. |
| selector | <code>string</code> | the selector to pick from the obj. |

**Example**  
```js
var obj = { foo: { bar: { baz: 'foobar' } } };
Maybe.safeRead(obj, 'foo.bar.baz'); // => 'foobar'
```
<a name="Maybe"></a>

## Maybe
**Kind**: global class  

* [Maybe](#Maybe)
    * [new Maybe(obj, selctor, def)](#new_Maybe_new)
    * _instance_
        * [.isNothing()](#Maybe+isNothing) ⇒ <code>boolean</code>
        * [.setDefaultValue(def)](#Maybe+setDefaultValue) ↩︎
        * [.value(def)](#Maybe+value) ⇒ <code>\*</code>
        * [.bind(fn)](#Maybe+bind) ⇒ [<code>Maybe</code>](#Maybe)
        * [.nothing(fn)](#Maybe+nothing) ⇒ [<code>Maybe</code>](#Maybe)
        * [.get(selector)](#Maybe+get) ⇒ [<code>Maybe</code>](#Maybe)
        * [.invoke(selector)](#Maybe+invoke) ⇒ [<code>Maybe</code>](#Maybe)
        * [.isEqual(other)](#Maybe+isEqual) ⇒ <code>boolean</code>
        * [.toString(def)](#Maybe+toString) ⇒ <code>string</code>
        * [.toJSONString(def, replacer, space)](#Maybe+toJSONString) ⇒ <code>string</code>
    * _static_
        * [.safeRead(obj, selector)](#Maybe.safeRead) ⇒ <code>\*</code>

<a name="new_Maybe_new"></a>

### new Maybe(obj, selctor, def)
Maybe monad can be created with or without the new keyword.
This wraps an object and allows a deep selector (optional) and a default
value (optional). It is safe to wrap another Maybe object.


| Param | Type | Description |
| --- | --- | --- |
| obj | <code>\*</code> | the original value. Can be anything. |
| selctor | <code>string</code> | (optional) used to safely pick a deep value from obj. |
| def | <code>\*</code> | (optional) a default value if obj or any level of the selector resolves to nothing. |

**Example**  
```js
var example = { foo: { bar: { baz: 'foobarbaz' } } };
var x = new Maybe(example, 'foo.bar.baz'); // new is optional
var y = Maybe(example, 'foo.nosuchthing.baz');
x.value() // => 'foobarbaz'
y.value() // => null
```
<a name="Maybe+isNothing"></a>

### maybe.isNothing() ⇒ <code>boolean</code>
Check if the value resolves to nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
<a name="Maybe+setDefaultValue"></a>

### maybe.setDefaultValue(def) ↩︎
Sets the default returned from value() when this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Chainable**  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | a default value |

**Example**  
```js
Maybe(null)
  .setDefaultValue('foobar')
  .value(); // => 'foobar'
```
<a name="Maybe+value"></a>

### maybe.value(def) ⇒ <code>\*</code>
Convert the Maybe to a resolved value. Either the value or the deafult if
this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>\*</code> - a value, the default value, or null  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous defaults. |

<a name="Maybe+bind"></a>

### maybe.bind(fn) ⇒ [<code>Maybe</code>](#Maybe)
Perform a transformation or action unless the value is nothing. This is
the main way to interface with a Maybe. The functions' return value will
be the new value propagated through the chain. Returning undefined (a
function with no return value) does not mutate the previous value (no-op).
Return null if you want to the Maybe to be nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | a function to execute if this Maybe is not nothing. |

**Example**  
```js
Maybe('foo')
  .bind(function(v) { return v + 'bar'; })
  .bind(function(v) { console.log(v); }) // foobar
  .bind(function(v) { return v + 'baz'; })
  .value(); // => 'foobarbaz'

Maybe('foo')
  .bind(function(v) { return null; })
  .bind(function(v) { return v + 'baz'; })
  .value(); // => null
```
<a name="Maybe+nothing"></a>

### maybe.nothing(fn) ⇒ [<code>Maybe</code>](#Maybe)
Execute/mutate with the function if this Maybe is nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | a function to execute if this Maybe is nothing. |

**Example**  
```js
Maybe(null)
  .bind(function(v) { return v + 'foo'; })
  .nothing(function() { return 'bar'; })
  .bind(function(v) { return v + 'foo'; })
  .value(); // => 'barfoo'
```
<a name="Maybe+get"></a>

### maybe.get(selector) ⇒ [<code>Maybe</code>](#Maybe)
Helper to return a selector from a value object.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | the property selector to get from the value. |

**Example**  
```js
Maybe({ foo: { bar: 'baz' } })
  .get('foo.bar')
  .value(); // 'baz'
```
<a name="Maybe+invoke"></a>

### maybe.invoke(selector) ⇒ [<code>Maybe</code>](#Maybe)
Invoke a method with args on the object if Maybe is not nothing.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: [<code>Maybe</code>](#Maybe) - a Maybe object  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | the property selector to get from the value. |

**Example**  
```js
Maybe(['foo', 'bar', 'baz'])
  .invoke('join', ', ')
  .value(); // => 'foo, bar, baz'
```
<a name="Maybe+isEqual"></a>

### maybe.isEqual(other) ⇒ <code>boolean</code>
Compare two Maybe objects. Maybes considered nothing are equal.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  

| Param | Type | Description |
| --- | --- | --- |
| other | <code>\*</code> | The other value to compare. |

<a name="Maybe+toString"></a>

### maybe.toString(def) ⇒ <code>string</code>
Coerce the value to a string.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>string</code> - a String  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous |

**Example**  
```js
Maybe([1, 2, 3])
  .toString(); // => '1,2,3'
```
<a name="Maybe+toJSONString"></a>

### maybe.toJSONString(def, replacer, space) ⇒ <code>string</code>
Coerce the value to JSON.

**Kind**: instance method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>string</code> - a JSON encoded String  

| Param | Type | Description |
| --- | --- | --- |
| def | <code>\*</code> | (optional) use as default value overridding any previous |
| replacer | <code>function</code> | (optional) See JSON.stringify() |
| space | <code>number</code> | (optional) See JSON.stringify() |

**Example**  
```js
Maybe({ foo: { bar: 'baz' } })
  .toJSON(); // => '{foo:{bar:"baz"}}'
Maybe(null)
  .toJSON(); // => '{}'
```
<a name="Maybe.safeRead"></a>

### Maybe.safeRead(obj, selector) ⇒ <code>\*</code>
A utility function to safely recurse through an object based on a selector.
if any value in the chain resolves to nothing then this will simple return
null. Used internally to look up values when constructing a Maybe object.

**Kind**: static method of [<code>Maybe</code>](#Maybe)  
**Returns**: <code>\*</code> - any value or null.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | the object to traverse. |
| selector | <code>string</code> | the selector to pick from the obj. |

**Example**  
```js
var obj = { foo: { bar: { baz: 'foobar' } } };
Maybe.safeRead(obj, 'foo.bar.baz'); // => 'foobar'
```

## License

```
Copyright (c) 2017 Devin Weaver

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
