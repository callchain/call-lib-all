var intercept = require('intercept-stdout');
var fs = require('fs');
var fsExtra = require('fs-extra');
var assert = require('assert');
var Decimal = require('decimal.js');
var parseBytes = require('../src/utils/bytes-utils').parseBytes;
function hexOnly(hex) {
    return hex.replace(/[^a-fA-F0-9]/g, '');
}
function unused() { }
function captureLogsAsync() {
    var log = '';
    var unhook = intercept(function (txt) {
        log += txt;
        return '';
    });
    return function () {
        unhook();
        return log;
    };
}
function captureLogs(func) {
    var finished = captureLogsAsync();
    try {
        func();
    }
    catch (e) {
        var log = finished();
        console.error(log);
        throw e;
    }
    return finished();
}
function parseHexOnly(hex, to) {
    return parseBytes(hexOnly(hex), to);
}
function loadFixture(relativePath) {
    var fn = __dirname + '/fixtures/' + relativePath;
    return require(fn);
}
function isBufferOrString(val) {
    return Buffer.isBuffer(val) || (typeof val === 'string');
}
function loadFixtureText(relativePath) {
    var fn = __dirname + '/fixtures/' + relativePath;
    return fs.readFileSync(fn).toString('utf8');
}
function fixturePath(relativePath) {
    return __dirname + '/fixtures/' + relativePath;
}
function prettyJSON(val) {
    return JSON.stringify(val, null, 2);
}
function writeFixture(relativePath, data) {
    var out = isBufferOrString(data) ? data : prettyJSON(data);
    return fsExtra.outputFileSync(fixturePath(relativePath), out);
}
function assertEqualAmountJSON(actual, expected) {
    var typeA = (typeof actual);
    assert(typeA === (typeof expected));
    if (typeA === 'string') {
        assert.equal(actual, expected);
        return;
    }
    assert.equal(actual.currency, expected.currency);
    assert.equal(actual.issuer, expected.issuer);
    assert(actual.value === expected.value ||
        new Decimal(actual.value).equals(new Decimal(expected.value)));
}
module.exports = {
    hexOnly: hexOnly,
    parseHexOnly: parseHexOnly,
    loadFixture: loadFixture,
    loadFixtureText: loadFixtureText,
    assertEqualAmountJSON: assertEqualAmountJSON,
    writeFixture: writeFixture,
    unused: unused,
    captureLogs: captureLogs,
    captureLogsAsync: captureLogsAsync
};
//# sourceMappingURL=utils.js.map