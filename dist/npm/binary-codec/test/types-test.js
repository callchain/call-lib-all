var _ = require('lodash');
var assert = require('assert');
var coreTypes = require('../src/types');
var SerializedType = require('../src/types/serialized-type').SerializedType;
describe('SerializedType interfaces', function () {
    _.forOwn(coreTypes, function (Value, name) {
        it(name + " has a `from` static constructor", function () {
            assert(Value.from && Value.from !== Array.from);
        });
        it(name + " has a default constructor", function () {
            /* eslint-disable no-new*/
            new Value();
            /* eslint-enable no-new*/
        });
        it(name + ".from will return the same object", function () {
            var instance = new Value();
            assert(Value.from(instance) === instance);
        });
        it(name + " instances have toBytesSink", function () {
            assert(new Value().toBytesSink);
        });
        it(name + " instances have toJSON", function () {
            assert(new Value().toJSON);
        });
        it(name + ".from(json).toJSON() == json", function () {
            var newJSON = new Value().toJSON();
            assert.deepEqual(Value.from(newJSON).toJSON(), newJSON);
        });
        describe(name + " supports all methods of the SerializedType mixin", function () {
            _.keys(SerializedType).forEach(function (k) {
                it("new " + name + ".prototype." + k + " !== undefined", function () {
                    assert.notEqual(Value.prototype[k], undefined);
                });
            });
        });
    });
});
//# sourceMappingURL=types-test.js.map