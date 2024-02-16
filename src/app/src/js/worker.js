import { Crypto, Utils } from "kestrel-crypto";


let crypto = null;

function start() {
    Crypto.createInstance().then((c) => {
        crypto = c;
        self.postMessage({ type: "init", result: true });
    });
}

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
    let result = crypto.scrypt(Utils.toUtf8Bytes(args[0]), Utils.toUtf8Bytes("yellowsubmarine."), 32768, 8, 1, 32);
    let message = {
        result: Utils.toHex(result),
        type: "scrypt"
    };
    self.postMessage(message);
}

start();
