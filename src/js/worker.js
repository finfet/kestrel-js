import { Crypto } from "./crypto/crypto";
import { to_hex } from "./crypto/utils";

let libsodium = null;

self.sodium = {
    onload: function(sodium) {
        libsodium = sodium;
        self.postMessage({ type: "init", result: true });
    }
}

self.importScripts("sodium.js");

self.onmessage = (e) => {
    let msgType = e.data.type;
    let args = e.data.args;

    try {
        switch (msgType) {
            case "scrypt":
                // runScrypt(args);
                throw new Error("scrypt failed.");
                break;
            default:
                break;
        }
    } catch (err) {
        self.postMessage({ type: "exception", result: err.toString() });
    }
}

function runScrypt(args) {
    let crypto = new Crypto(libsodium);
    let result = crypto.scrypt(args[0], "yellowsubmarine.", 32768, 8, 1, 32);
    let message = {
        result: to_hex(result),
        type: "scrypt"
    };
    self.postMessage(message);
}
