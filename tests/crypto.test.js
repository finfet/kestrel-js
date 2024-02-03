import test from "node:test";
import assert from "node:assert/strict";
import { scrypt } from "kestrel-web";

test("scrypt", (t) => {
    const res = scrypt("hackme");
    assert.equal(res, "74a6c88b287894c3230216b85705a7463612133dcf03739696be326e351d6e02");
})
