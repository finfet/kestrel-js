import test from "node:test";
import assert from "node:assert/strict";
import { scrypt } from "kestrel-web";

test("scrypt", (t) => {
    const res = scrypt("hackme");
    assert.equal(res, "3ebb9ac0d1da595f755407fe8fc246fe67fe6075730fc6e853351c2834bd6157");
})
