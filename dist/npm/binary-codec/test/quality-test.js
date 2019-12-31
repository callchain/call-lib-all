var assert = require('assert-diff');
var _a = require('../src/coretypes'), quality = _a.quality, bytesToHex = _a.binary.bytesToHex;
describe('Quality encode/decode', function () {
    var bookDirectory = '4627DFFCFF8B5A265EDBD8AE8C14A52325DBFEDAF4F5C32E5D06F4C3362FE1D0';
    var expectedQuality = '195796912.5171664';
    it('can decode', function () {
        var decimal = quality.decode(bookDirectory);
        assert.equal(decimal.toString(), expectedQuality);
    });
    it('can encode', function () {
        var bytes = quality.encode(expectedQuality);
        assert.equal(bytesToHex(bytes), bookDirectory.slice(-16));
    });
});
//# sourceMappingURL=quality-test.js.map