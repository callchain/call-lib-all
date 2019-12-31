/* eslint-disable func-style */
var BN = require('bn.js');
var assert = require('assert-diff');
var lib = require('../src/coretypes');
var encode = require('../src').encode;
var _a = lib.binary, makeParser = _a.makeParser, BytesList = _a.BytesList, BinarySerializer = _a.BinarySerializer;
var UInt8 = lib.UInt8, UInt16 = lib.UInt16, UInt32 = lib.UInt32, UInt64 = lib.UInt64, STObject = lib.STObject;
var loadFixture = require('./utils').loadFixture;
var fixtures = loadFixture('data-driven-tests.json');
var deliverMinTx = require('./fixtures/delivermin-tx.json');
var deliverMinTxBinary = require('./fixtures/delivermin-tx-binary.json');
var SignerListSet = {
    tx: require('./fixtures/signerlistset-tx.json'),
    binary: require('./fixtures/signerlistset-tx-binary.json'),
    meta: require('./fixtures/signerlistset-tx-meta-binary.json')
};
var DepositPreauth = {
    tx: require('./fixtures/deposit-preauth-tx.json'),
    binary: require('./fixtures/deposit-preauth-tx-binary.json'),
    meta: require('./fixtures/deposit-preauth-tx-meta-binary.json')
};
var Escrow = {
    create: {
        tx: require('./fixtures/escrow-create-tx.json'),
        binary: require('./fixtures/escrow-create-binary.json')
    },
    finish: {
        tx: require('./fixtures/escrow-finish-tx.json'),
        binary: require('./fixtures/escrow-finish-binary.json'),
        meta: require('./fixtures/escrow-finish-meta-binary.json')
    },
    cancel: {
        tx: require('./fixtures/escrow-cancel-tx.json'),
        binary: require('./fixtures/escrow-cancel-binary.json')
    }
};
var PaymentChannel = {
    create: {
        tx: require('./fixtures/payment-channel-create-tx.json'),
        binary: require('./fixtures/payment-channel-create-binary.json')
    },
    fund: {
        tx: require('./fixtures/payment-channel-fund-tx.json'),
        binary: require('./fixtures/payment-channel-fund-binary.json')
    },
    claim: {
        tx: require('./fixtures/payment-channel-claim-tx.json'),
        binary: require('./fixtures/payment-channel-claim-binary.json')
    }
};
function bytesListTest() {
    var list = new BytesList().put([0]).put([2, 3]).put([4, 5]);
    it('is an Array<Uint8Array>', function () {
        assert(Array.isArray(list.arrays));
        assert(list.arrays[0] instanceof Uint8Array);
    });
    it('keeps track of the length itself', function () {
        assert.equal(list.length, 5);
    });
    it('can join all arrays into one via toBytes', function () {
        var joined = list.toBytes();
        assert(joined.length, 5);
        assert.deepEqual(joined, [0, 2, 3, 4, 5]);
    });
}
function assertRecycles(blob) {
    var parser = makeParser(blob);
    var so = parser.readType(STObject);
    var out = new BytesList();
    so.toBytesSink(out);
    var hex = out.toHex();
    assert.equal(hex, blob);
    assert.notEqual(hex + ':', blob);
}
function nestedObjectTests() {
    fixtures.whole_objects.forEach(function (f, i) {
        it("whole_objects[" + i + "]: can parse blob and dump out same blob", 
        /*                                              */ function () {
            assertRecycles(f.blob_with_no_signing);
        });
    });
}
function UIntTest() {
    function check(type, n, expected) {
        it("Uint" + type.width * 8 + " serializes " + n + " as " + expected, function () {
            var bl = new BytesList();
            var serializer = new BinarySerializer(bl);
            if (expected === 'throws') {
                assert.throws(function () { return serializer.writeType(type, n); });
                return;
            }
            serializer.writeType(type, n);
            assert.deepEqual(bl.toBytes(), expected);
        });
    }
    check(UInt8, 5, [5]);
    check(UInt16, 5, [0, 5]);
    check(UInt32, 5, [0, 0, 0, 5]);
    check(UInt32, 0xFFFFFFFF, [255, 255, 255, 255]);
    check(UInt8, 0xFEFFFFFF, 'throws');
    check(UInt16, 0xFEFFFFFF, 'throws');
    check(UInt16, 0xFEFFFFFF, 'throws');
    check(UInt64, 0xFEFFFFFF, [0, 0, 0, 0, 254, 255, 255, 255]);
    check(UInt64, -1, 'throws');
    check(UInt64, 0, [0, 0, 0, 0, 0, 0, 0, 0]);
    check(UInt64, 1, [0, 0, 0, 0, 0, 0, 0, 1]);
    check(UInt64, new BN(1), [0, 0, 0, 0, 0, 0, 0, 1]);
}
function parseLedger4320278() {
    var _this = this;
    it('can parse object', function (done) {
        _this.timeout(30e3);
        var json = loadFixture('as-ledger-4320278.json');
        json.forEach(function (e) {
            assertRecycles(e.binary);
        });
        done();
    });
}
function deliverMinTest() {
    it('can serialize DeliverMin', function () {
        assert.strictEqual(encode(deliverMinTx), deliverMinTxBinary);
    });
}
function SignerListSetTest() {
    it('can serialize SignerListSet', function () {
        assert.strictEqual(encode(SignerListSet.tx), SignerListSet.binary);
    });
    it('can serialize SignerListSet metadata', function () {
        assert.strictEqual(encode(SignerListSet.tx.meta), SignerListSet.meta);
    });
}
function DepositPreauthTest() {
    it('can serialize DepositPreauth', function () {
        assert.strictEqual(encode(DepositPreauth.tx), DepositPreauth.binary);
    });
    it('can serialize DepositPreauth metadata', function () {
        assert.strictEqual(encode(DepositPreauth.tx.meta), DepositPreauth.meta);
    });
}
function EscrowTest() {
    it('can serialize EscrowCreate', function () {
        assert.strictEqual(encode(Escrow.create.tx), Escrow.create.binary);
    });
    it('can serialize EscrowFinish', function () {
        assert.strictEqual(encode(Escrow.finish.tx), Escrow.finish.binary);
        assert.strictEqual(encode(Escrow.finish.tx.meta), Escrow.finish.meta);
    });
    it('can serialize EscrowCancel', function () {
        assert.strictEqual(encode(Escrow.cancel.tx), Escrow.cancel.binary);
    });
}
function PaymentChannelTest() {
    it('can serialize PaymentChannelCreate', function () {
        assert.strictEqual(encode(PaymentChannel.create.tx), PaymentChannel.create.binary);
    });
    it('can serialize PaymentChannelFund', function () {
        assert.strictEqual(encode(PaymentChannel.fund.tx), PaymentChannel.fund.binary);
    });
    it('can serialize PaymentChannelClaim', function () {
        assert.strictEqual(encode(PaymentChannel.claim.tx), PaymentChannel.claim.binary);
    });
}
describe('Binary Serialization', function () {
    describe.skip('parseLedger4320278', parseLedger4320278);
    describe('nestedObjectTests', nestedObjectTests);
    describe('UIntTest', UIntTest);
    describe('BytesList', bytesListTest);
    describe('DeliverMin', deliverMinTest);
    describe('DepositPreauth', DepositPreauthTest);
    describe('SignerListSet', SignerListSetTest);
    describe('Escrow', EscrowTest);
    describe('PaymentChannel', PaymentChannelTest);
});
//# sourceMappingURL=binary-serializer-test.js.map