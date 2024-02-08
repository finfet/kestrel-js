import {describe, test, before } from "node:test";
import assert from "node:assert/strict";
import _sodium from "libsodium-wrappers-sumo";
import { scrypt } from "kestrel-web";

let sodium = null;

before(async () => {
    await _sodium.ready;
    sodium = _sodium;
});

test("scrypt", () => {
    const res = scrypt(sodium, "hackme");
    assert.equal(res, "3ebb9ac0d1da595f755407fe8fc246fe67fe6075730fc6e853351c2834bd6157");
});
