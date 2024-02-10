import { Crypto } from "./crypto/crypto";
import { to_hex } from "./crypto/utils";

self.importScripts("sodium.js");

let crypto = null;

Crypto.createInstance(sodium).then((c) => {
    crypto = c;
    self.postMessage({ type: "init", result: true });
});

self.onmessage = (e) => {
    let msgType = e.data.type;
    let args = e.data.args;

    try {
        switch (msgType) {
            case "scrypt":
                runScrypt(args);
                break;
            default:
                break;
        }
    } catch (err) {
        self.postMessage({ type: "exception", msgType: msgType, msg: err.toString() });
    }
}

function runScrypt(args) {
    let result = crypto.scrypt(args[0], "yellowsubmarine.", 32768, 8, 1, 32);
    let message = {
        result: to_hex(result),
        type: "scrypt"
    };
    self.postMessage(message);
}
