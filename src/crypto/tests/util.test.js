import { test } from "node:test";
import assert from "node:assert/strict";
import { base64Encode, base64Decode } from "kestrel-crypto/utils";

test("base64Encode", () => {
    const expected = "//79";
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd]);
    const b64 = base64Encode(bytes);
    assert.equal(b64, expected);
});

test("base64Decode", () => {
    const input = "//79";
    const expected = new Uint8Array([0xff, 0xfe, 0xfd]);
    const result = base64Decode(input);
    assert.deepEqual(result, expected);
});
