'use strict';var _ = require('lodash');
var makeClass = require('../utils/make-class');var _require =
require('../utils/bytes-utils'),slice = _require.slice;var _require2 =
require('./hash-160'),Hash160 = _require2.Hash160;
var ISO_REGEX = /^[A-Z0-9]{2,6}$/;
var HEX_REGEX = /^[A-F0-9]{40}$/;

function isoToBytes(iso) {
  var bytes = new Uint8Array(20);
  if (iso !== 'QYBC') {
    var isoBytes = iso.split('').map(function (c) {return c.charCodeAt(0);});
    console.log('isoBytes');
    console.log(isoBytes);
    bytes.set(isoBytes, 15-isoBytes.length);
  }
  return bytes;
}

function isISOCode(val) {
  return (val.length >= 2 && val.length <= 6); // ISO_REGEX.test(val);
}

function isHex(val) {
  return HEX_REGEX.test(val);
}

function isStringRepr(val) {
  return _.isString(val) && (isISOCode(val) || isHex(val));
}

function isBytesArray(val) {
  return val.length === 20;
}

function isValidRepr(val) {
  return isStringRepr(val) || isBytesArray(val);
}

function bytesFromRepr(val) {
  if (isValidRepr(val)) {
    // We assume at this point that we have an object with a length, either 3,
    // 20 or 40.
    return (val.length >= 2 && val.length <= 6) ? isoToBytes(val) : val;
  }
  throw new Error('Unsupported Currency repr: ' + val);
}

var $uper = Hash160.prototype;
var Currency = makeClass({
  inherits: Hash160,
  getters: ['isNative', 'iso'],
  statics: {
    init: function init() {
      this.call = new this(new Uint8Array(20));
    },
    from: function from(val) {
      return val instanceof this ? val : new this(bytesFromRepr(val));
    } },

  Currency: function Currency(bytes) {
    Hash160.call(this, bytes);
    this.classify();
  },
  classify: function classify() {
    // We only have a non null iso() property available if the currency can be
    // losslessly represented by the 3 letter iso code. If none is available a
    // hex encoding of the full 20 bytes is the canonical representation.
    var onlyISO = true;

    var bytes = this._bytes;
    var code = slice(this._bytes, 9, 15, Array);

    var iso = code.map(function (c) {
      if(c!==0){
        return String.fromCharCode(c);
      }
    }).join('');

    for (var i = bytes.length - 1; i >= 0; i--) {
      if (bytes[i] !== 0 && !(i>=9 && i<15)) {
        onlyISO = false;
        break;
      }
    }
    var lossLessISO = onlyISO && iso !== 'QYBC' && ISO_REGEX.test(iso);
    this._isNative = onlyISO && _.isEqual(code, [0, 0, 0, 0, 0, 0]);
    this._iso = this._isNative ? 'QYBC' : lossLessISO ? iso : null;
  },
  toJSON: function toJSON() {
    if (this.iso()) {
      return this.iso();
    }
    return $uper.toJSON.call(this);
  } });


module.exports = {
  Currency: Currency };