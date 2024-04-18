import { base64Encode, base64Decode } from "kestrel-crypto/utils";

const PRIVATE_KEY_VERSION = [0x65, 0x67, 0x6b, 0x30];
const TAG_LEN = 16;
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const PRIVATE_KEY_CT_LEN = 84;
const PUBLIC_KEY_ENCODED_LEN = 36;

export function unlockPrivateKey(crypto, b64PrivateKey, password) {
    let skBytes;
    try {
        skBytes = base64Decode(b64PrivateKey); 
    } catch {
        const err = new Error("base64 decode for private key failed");
        err.name = "PrivateKeyLength";
        throw err;
    }

    if (skBytes.length != PRIVATE_KEY_CT_LEN) {
        const err = new Error("Invalid private key length");
        err.name = "PrivateKeyLength";
        throw err;
    }

    const versionAad = skBytes.slice(0, 4);
    if (!compare(versionAad, PRIVATE_KEY_VERSION)) {
        const err = new Error("Invalid private key version");
        err.name = "PrivateKeyFormat";
        throw err;
    }

    const salt = skBytes.slice(4, 36);
    const ciphertext = skBytes.slice(36, 84);
    const key = crypto.scrypt(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, 32);
    // Contents are nonce are zeroed. Nonce is fixed at zero because the key
    // is different each time because of the scrypt salt.
    const nonce = new Uint8Array(12);
    const privateKey = crypto.chapolyDecrypt(key, nonce, ciphertext, versionAad);

    return privateKey;
}

export function lockPrivateKey(crypto, privateKey, password, salt) {
    const keyLen = PRIVATE_KEY_VERSION.length + salt.length + privateKey.length + TAG_LEN;
    const keyBytes = new Uint8Array(keyLen);
    keyBytes.set(PRIVATE_KEY_VERSION, 0);
    keyBytes.set(salt, PRIVATE_KEY_VERSION.length);

    // Contents are nonce are zeroed. Nonce is fixed at zero because the key
    // is different each time because of the scrypt salt.
    const nonce = new Uint8Array(12);
    const aad = new Uint8Array(PRIVATE_KEY_VERSION);
    const key = crypto.scrypt(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P, 32);

    const ciphertext = crypto.chapolyEncrypt(key, nonce, privateKey, aad);
    keyBytes.set(ciphertext, PRIVATE_KEY_VERSION.length + salt.length);

    const b64Key = base64Encode(keyBytes);
    return b64Key;
}

export function encodePublicKey(crypto, publicKey) {
    const hash = crypto.sha256(publicKey);
    const checksum = hash.slice(0, 4);
    const encoded = new Uint8Array(36);
    encoded.set(publicKey, 0);
    encoded.set(checksum, 32);
    const b64PublicKey = base64Encode(encoded);
    return b64PublicKey;
}

export function decodePublicKey(crypto, b64PublicKey) {
    let pkBytes;
    try {
        pkBytes = base64Decode(b64PublicKey);
    } catch {
        const err = new Error("base64 decode for public key failed");
        err.name = "PublicKeyLength";
        throw err;
    }

    if (pkBytes.length != PUBLIC_KEY_ENCODED_LEN) {
        const err = new Error("Invalid public key length");
        err.name = "PublicKeyLength";
        throw err;
    }

    const publicKey = pkBytes.slice(0, 32);
    const checksum = pkBytes.slice(32, 46);
    const hash = crypto.sha256(publicKey);
    const expectedChecksum = hash.slice(0, 4);
    if (!compare(checksum, expectedChecksum)) {
        const err = new Error("Public Key checksum failed. Public key may be corrupted.");
        err.name = "PublicKeyChecksum";
        throw err;
    }

    return new Uint8Array(publicKey);
}

function compare(a, b) {
    if (a.length != b.length) {
        return false;
    }

    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            diff++;
        }
    }

    return diff == 0;
}
