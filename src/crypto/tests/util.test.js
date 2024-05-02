import { test } from "node:test";
import assert from "node:assert/strict";
import {
    base64Encode, base64Decode, toHex,
    fromHex, toUtf8Bytes, fromUtf8Bytes
} from "kestrel-crypto/utils";

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

test("toHex", () => {
    const expectedHex = "010203";
    const bytes = new Uint8Array([0x01, 0x02, 0x03]);
    const gotHex = toHex(bytes);
    assert.deepEqual(gotHex, expectedHex);
});

test("fromHex", () => {
    const expectedBytes = new Uint8Array([0x01, 0x02, 0x03]);
    const gotBytes = fromHex("010203");
    assert.deepEqual(gotBytes, expectedBytes);
});

test("toUtf8Bytes", () => {
    const expectedBytes = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    const gotBytes = toUtf8Bytes("hello");
    assert.deepEqual(gotBytes, expectedBytes);
});

test("fromUtf8Bytes", () => {
    const input = new Uint8Array([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
    const expected = "hello";
    const got = fromUtf8Bytes(input);
    assert.deepEqual(got, expected);
});
