import { test, before } from "node:test";
import assert from "node:assert/strict";
import { Crypto } from "kestrel-crypto";
import { fromHex, toUtf8Bytes } from "kestrel-crypto/utils";
import { lockPrivateKey, unlockPrivateKey, encodePublicKey, decodePublicKey } from "kestrel-web/keyring";

let crypto = null;

before(async () => {
    crypto = await Crypto.createInstance();
});

test("lockPrivateKey", () => {
    const skBytes = fromHex("42d010ed1797fb3187351423f164caee1ce15eb5a462cf6194457b7a736938f5");
    const expectedLockedSk = "ZWdrMHMp/2yenV64rOfAJmMGWRVGbJuUAVhzOeRYRwNPqndu4Pfkg4YXzIna9Eg58JwreHA37o49xCS0x8CWd3yRe+D2ytRXFLb67WNIwxqHJ9Fw";
    const salt = fromHex("7329ff6c9e9d5eb8ace7c02663065915466c9b9401587339e45847034faa776e");
    const gotLockedKey = lockPrivateKey(crypto, skBytes, toUtf8Bytes("alice"), salt);

    assert.equal(gotLockedKey, expectedLockedSk);
});

test("unlockPrivateKey", () => {
    const goodSk = "ZWdrMPEp09tKN3rAutCDQTshrNqoh0MLPnEERRCm5KFxvXcTo+s/Sf2ze0fKebVsQilImvLzfIHRcJuX8kGetyAQL1VchvzHR28vFhdKeq+NY2KT";
    const shortSk = "ZWdrMPEtKN3rAutCDQTshrNqoh0MLPnEERRCm5KFxvXcTo+s/Sf2ze0fKebVsQilImvLzfIHRcJuX8kGetyAQL1VchvzHR28vFhdKeq+NY2KT";
    const modifiedSk = "ZWdrMPEp18tKN3rAutCDQTshrNqoh0MLPnEERRCm5KFxvXcTo+s/Sf2ze0fKebVsQilImvLzfIHRcJuX8kGetyAQL1VchvzHR28vFhdKeq+NY2KT";
    const unknownVersionSk = "ZWdrMfEp09tKN3rAutCDQTshrNqoh0MLPnEERRCm5KFxvXcTo+s/Sf2ze0fKebVsQilImvLzfIHRcJuX8kGetyAQL1VchvzHR28vFhdKeq+NY2KT";

    assert.doesNotThrow(() => unlockPrivateKey(crypto, goodSk, toUtf8Bytes("alice")));
    assert.throws(() => unlockPrivateKey(crypto, goodSk, toUtf8Bytes("badpass")), { name: "ChaPolyDecryptError" });
    assert.throws(() => unlockPrivateKey(crypto, shortSk, toUtf8Bytes("alice")), { name: "PrivateKeyLength" });
    assert.throws(() => unlockPrivateKey(crypto, modifiedSk, toUtf8Bytes("alice")), { name: "ChaPolyDecryptError" });
    assert.throws(() => unlockPrivateKey(crypto, unknownVersionSk, toUtf8Bytes("alice")), { name: "PrivateKeyFormat" });
});

test("encodePublicKey", () => {
    const pkBytes = fromHex("3ad53dc25581b18af543a1e8cf4edc2b4e4e483df5a7e0d5ada53e7e4bb86374");
    const expected = "OtU9wlWBsYr1Q6Hoz07cK05OSD31p+DVraU+fku4Y3R62CZl";
    const gotKey = encodePublicKey(crypto, pkBytes);

    assert.equal(gotKey, expected);
});

test("decodePublicKey", () => {
    const goodPublic = "OtU9wlWBsYr1Q6Hoz07cK05OSD31p+DVraU+fku4Y3R62CZl";
    assert.doesNotThrow(() => decodePublicKey(crypto, goodPublic));
    const badPublic = "PtU9wlWBsYr1Q6Hoz07cK05OSD31p+DVraU+fku4Y3R62CZl";
    assert.throws(() => decodePublicKey(crypto, badPublic), { name: "PublicKeyChecksum" });
});
