const { expect } = require('chai');
const sinon = require('sinon');
const Maybe = require('../');

describe('Maybe', function() {
  describe('#constructor', function() {
    it('can be instantiated with new keyword', function() {
      let result = new Maybe();
      expect(result).to.be.an.instanceof(Maybe);
    });

    it('can be instantiated without new keyword', function() {
      let result = Maybe();
      expect(result).to.be.an.instanceof(Maybe);
    });

    it('proxies the same Maybe object when Maybe is passed in', function() {
      let expected = new Maybe();
      let result = new Maybe(expected);
      expect(result).to.be.an.instanceof(Maybe);
      expect(result).to.equal(expected);
    });

    it('accepts a selector value', function() {
      let result = new Maybe({foo: 'bar'}, 'foo');
      expect(result.value()).to.equal('bar');
    });

    it('accepts a default value', function() {
      let result = new Maybe(null, null, 'foobar');
      expect(result.value()).to.equal('foobar');
    });
  });

  describe('#isNothing', function() {
    it('returns true/false based on Maybe being nothing or not', function() {
      let result = Maybe().isNothing();
      expect(result).to.be.true;

      result = Maybe(null).isNothing();
      expect(result).to.be.true;

      result = Maybe('truth').isNothing();
      expect(result).to.be.false;
    });
  });

  describe('#setDefaultValue', function() {
    it('sets the default', function() {
      let subject = new Maybe();
      let result = subject.setDefaultValue('foobar');
      expect(result.value()).to.equal('foobar');
    });

    it('is chainable', function() {
      let expected = new Maybe();
      let result = expected.setDefaultValue('');
      expect(result).to.equal(expected);
    });
  });

  describe('#value', function() {
    it('returns the value of the Maybe', function() {
      let subject = new Maybe('foobar');
      expect(subject.value()).to.equal('foobar');
    });

    it('returns null when the Maybe is nothing', function() {
      let subject = new Maybe();
      expect(subject.value()).to.be.null;
    });

    it('returns default value when the Maybe is nothing', function() {
      let subject = new Maybe(null, null, 'foobar');
      expect(subject.value()).to.equal('foobar');
    });

    it('allows default override', function() {
      let subject = new Maybe();
      expect(subject.value('foobar')).to.equal('foobar');
    });
  });

  describe('#bind', function() {
    it('returns a new Maybe wraping the functions returned value', function() {
      let subject = new Maybe('foobar');
      let result = subject.bind(function (v) { return 'barfoo'; });
      expect(result).to.be.an.instanceof(Maybe);
      expect(result.value()).to.equal('barfoo');
    });

    it('does not call function when value is nothing', function() {
      let subject = new Maybe();
      let bindSpy = sinon.spy();
      subject.bind(bindSpy);
      sinon.assert.notCalled(bindSpy);
    });

    it('calls function when value is not nothing', function() {
      let subject = new Maybe('foobar');
      let bindSpy = sinon.spy();
      subject.bind(bindSpy);
      sinon.assert.calledWith(bindSpy, 'foobar');
    });
  });

  describe('#nothing', function() {
    it('returns a new Maybe wraping the functions returned value', function() {
      let subject = new Maybe();
      let result = subject.nothing(function (v) { return 'barfoo'; });
      expect(result).to.be.an.instanceof(Maybe);
      expect(result.value()).to.equal('barfoo');
    });

    it('does not call function when value is not nothing', function() {
      let subject = new Maybe();
      let nothingSpy = sinon.spy();
      subject.nothing(nothingSpy);
      sinon.assert.called(nothingSpy);
    });

    it('calls function when value is nothing', function() {
      let subject = new Maybe('foobar');
      let nothingSpy = sinon.spy();
      subject.nothing(nothingSpy);
      sinon.assert.notCalled(nothingSpy);
    });
  });

  describe('#get', function() {
    it('returns a Maybe from object selector', function() {
      let subject = new Maybe({foo: 'bar'});
      let result = subject.get('foo');
      expect(result).to.be.an.instanceof(Maybe);
      expect(result.value()).to.equal('bar');
    });
  });

  describe('#invoke', function() {
    it('invokes method on value object when Maybe is not nothing', function() {
      let invokeSpy = sinon.spy();
      let subject = new Maybe({foo: invokeSpy});
      subject.invoke('foo', 'bar');
      sinon.assert.calledWith(invokeSpy, 'bar');
    });

    it('does not invoke method on value object when method is nothing', function() {
      let subject = new Maybe({});
      function test() {
        subject.invoke('foo');
      }
      expect(test).to.not.throw;
    });

    it('does not invoke method on value object when Maybe is nothing', function() {
      let invokeSpy = sinon.spy();
      let subject = new Maybe({foo: invokeSpy}).get('bar');
      subject.invoke('foo', 'bar');
      sinon.assert.notCalled(invokeSpy);
    });
  });

  describe('#isEqual', function() {
    it('returns true when both Maybe objects are equal', function() {
      let subject1 = new Maybe('foobar');
      let subject2 = new Maybe('foobar');
      expect(subject1.isEqual(subject2)).to.be.true;
    });

    it('returns false when both Maybe objects are not equal', function() {
      let subject1 = new Maybe('foobar');
      let subject2 = new Maybe('barfoo');
      expect(subject1.isEqual(subject2)).to.be.false;
    });

    it('returns true when subjects value is equal to comparitor', function() {
      let subject = new Maybe('foobar');
      expect(subject.isEqual('foobar')).to.be.true;
    });

    it('returns false when subjects value is not equal to comparitor', function() {
      let subject = new Maybe('foobar');
      expect(subject.isEqual('barfoo')).to.be.false;
    });

    it('returns true when subjects are nothing', function() {
      let subject1 = new Maybe();
      let subject2 = new Maybe(null);
      expect(subject1.isEqual(subject2)).to.be.true;
    });
  });

  describe('#toString', function() {
    it('returns a string representation of the value', function() {
      let subject = new Maybe({toString() { return 'foobar'; }});
      expect(subject.toString()).to.equal('foobar');
    });

    it('returns a string representation of the default value when subject is nothing', function() {
      let subject = new Maybe(null, null, {toString() { return 'foobar'; }});
      expect(subject.toString()).to.equal('foobar');
    });

    it('allows default override', function() {
      let subject = new Maybe(null, {toString() { return 'foobar'; }});
      expect(subject.toString('barfoo')).to.equal('barfoo');
    });

    it('returns empty string when subject is nothing with no default', function() {
      let subject = new Maybe();
      expect(subject.toString()).to.equal('');
    });
  });

  describe('#toJSONString', function() {
    it('returns a JSON string representation of the value', function() {
      let subject = new Maybe({foo: 'bar'});
      expect(subject.toJSONString()).to.equal('{"foo":"bar"}');
    });

    it('returns a JSON string representation of the default value when subject is nothing', function() {
      let subject = new Maybe(null, null, {bar: 'foo'});
      expect(subject.toJSONString()).to.equal('{"bar":"foo"}');
    });

    it('allows default override', function() {
      let subject = new Maybe(null, null, {foo: 'bar'});
      expect(subject.toJSONString({bar: 'foo'})).to.equal('{"bar":"foo"}');
    });

    it('returns empty JSON object when subject is nothing with no default', function() {
      let subject = new Maybe();
      expect(subject.toJSONString()).to.equal('{}');
    });
  });

  describe('::safeRead', function() {
    it('returns null when subject is nothing', function() {
      expect(Maybe.safeRead()).to.be.null;
      expect(Maybe.safeRead(null)).to.be.null;
    });

    it('returns object when selector is nothing', function() {
      let expected = {foo: 'bar'};
      expect(Maybe.safeRead(expected)).to.equal(expected);
    });

    it('returns null when nested selector does not exist', function() {
      let test = {foo: {bar: {baz: 'foobarbaz'}}};
      expect(Maybe.safeRead(test, 'foo.not-there.baz')).to.be.null;
    });

    it('returns value nested in object', function() {
      let test = {foo: {bar: {baz: 'foobarbaz'}}};
      expect(Maybe.safeRead(test, 'foo.bar.baz')).to.equal('foobarbaz');
    });
  });
});
