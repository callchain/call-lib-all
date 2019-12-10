// import keypairs = require('call-keypairs')
import keypairs = require('../../pack/call-keypairs')

function fromSecret(secret) {
    try {
        const keypair = keypairs.deriveKeypair(secret);
        const address = keypairs.deriveAddress(keypair.publicKey);
        return {secret: secret, address: address};
    } catch (error) {
        return null;
    }
};

export {
    fromSecret
}
