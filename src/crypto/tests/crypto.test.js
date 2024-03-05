import { test, before } from "node:test";
import assert from "node:assert/strict";
import { Crypto } from "kestrel-crypto";
import { toHex, fromHex, toUtf8Bytes, secureRandom } from "kestrel-crypto/utils";

let crypto = null;

before(async () => {
    crypto = await Crypto.createInstance();
});

test("scrypt", () => {
    const passBytes = toUtf8Bytes("hackme");
    const saltBytes = toUtf8Bytes("yellowsubmarine.");
    const res = crypto.scrypt(passBytes, saltBytes, 32768, 8, 1, 32);
    assert.equal(toHex(res), "3ebb9ac0d1da595f755407fe8fc246fe67fe6075730fc6e853351c2834bd6157");
});

test("secureRandom", () => {
    const bytes = secureRandom(32);
    assert.equal(bytes.length, 32);
});

test("decrypt", () => {
    const plaintext = toUtf8Bytes("Hello, World!");
    const nonce = fromHex("b21237d55cce2711e789db3b");
    const aad = new Uint8Array(0);
    const key = fromHex("c962976520fdd153aaa18cc33e7a4b5b9ed80c863a20932aff22632973edf33c");
    const ciphertext = crypto.chapolyEncrypt(key, nonce, plaintext, aad);
    const plaintext2 = crypto.chapolyDecrypt(key, nonce, ciphertext, aad);

    assert.deepEqual(plaintext2, plaintext);
});

test("passEncrypt", () => {
    let salt = fromHex("b3e94eb6bba5bc462aab92fd86eb9d9f939320a60ae46e690907918ef2ee3aec");
    let pass = toUtf8Bytes("hackme");
    let plaintext = toUtf8Bytes("Be sure to drink your Ovaltine");
    let expectedHash = fromHex("bef8d086931a2be31875839474b455fb6a9bfa0fbb6669dbeb8a86e51be0c9bd");
    let ciphertext = crypto.passEncrypt(plaintext, pass, salt);
    let gotHash = crypto.sha256(ciphertext);
    assert.equal(ciphertext.length, 98);
    assert.deepEqual(gotHash, expectedHash);
});
