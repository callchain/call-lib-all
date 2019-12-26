var assert = require('assert');
var coreTypes = require('../src/coretypes');
/* eslint-disable no-unused-vars */
var UInt8 = coreTypes.UInt8, UInt16 = coreTypes.UInt16, UInt32 = coreTypes.UInt32, UInt64 = coreTypes.UInt64;
/* eslint-enable no-unused-vars */
function compareToTests() {
    function check(expr, is) {
        it(expr, function () {
            /* eslint-disable no-eval */
            assert.equal(eval(expr), is);
            /* eslint-enable no-eval */
        });
    }
    check('UInt8.from(124).compareTo(UInt64.from(124))', 0);
    check('UInt64.from(124).compareTo(UInt8.from(124))', 0);
    check('UInt64.from(124).compareTo(UInt8.from(123))', 1);
    check('UInt8.from(124).compareTo(UInt8.from(13))', 1);
    check('UInt8.from(124).compareTo(124)', 0);
    check('UInt64.from(124).compareTo(124)', 0);
    check('UInt64.from(124).compareTo(123)', 1);
    check('UInt8.from(124).compareTo(13)', 1);
}
function valueOfTests() {
    it('The Uint classes work with |= operator', function () {
        var val = UInt8.from(1);
        val |= 0x2;
        assert.equal(val, 3);
    });
}
describe('Uint*', function () {
    describe('compareToTests', compareToTests);
    describe('valueOfTests', valueOfTests);
});
//# sourceMappingURL=uint-test.js.map