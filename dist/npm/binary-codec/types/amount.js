'use strict';
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
function _toConsumableArray(arr) { if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
}
else {
    return Array.from(arr);
} }
var _ = require('lodash');
var assert = require('assert');
var BN = require('bn.js');
var Decimal = require('decimal.js');
var makeClass = require('../utils/make-class');
var _require = require('./serialized-type'), SerializedType = _require.SerializedType;
var _require2 = require('../utils/bytes-utils'), bytesToHex = _require2.bytesToHex;
var _require3 = require('./currency'), Currency = _require3.Currency;
var _require4 = require('./account-id'), AccountID = _require4.AccountID;
var _require5 = require('./uint-64'), UInt64 = _require5.UInt64;
var MIN_IOU_EXPONENT = -96;
var MAX_IOU_EXPONENT = 80;
var MAX_IOU_PRECISION = 16;
var MIN_IOU_MANTISSA = '1000' + '0000' + '0000' + '0000'; // 16 digits
var MAX_IOU_MANTISSA = '9999' + '9999' + '9999' + '9999'; // ..
var MAX_IOU = new Decimal(MAX_IOU_MANTISSA + 'e' + MAX_IOU_EXPONENT);
var MIN_IOU = new Decimal(MIN_IOU_MANTISSA + 'e' + MIN_IOU_EXPONENT);
var DROPS_PER_CALL = new Decimal('1e6');
var MAX_NETWORK_DROPS = new Decimal('1e17');
var MIN_CALL = new Decimal('1e-6');
var MAX_CALL = MAX_NETWORK_DROPS.dividedBy(DROPS_PER_CALL);
// Never use exponential form
Decimal.config({
    toExpPos: MAX_IOU_EXPONENT + MAX_IOU_PRECISION,
    toExpNeg: MIN_IOU_EXPONENT - MAX_IOU_PRECISION
});
var AMOUNT_PARAMETERS_DESCRIPTION = '\nNative values must be described in drops, a million of which equal one CALL.\nThis must be an integer number, with the absolute value not exceeding ' +
    MAX_NETWORK_DROPS + '\n\nIOU values must have a maximum precision of ' +
    MAX_IOU_PRECISION + ' significant digits. They are serialized as\na canonicalised mantissa and exponent.\n\nThe valid range for a mantissa is between ' +
    MIN_IOU_MANTISSA + ' and ' +
    MAX_IOU_MANTISSA + '\nThe exponent must be >= ' +
    MIN_IOU_EXPONENT + ' and <= ' + MAX_IOU_EXPONENT + '\n\nThus the largest serializable IOU value is:\n' +
    MAX_IOU.toString() + '\n\nAnd the smallest:\n' +
    MIN_IOU.toString() + '\n';
function isDefined(val) {
    return !_.isUndefined(val);
}
function raiseIllegalAmountError(value) {
    throw new Error(value.toString() + ' is an illegal amount\n' +
        AMOUNT_PARAMETERS_DESCRIPTION);
}
var parsers = {
    string: function string(str) {
        if (!str.match(/\d+/)) {
            raiseIllegalAmountError(str);
        }
        return [new Decimal(str).dividedBy(DROPS_PER_CALL), Currency.CALL];
    },
    object: function object(_object) {
        assert(isDefined(_object.currency), 'currency must be defined');
        assert(isDefined(_object.issuer), 'issuer must be defined');
        return [new Decimal(_object.value),
            Currency.from(_object.currency),
            AccountID.from(_object.issuer)];
    }
};
var Amount = makeClass({
    Amount: function Amount(value, currency, issuer) {
        var validate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        this.value = value || new Decimal('0');
        this.currency = currency || Currency.CALL;
        this.issuer = issuer || null;
        if (validate) {
            this.assertValueIsValid();
        }
    },
    mixins: SerializedType,
    statics: {
        from: function from(value) {
            if (value instanceof this) {
                return value;
            }
            var parser = parsers[typeof value === 'undefined' ? 'undefined' : _typeof(value)];
            if (parser) {
                return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(parser(value)))))();
            }
            throw new Error('unsupported value: ' + value);
        },
        fromParser: function fromParser(parser) {
            var mantissa = parser.read(8);
            var b1 = mantissa[0];
            var b2 = mantissa[1];
            var isIOU = b1 & 0x80;
            var isPositive = b1 & 0x40;
            var sign = isPositive ? '' : '-';
            if (isIOU) {
                mantissa[0] = 0;
                var currency = parser.readType(Currency);
                var issuer = parser.readType(AccountID);
                var exponent = ((b1 & 0x3F) << 2) + ((b2 & 0xff) >> 6) - 97;
                mantissa[1] &= 0x3F;
                // decimal.js won't accept e notation with hex
                var value = new Decimal(sign + '0x' + bytesToHex(mantissa)).
                    times('1e' + exponent);
                return new this(value, currency, issuer, false);
            }
            mantissa[0] &= 0x3F;
            var drops = new Decimal(sign + '0x' + bytesToHex(mantissa));
            var callValue = drops.dividedBy(DROPS_PER_CALL);
            return new this(callValue, Currency.CALL, null, false);
        }
    },
    assertValueIsValid: function assertValueIsValid() {
        // zero is always a valid amount value
        if (!this.isZero()) {
            if (this.isNative()) {
                var abs = this.value.abs();
                if (abs.lt(MIN_CALL) || abs.gt(MAX_CALL)) {
                    // value is in CALL scale, but show the value in canonical json form
                    raiseIllegalAmountError(this.value.times(DROPS_PER_CALL));
                }
            }
            else {
                var p = this.value.precision();
                var e = this.exponent();
                if (p > MAX_IOU_PRECISION ||
                    e > MAX_IOU_EXPONENT ||
                    e < MIN_IOU_EXPONENT) {
                    raiseIllegalAmountError(this.value);
                }
            }
        }
    },
    isNative: function isNative() {
        return this.currency.isNative();
    },
    mantissa: function mantissa() {
        return new UInt64(new BN(this.value.times('1e' + -this.exponent()).abs().toString()));
    },
    isZero: function isZero() {
        return this.value.isZero();
    },
    exponent: function exponent() {
        return this.isNative() ? -6 : this.value.e - 15;
    },
    valueString: function valueString() {
        return (this.isNative() ? this.value.times(DROPS_PER_CALL) : this.value).
            toString();
    },
    toBytesSink: function toBytesSink(sink) {
        var isNative = this.isNative();
        var notNegative = !this.value.isNegative();
        var mantissa = this.mantissa().toBytes();
        if (isNative) {
            mantissa[0] |= notNegative ? 0x40 : 0;
            sink.put(mantissa);
        }
        else {
            mantissa[0] |= 0x80;
            if (!this.isZero()) {
                if (notNegative) {
                    mantissa[0] |= 0x40;
                }
                var exponent = this.value.e - 15;
                var exponentByte = 97 + exponent;
                mantissa[0] |= exponentByte >>> 2;
                mantissa[1] |= (exponentByte & 0x03) << 6;
            }
            sink.put(mantissa);
            this.currency.toBytesSink(sink);
            this.issuer.toBytesSink(sink);
        }
    },
    toJSON: function toJSON() {
        var valueString = this.valueString();
        if (this.isNative()) {
            return valueString;
        }
        return {
            value: valueString,
            currency: this.currency.toJSON(),
            issuer: this.issuer.toJSON()
        };
    }
});
module.exports = {
    Amount: Amount
};
//# sourceMappingURL=amount.js.map