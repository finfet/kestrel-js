import { test } from "node:test";
import assert from "node:assert/strict";
import {
    base64Encode, base64Decode, toHex,
    fromHex, toUtf8Bytes, fromUtf8Bytes,
    toBeBytes, fromBeBytes, toLeBytes, fromLeBytes, Vec
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

test("toBeBytes", () => {
    const expectedBytes = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const gotBytes = toBeBytes(0x01020304);
    assert.deepEqual(gotBytes, expectedBytes);

    const expectedBytes2 = new Uint8Array([0x00, 0x00, 0x01, 0x02]);
    const gotBytes2 = toBeBytes(258);
    assert.deepEqual(gotBytes2, expectedBytes2);

    const expectedBytes3 = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
    const gotBytes3 = toBeBytes(-1);
    assert.deepEqual(gotBytes3, expectedBytes3);

    const expectedBytes4 = new Uint8Array([0x00, 0x01, 0x00, 0x00]);
    const gotBytes4 = toBeBytes(65536);
    assert.deepEqual(gotBytes4, expectedBytes4);
});

test("fromBeBytes", () => {
    const input = new Uint8Array([0x00, 0x00, 0x01, 0x02]);
    const expectedNum = 258;
    const gotNum = fromBeBytes(input);
    assert.equal(gotNum, expectedNum);

    const input2 = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const expectedNum2 = 0x01020304;
    const gotNum2 = fromBeBytes(input2);
    assert.equal(gotNum2, expectedNum2);

    const input3 = new Uint8Array([0xff, 0xff, 0xff, 0xff]);
    const expectedNum3 = 4294967295;
    const gotNum3 = fromBeBytes(input3);
    assert.equal(gotNum3 >>> 0, expectedNum3);
});

test("toLeBytes", () => {
    const expectedBytes = new Uint8Array([0x02, 0x01, 0x00, 0x00]);
    const gotBytes = toLeBytes(258);
    assert.deepEqual(gotBytes, expectedBytes);
});

test("fromLeBytes", () => {
    const input = new Uint8Array([0x02, 0x01, 0x00, 0x00]);
    const expectedNum = 258;
    const gotNum = fromLeBytes(input);
    assert.equal(gotNum, expectedNum);
});

test("testVec", () => {
    const vec = new Vec(2);
    vec.push(0);
    vec.push(1);
    vec.push(2);
    vec.set(9, 2);
    const bytes = new Uint8Array([0x03, 0x04, 0x05]);
    vec.extend(bytes);
    const d = vec.toBytes();
    assert.equal(d[5], 0x05);
    assert.equal(d.length, 6);
});
