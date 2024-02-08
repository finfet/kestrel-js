export function scrypt(sodium, password) {
    console.assert(sodium != null);
    const passBytes = new TextEncoder().encode(password);
    const saltBytes = new TextEncoder().encode("yellowsubmarine.");
    const n = 32768;
    const r = 8;
    const p = 1;

    let key = sodium.crypto_pwhash_scryptsalsa208sha256_ll(
        passBytes, saltBytes, n, r, p, 32
    );

    return sodium.to_hex(key);
}
