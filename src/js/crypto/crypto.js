export class Crypto {
    /**
     * Kestrel cryptographic functions
     * 
     * @param {Object} sodium An already-initialized libsodium.js object
     */
    constructor(sodium) {
        this.sodium = sodium;
    }

    /**
     * Create an instance of the Crypto class
     * @param {Object} sodium A libsodium.js object. Can be init or uninit
     * @returns An instance of Crypto
     */
    static async createInstance(sodium) {
        await sodium.ready;
        return new Crypto(sodium);
    }

    /**
     * Scrypt RFC 7914
     * 
     * @param {Uint8Array} password Strings will be converted to utf-8
     * @param {Uint8Array} salt Strings will be converted to utf-8
     * @param {Number} n scrypt N (rec. 32768)
     * @param {Number} r scrypt r (rec. 8)
     * @param {Number} p scrypt p (rec. 1)
     * @param {Number} key_len Key length (rec. 32)
     * @return {Uint8Array} The derived key
     */
    scrypt(password, salt, n, r, p, key_len) {
        if (typeof(password) == String) {
            password = new TextEncoder().encode(password);
        }

        if (typeof(salt) == String) {
            salt = new TextEncoder().encode(salt);
        }

        let key = this.sodium.crypto_pwhash_scryptsalsa208sha256_ll(
            password, salt, n, r, p, key_len
        );

        return key;
    }

    secure_random(len) {
        let randBytes = this.sodium.randombytes_buf(len);
        return randBytes;
    }
}
