"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var common_1 = require("../../common");
var flags = common_1.txFlags.TrustSet;
function parseFlag(flagsValue, trueValue, falseValue) {
    if (flagsValue & trueValue) {
        return true;
    }
    if (flagsValue & falseValue) {
        return false;
    }
    return undefined;
}
function parseFeeClaim(tx) {
    assert(tx.TransactionType === 'FeeClaim');
    return tx;
}
exports.default = parseFeeClaim;
//# sourceMappingURL=fee-claim.js.map