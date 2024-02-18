import { Crypto } from "kestrel-crypto";
import { toUtf8Bytes, toHex } from "kestrel-crypto/utils";


let crypto = null;

function start() {
    Crypto.createInstance().then((c) => {
        crypto = c;
        self.postMessage({ type: "init", result: true });
    });
}

self.onmessage = (e) => {
    let msgId = e.data.id;
    let msgType = e.data.type;
    let args = e.data.args;

    try {
        switch (msgType) {
            case "scrypt":
                runScrypt(msgId, args);
                break;
            default:
                break;
        }
    } catch (err) {
        self.postMessage({ id: e.data.id, type: "exception", result: { type: msgType, msg: err.toString() }});
    }
}

function runScrypt(msgId, args) {
    let result = crypto.scrypt(args[0], toUtf8Bytes("yellowsubmarine."), 32768, 8, 1, 32);
    let message = {
        id: msgId,
        type: "scrypt",
        result: toHex(result),
    };
    self.postMessage(message);
}

start();
