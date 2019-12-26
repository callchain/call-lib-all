var _ = require('lodash');
var assert = require('assert-diff');
var utils = require('./utils');
var Amount = require('../src/coretypes').Amount;
var loadFixture = utils.loadFixture;
var fixtures = loadFixture('data-driven-tests.json');
function amountErrorTests() {
    _.filter(fixtures.values_tests, { type: 'Amount' }).forEach(function (f) {
        // We only want these with errors
        if (!f.error) {
            return;
        }
        var testName = JSON.stringify(f.test_json) + "\n\tis invalid " +
            ("because: " + f.error);
        it(testName, function () {
            assert.throws(function () {
                Amount.from(f.test_json);
            }, JSON.stringify(f.test_json));
        });
    });
}
describe('Amount', function () {
    it('can be parsed from', function () {
        assert(Amount.from('1000000') instanceof Amount);
        assert.equal(Amount.from('1000000').valueString(), '1000000');
        var fixture = {
            'value': '1',
            'issuer': '0000000000000000000000000000000000000000',
            'currency': 'USD'
        };
        var amt = Amount.from(fixture);
        var rewritten = {
            'value': '1',
            'issuer': 'ccccccccccccccccccccchoLvTp',
            'currency': 'USD'
        };
        assert.deepEqual(amt.toJSON(), rewritten);
    });
    amountErrorTests();
});
//# sourceMappingURL=amount-test.js.map