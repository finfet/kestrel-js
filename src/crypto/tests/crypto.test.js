import { test, before } from "node:test";
import assert from "node:assert/strict";
import { Crypto, Utils, secureRandom } from "kestrel-crypto";

let crypto = null;

before(async () => {
    crypto = await Crypto.createInstance();
});

test("scrypt", () => {
    const passBytes = Utils.toUtf8Bytes("hackme");
    const saltBytes = Utils.toUtf8Bytes("yellowsubmarine.");
    const res = crypto.scrypt(passBytes, saltBytes, 32768, 8, 1, 32);
    assert.equal(Utils.toHex(res), "3ebb9ac0d1da595f755407fe8fc246fe67fe6075730fc6e853351c2834bd6157");
});

test("secureRandom", () => {
    const bytes = secureRandom(32);
    assert.equal(bytes.length, 32);
});
