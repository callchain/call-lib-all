var assert = require('assert-diff');
var ShaMap = require('../src/shamap.js').ShaMap;
var _a = require('../src/coretypes'), serializeObject = _a.binary.serializeObject, Hash256 = _a.Hash256, HashPrefix = _a.HashPrefix;
var loadFixture = require('./utils').loadFixture;
function now() {
    return (Number(Date.now())) / 1000;
}
var ZERO = '0000000000000000000000000000000000000000000000000000000000000000';
function makeItem(indexArg) {
    var str = indexArg;
    while (str.length < 64) {
        str += '0';
    }
    var index = Hash256.from(str);
    var item = {
        toBytesSink: function (sink) {
            index.toBytesSink(sink);
        },
        hashPrefix: function () {
            return [1, 3, 3, 7];
        }
    };
    return [index, item];
}
describe('ShaMap', function () {
    now();
    it('hashes to zero when empty', function () {
        var map = new ShaMap();
        assert.equal(map.hash().toHex(), ZERO);
    });
    it('creates the same hash no matter which order items are added', function () {
        var map = new ShaMap();
        var items = [
            '0',
            '1',
            '11',
            '7000DE445E22CB9BB7E1717589FA858736BAA5FD192310E20000000000000000',
            '7000DE445E22CB9BB7E1717589FA858736BAA5FD192310E21000000000000000',
            '7000DE445E22CB9BB7E1717589FA858736BAA5FD192310E22000000000000000',
            '7000DE445E22CB9BB7E1717589FA858736BAA5FD192310E23000000000000000',
            '12',
            '122'
        ];
        items.forEach(function (i) { return map.addItem.apply(map, makeItem(i)); });
        var h1 = map.hash();
        assert(h1.eq(h1));
        map = new ShaMap();
        items.reverse().forEach(function (i) { return map.addItem.apply(map, makeItem(i)); });
        assert(map.hash().eq(h1));
    });
    function factory(fixture) {
        it("recreate account state hash from " + fixture, function () {
            var map = new ShaMap();
            var ledger = loadFixture(fixture);
            // const t = now();
            var leafNodePrefix = HashPrefix.accountStateEntry;
            ledger.accountState.map(function (e, i) {
                if (i > 1000 & (i % 1000) === 0) {
                    console.log(e.index);
                    console.log(i);
                }
                var bytes = serializeObject(e);
                return {
                    index: Hash256.from(e.index),
                    hashPrefix: function () {
                        return leafNodePrefix;
                    },
                    toBytesSink: function (sink) {
                        sink.put(bytes);
                    }
                };
            }).forEach(function (so) { return map.addItem(so.index, so); });
            assert.equal(map.hash().toHex(), ledger.account_hash);
            // console.log('took seconds: ', (now() - t));
        });
    }
    factory('ledger-full-38129.json');
    factory('ledger-full-40000.json');
    // factory('ledger-4320277.json');
    // factory('14280680.json');
});
//# sourceMappingURL=shamap-test.js.map