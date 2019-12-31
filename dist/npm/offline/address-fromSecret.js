"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import keypairs = require('keypairs')
var keypairs = require("../keypairs/distrib/npm");
function fromSecret(secret) {
    try {
        var keypair = keypairs.deriveKeypair(secret);
        var address = keypairs.deriveAddress(keypair.publicKey);
        return { secret: secret, address: address };
    }
    catch (error) {
        return null;
    }
}
exports.fromSecret = fromSecret;
;
//# sourceMappingURL=address-fromSecret.js.map