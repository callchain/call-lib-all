/* eslint-disable func-style */
var coreTypes = require('../src/coretypes');
var _ = require('lodash');
var assert = require('assert-diff');
var encodeAccountID = require('../../call-address-codec/src').encodeAccountID;
var _a = coreTypes.binary, makeParser = _a.makeParser, readJSON = _a.readJSON, Field = coreTypes.Field, Amount = coreTypes.Amount, Hash160 = coreTypes.Hash160;
var TransactionType = coreTypes.enums.TransactionType;
var utils = require('./utils');
var parseHexOnly = utils.parseHexOnly, assertEqualAmountJSON = utils.assertEqualAmountJSON, hexOnly = utils.hexOnly, loadFixture = utils.loadFixture;
var bytesToHex = require('../src/utils/bytes-utils').bytesToHex;
var fixtures = loadFixture('data-driven-tests.json');
var BytesList = require('../src/serdes/binary-serializer').BytesList;
var __ = hexOnly;
function unused() { }
function toJSON(v) {
    return v.toJSON ? v.toJSON() : v;
}
function basicApiTests() {
    var bytes = parseHexOnly('00,01020304,0506', Uint8Array);
    it('can read slices of bytes', function () {
        var parser = makeParser(bytes);
        assert.deepEqual(parser.pos(), 0);
        assert(parser._buf instanceof Uint8Array);
        var read1 = parser.read(1);
        assert(read1 instanceof Uint8Array);
        assert.deepEqual(read1, [0]);
        assert.deepEqual(parser.read(4), [1, 2, 3, 4]);
        assert.deepEqual(parser.read(2), [5, 6]);
        assert.throws(function () { return parser.read(1); });
    });
    it('can read a Uint32 at full', function () {
        var parser = makeParser('FFFFFFFF');
        assert.equal(parser.readUInt32(), 0xFFFFFFFF);
    });
}
function transactionParsingTests() {
    var transaction = {
        json: {
            'Account': 'raD5qJMAShLeHZXf9wjUmo6vRK4arj9cF3',
            'Fee': '10',
            'Flags': 0,
            'Sequence': 103929,
            'SigningPubKey': '028472865AF4CB32AA285834B57576B7290AA8C31B459047DB27E16F418D6A7166',
            'TakerGets': { 'currency': 'ILS',
                'issuer': 'rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9',
                'value': '1694.768' },
            'TakerPays': '98957503520',
            'TransactionType': 'OfferCreate',
            'TxnSignature': __("\n          304502202ABE08D5E78D1E74A4C18F2714F64E87B8BD57444AF\n          A5733109EB3C077077520022100DB335EE97386E4C0591CAC02\n          4D50E9230D8F171EEB901B5E5E4BD6D1E0AEF98C")
        },
        binary: __("\n      120007220000000024000195F964400000170A53AC2065D5460561E\n      C9DE000000000000000000000000000494C53000000000092D70596\n      8936C419CE614BF264B5EEB1CEA47FF468400000000000000A73210\n      28472865AF4CB32AA285834B57576B7290AA8C31B459047DB27E16F\n      418D6A71667447304502202ABE08D5E78D1E74A4C18F2714F64E87B\n      8BD57444AFA5733109EB3C077077520022100DB335EE97386E4C059\n      1CAC024D50E9230D8F171EEB901B5E5E4BD6D1E0AEF98C811439408\n      A69F0895E62149CFCC006FB89FA7D1E6E5D")
    };
    var tx_json = transaction.json;
    // These tests are basically development logs
    it('can be done with low level apis', function () {
        var parser = makeParser(transaction.binary);
        assert.equal(parser.readField(), Field.TransactionType);
        assert.equal(parser.readUInt16(), 7);
        assert.equal(parser.readField(), Field.Flags);
        assert.equal(parser.readUInt32(), 0);
        assert.equal(parser.readField(), Field.Sequence);
        assert.equal(parser.readUInt32(), 103929);
        assert.equal(parser.readField(), Field.TakerPays);
        parser.read(8);
        assert.equal(parser.readField(), Field.TakerGets);
        // amount value
        assert(parser.read(8));
        // amount currency
        assert(Hash160.fromParser(parser));
        assert.equal(encodeAccountID(parser.read(20)), tx_json.TakerGets.issuer);
        assert.equal(parser.readField(), Field.Fee);
        assert(parser.read(8));
        assert.equal(parser.readField(), Field.SigningPubKey);
        assert.equal(parser.readVLLength(), 33);
        assert.equal(bytesToHex(parser.read(33)), tx_json.SigningPubKey);
        assert.equal(parser.readField(), Field.TxnSignature);
        assert.equal(bytesToHex(parser.readVL()), tx_json.TxnSignature);
        assert.equal(parser.readField(), Field.Account);
        assert.equal(encodeAccountID(parser.readVL()), tx_json.Account);
        assert(parser.end());
    });
    it('can be done with high level apis', function () {
        var parser = makeParser(transaction.binary);
        function readField() {
            return parser.readFieldAndValue();
        }
        {
            var _a = readField(), field = _a[0], value = _a[1];
            assert.equal(field, Field.TransactionType);
            assert.equal(value, TransactionType.OfferCreate);
        }
        {
            var _b = readField(), field = _b[0], value = _b[1];
            assert.equal(field, Field.Flags);
            assert.equal(value, 0);
        }
        {
            var _c = readField(), field = _c[0], value = _c[1];
            assert.equal(field, Field.Sequence);
            assert.equal(value, 103929);
        }
        {
            var _d = readField(), field = _d[0], value = _d[1];
            assert.equal(field, Field.TakerPays);
            assert.equal(value.currency.isNative(), true);
            assert.equal(value.currency.toJSON(), 'CALL');
        }
        {
            var _e = readField(), field = _e[0], value = _e[1];
            assert.equal(field, Field.TakerGets);
            assert.equal(value.currency.isNative(), false);
            assert.equal(value.issuer.toJSON(), tx_json.TakerGets.issuer);
        }
        {
            var _f = readField(), field = _f[0], value = _f[1];
            assert.equal(field, Field.Fee);
            assert.equal(value.currency.isNative(), true);
        }
        {
            var _g = readField(), field = _g[0], value = _g[1];
            assert.equal(field, Field.SigningPubKey);
            assert.equal(value.toJSON(), tx_json.SigningPubKey);
        }
        {
            var _h = readField(), field = _h[0], value = _h[1];
            assert.equal(field, Field.TxnSignature);
            assert.equal(value.toJSON(), tx_json.TxnSignature);
        }
        {
            var _j = readField(), field = _j[0], value = _j[1];
            assert.equal(field, Field.Account);
            assert.equal(value.toJSON(), tx_json.Account);
        }
        assert(parser.end());
    });
    it('can be done with higher level apis', function () {
        var parser = makeParser(transaction.binary);
        var jsonFromBinary = readJSON(parser);
        assert.deepEqual(jsonFromBinary, tx_json);
    });
    it('readJSON (binary.decode) does not return STObject ', function () {
        var parser = makeParser(transaction.binary);
        var jsonFromBinary = readJSON(parser);
        assert((jsonFromBinary instanceof coreTypes.STObject) === false);
        assert(_.isPlainObject(jsonFromBinary));
    });
}
function amountParsingTests() {
    _.filter(fixtures.values_tests, { type: 'Amount' }).forEach(function (f, i) {
        if (f.error) {
            return;
        }
        var parser = makeParser(f.expected_hex);
        var testName = "values_tests[" + i + "] parses " + f.expected_hex.slice(0, 16) + "...\n          as " + JSON.stringify(f.test_json);
        it(testName, function () {
            var value = parser.readType(Amount);
            // May not actually be in canonical form. The fixtures are to be used
            // also for json -> binary;
            assertEqualAmountJSON(toJSON(value), f.test_json);
            if (f.exponent) {
                assert.equal(value.exponent(), f.exponent);
            }
        });
    });
}
function fieldParsingTests() {
    fixtures.fields_tests.forEach(function (f, i) {
        var parser = makeParser(f.expected_hex);
        it("fields[" + i + "]: parses " + f.expected_hex + " as " + f.name, function () {
            var field = parser.readField();
            assert.equal(field.name, f.name);
            assert.equal(field.type.name, f.type_name);
        });
    });
}
function assertRecyclable(json, forField) {
    var Type = forField.associatedType;
    var recycled = Type.from(json).toJSON();
    assert.deepEqual(recycled, json);
    var sink = new BytesList();
    Type.from(recycled).toBytesSink(sink);
    var recycledAgain = makeParser(sink.toHex())
        .readType(Type)
        .toJSON();
    assert.deepEqual(recycledAgain, json);
}
function nestedObjectTests() {
    function disabled(i) {
        unused(i);
        return false; // !_.includes([2], i);
    }
    fixtures.whole_objects.forEach(function (f, i) {
        if (disabled(i)) {
            return;
        }
        it("whole_objects[" + i + "]: can parse blob into\n          " + JSON.stringify(f.tx_json), 
        /*                                              */ function () {
            var parser = makeParser(f.blob_with_no_signing);
            var ix = 0;
            while (!parser.end()) {
                var _a = parser.readFieldAndValue(), field = _a[0], value = _a[1];
                var expected = f.fields[ix];
                var expectedJSON = expected[1].json;
                var expectedField = expected[0];
                var actual = toJSON(value);
                try {
                    assert.deepEqual(actual, expectedJSON);
                }
                catch (e) {
                    throw new Error(e + " " + field + " a: " + actual + " e: " + expectedJSON);
                }
                assert.equal(field.name, expectedField);
                assertRecyclable(actual, field);
                ix++;
            }
        });
    });
}
function pathSetBinaryTests() {
    var bytes = __("1200002200000000240000002E2E00004BF161D4C71AFD498D00000000000000\n     0000000000000055534400000000000A20B3C85F482532A9578DBB3950B85CA0\n     6594D168400000000000000A69D446F8038585E9400000000000000000000000\n     00425443000000000078CA21A6014541AB7B26C3929B9E0CD8C284D61C732103\n     A4665B1F0B7AE2BCA12E2DB80A192125BBEA660F80E9CEE137BA444C1B0769EC\n     7447304502205A964536805E35785C659D1F9670D057749AE39668175D6AA75D\n     25B218FE682E0221009252C0E5DDD5F2712A48F211669DE17B54113918E0D2C2\n     66F818095E9339D7D3811478CA21A6014541AB7B26C3929B9E0CD8C284D61C83\n     140A20B3C85F482532A9578DBB3950B85CA06594D1011231585E1F3BD02A15D6\n     185F8BB9B57CC60DEDDB37C10000000000000000000000004254430000000000\n     585E1F3BD02A15D6185F8BB9B57CC60DEDDB37C131E4FE687C90257D3D2D694C\n     8531CDEECBE84F33670000000000000000000000004254430000000000E4FE68\n     7C90257D3D2D694C8531CDEECBE84F3367310A20B3C85F482532A9578DBB3950\n     B85CA06594D100000000000000000000000042544300000000000A20B3C85F48\n     2532A9578DBB3950B85CA06594D1300000000000000000000000005553440000\n     0000000A20B3C85F482532A9578DBB3950B85CA06594D1FF31585E1F3BD02A15\n     D6185F8BB9B57CC60DEDDB37C100000000000000000000000042544300000000\n     00585E1F3BD02A15D6185F8BB9B57CC60DEDDB37C131E4FE687C90257D3D2D69\n     4C8531CDEECBE84F33670000000000000000000000004254430000000000E4FE\n     687C90257D3D2D694C8531CDEECBE84F33673115036E2D3F5437A83E5AC3CAEE\n     34FF2C21DEB618000000000000000000000000425443000000000015036E2D3F\n     5437A83E5AC3CAEE34FF2C21DEB6183000000000000000000000000055534400\n     000000000A20B3C85F482532A9578DBB3950B85CA06594D1FF31585E1F3BD02A\n     15D6185F8BB9B57CC60DEDDB37C1000000000000000000000000425443000000\n     0000585E1F3BD02A15D6185F8BB9B57CC60DEDDB37C13157180C769B66D942EE\n     69E6DCC940CA48D82337AD000000000000000000000000425443000000000057\n     180C769B66D942EE69E6DCC940CA48D82337AD10000000000000000000000000\n     58525000000000003000000000000000000000000055534400000000000A20B3\n     C85F482532A9578DBB3950B85CA06594D100");
    var expectedJSON = [[{ account: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K',
                currency: 'BTC',
                issuer: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K' },
            { account: 'rM1oqKtfh1zgjdAgbFmaRm3btfGBX25xVo',
                currency: 'BTC',
                issuer: 'rM1oqKtfh1zgjdAgbFmaRm3btfGBX25xVo' },
            { account: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B',
                currency: 'BTC',
                issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' },
            { currency: 'USD',
                issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' }],
        [{ account: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K',
                currency: 'BTC',
                issuer: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K' },
            { account: 'rM1oqKtfh1zgjdAgbFmaRm3btfGBX25xVo',
                currency: 'BTC',
                issuer: 'rM1oqKtfh1zgjdAgbFmaRm3btfGBX25xVo' },
            { account: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi',
                currency: 'BTC',
                issuer: 'rpvfJ4mR6QQAeogpXEKnuyGBx8mYCSnYZi' },
            { currency: 'USD',
                issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' }],
        [{ account: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K',
                currency: 'BTC',
                issuer: 'r9hEDb4xBGRfBCcX3E4FirDWQBAYtpxC8K' },
            { account: 'r3AWbdp2jQLXLywJypdoNwVSvr81xs3uhn',
                currency: 'BTC',
                issuer: 'r3AWbdp2jQLXLywJypdoNwVSvr81xs3uhn' },
            { currency: '0000000000000000000000005852500000000000' },
            { currency: 'USD',
                issuer: 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B' }]];
    it('works with long paths', function () {
        var parser = makeParser(bytes);
        var txn = readJSON(parser);
        assert.deepEqual(txn.Paths, expectedJSON);
        // TODO: this should go elsewhere
        assert.deepEqual(coreTypes.PathSet.from(txn.Paths).toJSON(), expectedJSON);
    });
}
describe('BinaryParser', function () {
    function dataDrivenTests() {
        describe('Amount parsing tests', amountParsingTests);
        describe('Field Tests', fieldParsingTests);
        describe('Parsing nested objects', nestedObjectTests);
    }
    describe('pathSetBinaryTests', pathSetBinaryTests);
    describe('Basic API', basicApiTests);
    describe('Parsing a transaction', transactionParsingTests);
    describe('Data Driven Tests', dataDrivenTests);
});
//# sourceMappingURL=binary-parser-test.js.map