var assert = require('assert');
var fixtures = require('./fixtures/codec-fixtures.json');
var _a = require('../src'), decode = _a.decode, encode = _a.encode, decodeLedgerData = _a.decodeLedgerData;
function json(object) {
    return JSON.stringify(object);
}
describe('call-binary-codec', function () {
    function makeSuite(name, entries) {
        describe(name, function () {
            entries.forEach(function (t, test_n) {
                it(name + "[" + test_n + "] can encode " + json(t.json) + " to " + t.binary, function () {
                    assert.equal(t.binary, encode(t.json));
                });
                it(name + "[" + test_n + "] can decode " + t.binary + " to " + json(t.json), function () {
                    var decoded = decode(t.binary);
                    assert.deepEqual(t.json, decoded);
                });
            });
        });
    }
    makeSuite('transactions', fixtures.transactions);
    makeSuite('accountState', fixtures.accountState);
    describe('ledgerData', function () {
        fixtures.ledgerData.forEach(function (t, test_n) {
            it("ledgerData[" + test_n + "] can decode " + t.binary + " to " + json(t.json), function () {
                var decoded = decodeLedgerData(t.binary);
                assert.deepEqual(t.json, decoded);
            });
        });
    });
});
//# sourceMappingURL=binary-json-test.js.map