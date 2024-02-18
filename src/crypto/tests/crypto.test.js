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
