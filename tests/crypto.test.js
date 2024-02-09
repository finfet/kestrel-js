import { test, before } from "node:test";
import assert from "node:assert/strict";
import _sodium from "libsodium-wrappers-sumo";
import { Crypto, secure_random } from "kestrel-web";
import { to_hex } from "kestrel-web/utils";

let sodium = null;

before(async () => {
    await _sodium.ready;
    sodium = _sodium;
});

test("scrypt", () => {
    const crypto = new Crypto(sodium);
    const res = crypto.scrypt("hackme", "yellowsubmarine.", 32768, 8, 1, 32);
    assert.equal(to_hex(res), "3ebb9ac0d1da595f755407fe8fc246fe67fe6075730fc6e853351c2834bd6157");
});

test("secure_random", () => {
    const bytes = secure_random(32);
    assert.equal(bytes.length, 32);
});
