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
     * @returns {Uint8Array} The derived key
     */
    scrypt(password, salt, n, r, p, key_len) {
        let key = kcrypto.scrypt(password, salt, n, r, p, key_len);

        return key;
    }

    /**
     * SHA-256
     *
     * @param {Uint8Array} data Data to hash
     * @returns {Uint8Array} SHA-256 hash of the provided data
     */
    sha256(data) {
        let hash = kcrypto.sha256(data);
        return hash;
    }

    /**
     * ChaCha20-Poly1305 RFC 7539
     * @param {Uint8Array} key 32 byte ChaPoly key
     * @param {Uint8Array} nonce 12 byte nonce
     * @param {Uint8Array} plaintext Plaintext to encrypt
     * @param {Uint8Array} aad Addtional authenticated data
     * @returns {Uint8Array} Ciphertext
     */
    chapolyEncrypt(key, nonce, plaintext, aad) {
        let ciphertext = kcrypto.chapoly_encrypt_ietf(key, nonce, plaintext, aad);
        return ciphertext;
    }

    /**
     * ChaCha20-Poly1305 RFC 7539
     * @param {Uint8Array} key 32 byte ChaPoly key
     * @param {Uint8Array} nonce 12 byte nonce
     * @param {Uint8Array} ciphertext Ciphertext to decrypt
     * @param {Uint8Array} aad Addtional authenticated data
     * @returns {Uint8Array} Plaintext
     */
    chapolyDecrypt(key, nonce, ciphertext, aad) {
        let plaintext;
        try {
            plaintext = kcrypto.chapoly_decrypt_ietf(key, nonce, ciphertext, aad);
        } catch (wasmError) {
            let err = this.getError(wasmError);
            throw err;
        }

        return plaintext;
    }

    /**
     * Kestrel encryption using a key derived from a password
     * @param {Uint8Array} plaintext Plaintext to encrypt
     * @param {Uint8Array} password Password
     * @param {Uint8Array} salt 32 byte salt
     * @param {Number} file_format Password file format version. v1 is 0x20
     * @returns {Uint8Array} Ciphertext
     */
    passEncrypt(plaintext, password, salt, file_format = 0x20) {
        let ciphertext;
        try {
            ciphertext = kcrypto.pass_encrypt(plaintext, password, salt, file_format);
        } catch (wasmError) {
            let err = this.getError(wasmError);
            throw err;
        }
        return ciphertext;
    }

    /**
     * Kestrel decryption using a key derived from a password
     * @param {Uint8Array} ciphertext Ciphertext to decrypt
     * @param {Uint8Array} password Password
     * @param {Number} file_format Password file format version. v1 is 0x20
     * @returns {Uint8Array} Plaintext
     */
    passDecrypt(ciphertext, password, file_format = 0x20) {
        let plaintext;
        try {
            plaintext = kcrypto.pass_decrypt(ciphertext, password, file_format);
        } catch (wasmError) {
            let err = this.getError(wasmError);
            throw err;
        }
        return plaintext;
    }

    getError(wasmError) {
        let tokens = wasmError.split(";", 1);
        if (tokens.length != 2) {
            return new Error(wasmError.toString());
        } else {
            let [name, msg] = tokens;
            msg = msg.trim();
            let ex = new Error(msg);
            ex.name = name;
            return ex;
        }
    }
}
