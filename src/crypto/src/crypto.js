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
        if (typeof(password) == String) {
            password = new TextEncoder().encode(password);
        }

        if (typeof(salt) == String) {
            salt = new TextEncoder().encode(salt);
        }

        let key = kcrypto.scrypt(password, salt, n, r, p, key_len);

        return key;
    }
}

export function secureRandom(len) {
    const randBytes = new Uint8Array(len);
    globalThis.crypto.getRandomValues(randBytes);
    return randBytes;
}

export class Utils {
    constructor() {
    }

    static toHex(bytes) {
        let hex = "";
        for (let byte of bytes) {
            hex += byte.toString(16).padStart(2, "0");
        }
    
        return hex;
    }

    static fromHex(hex) {
        if (hex.length % 2 !== 0) {
            throw new Error("hex string is not a multiple of 2");
        }
        const numBytes = hex.length / 2;
        const bytes = new Uint8Array(numBytes);
        for (let i = 0; i < numBytes; i++) {
            bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }

        return uint8Array;
    }

    static toUtf8Bytes(str) {
        let utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charcode = str.charCodeAt(i);
            if (charcode < 0x80) {
                utf8.push(charcode);
            } else if (charcode < 0x800) {
                utf8.push(
                    0xc0 | (charcode >> 6),
                    0x80 | (charcode & 0x3f)
                );
            } else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(
                    0xe0 | (charcode >> 12),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f)
                );
            } else { // surrogate pair
                i++;
                // UTF-16 encodes 0x10000-0x10FFFF by
                // subtracting 0x10000 and splitting the
                // 20 bits of 0x0-0xFFFFF into two halves
                charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                    | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >>18),
                    0x80 | ((charcode>>12) & 0x3f),
                    0x80 | ((charcode>>6) & 0x3f),
                    0x80 | (charcode & 0x3f)
                );
            }
        }
        return new Uint8Array(utf8);
    }
}
