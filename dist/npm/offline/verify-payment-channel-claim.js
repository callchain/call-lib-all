"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import keypairs = require('keypairs')
var keypairs = require("../keypairs/distrib/npm");
// import binary = require('binary-codec')
var binary = require("../binary-codec/distrib/npm");
var common_1 = require("../common");
function verifyPaymentChannelClaim(channel, amount, signature, publicKey) {
    common_1.validate.verifyPaymentChannelClaim({ channel: channel, amount: amount, signature: signature, publicKey: publicKey });
    var signingData = binary.encodeForSigningClaim({
        channel: channel,
        amount: common_1.callToDrops(amount)
    });
    return keypairs.verify(signingData, signature, publicKey);
}
exports.default = verifyPaymentChannelClaim;
//# sourceMappingURL=verify-payment-channel-claim.js.map