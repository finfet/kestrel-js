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
    const msg = e.data;
    try {
        switch (msg.type) {
            case "scrypt":
                runScrypt(msg);
                break;
            default:
                break;
        }
    } catch (err) {
        self.postMessage({ id: msg.id, type: "exception", result: { type: msg.type, msg: err.toString() }});
    }
}

function runScrypt(msg) {
    let result = crypto.scrypt(msg.args[0], toUtf8Bytes("yellowsubmarine."), 32768, 8, 1, 32);
    let message = {
        id: msg.id,
        type: "scrypt",
        name: msg.name,
        result: toHex(result),
    };
    self.postMessage(message);
}

start();
