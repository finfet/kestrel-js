import { test, before } from "node:test";
import assert from "node:assert/strict";
import { Crypto } from "kestrel-crypto";
import { toHex, fromHex, toUtf8Bytes, fromUtf8Bytes } from "kestrel-crypto/utils";

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
    const bytes = crypto.secureRandom(32);
    assert.equal(bytes.length, 32);
});

test("x25519", () => {
    const alicePublic = fromHex("8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a");
    const alicePrivate = fromHex("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");
    const bobPublic = fromHex("de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f");
    const bobPrivate = fromHex("5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb");
    const expectedShared = fromHex("4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742");
    const aliceToBob = crypto.x25519(alicePrivate, bobPublic);
    const bobToAlice = crypto.x25519(bobPrivate, alicePublic);
    assert.deepEqual(aliceToBob, bobToAlice);
    assert.deepEqual(aliceToBob, expectedShared);
});

test("x25519DerivePublic", () => {
    const alicePublic = fromHex("8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a");
    const alicePrivate = fromHex("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");
    const derivedPublic = crypto.x25519DerivePublic(alicePrivate);
    assert.deepEqual(derivedPublic, alicePublic);
});

test("encoders", () => {
    const strInput = "hello";
    const bytes = toUtf8Bytes(strInput);
    assert.equal(bytes.length, 5);
    const hex = toHex(bytes);
    assert.equal(hex.length, 10);
    const gotBytes = fromHex(hex);
    assert.deepEqual(gotBytes, bytes);
    const strOut = fromUtf8Bytes(bytes);
    assert.equal(strOut, strInput);
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

function EncryptInput() {
    this.salt = fromHex("b3e94eb6bba5bc462aab92fd86eb9d9f939320a60ae46e690907918ef2ee3aec");
    this.pass = toUtf8Bytes("hackme");
    this.plaintext = toUtf8Bytes("Be sure to drink your Ovaltine");
}

test("passEncrypt", () => {
    const encryptInput = new EncryptInput();
    const expectedHash = fromHex("bef8d086931a2be31875839474b455fb6a9bfa0fbb6669dbeb8a86e51be0c9bd");
    const ciphertext = crypto.passEncrypt(encryptInput.plaintext, encryptInput.pass, encryptInput.salt);
    const gotHash = crypto.sha256(ciphertext);
    assert.equal(ciphertext.length, 98);
    assert.deepEqual(gotHash, expectedHash);
});

test("passDecrypt", () => {
    const encryptInput = new EncryptInput();
    const ciphertext = crypto.passEncrypt(encryptInput.plaintext, encryptInput.pass, encryptInput.salt);
    const plaintext = crypto.passDecrypt(ciphertext, encryptInput.pass);
    assert.deepEqual(plaintext, encryptInput.plaintext);
});
