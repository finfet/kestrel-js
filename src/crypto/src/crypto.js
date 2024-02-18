import init, * as kcrypto from "./kestrel_wasm.js";
import kwasm from "./kestrel_wasm_bg.wasm";

export class Crypto {
    /**
     * Kestrel cryptographic functions
     * 
     * You must use createInstance()
     */
    constructor() {
    }

    /**
     * Create an instance of the Crypto class
     * @returns An instance of Crypto
     */
    static async createInstance() {
        await init(await kwasm());
        return new Crypto();
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
        let key = kcrypto.scrypt(password, salt, n, r, p, key_len);

        return key;
    }

    chapolyEncrypt(key, nonce, plaintext, aad) {
        let ciphertext = kcrypto.chapoly_encrypt_ietf(key, nonce, plaintext, aad);
        return ciphertext;
    }

    chapolyDecrypt(key, nonce, ciphertext, aad) {
        let plaintext;
        try {
            plaintext = kcrypto.chapoly_decrypt_ietf(key, nonce, ciphertext, aad);
        } catch (err) {
            throw new Error("Decrypt failed");
        }

        return plaintext;
    }
}
