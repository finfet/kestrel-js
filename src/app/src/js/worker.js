import { Crypto } from "kestrel-crypto";
import { secureRandom, toHex } from "kestrel-crypto/utils";


let crypto = null;

function start() {
    Crypto.createInstance().then((c) => {
        crypto = c;
        self.postMessage({ action: "init", result: true });
    });
}

self.onmessage = (e) => {
    const msg = e.data;
    try {
        switch (msg.action) {
            case "pass_encrypt":
                passEncrypt(msg);
                break;
            default:
                self.postMessage({ action: "exception", result: { type: "unknown_action", msg: "Cannot take unknown action" }})
                break;
        }
    } catch (err) {
        self.postMessage({ action: "exception", result: { type: msg.action, msg: err.toString() } });
    }
}

async function passEncrypt(msg) {
    const inputFile = msg.args[0];
    const filename = `${inputFile.name}.ktl`;
    const password = msg.args[1];
    const salt = secureRandom(32);
    const buffer = await inputFile.arrayBuffer();
    const plaintext = new Uint8Array(buffer);

    const ciphertext = crypto.passEncrypt(plaintext, password, salt);
    const blob = new Blob([ciphertext], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const message  = {
        action: msg.action,
        result: { url: url, filename: filename }
    };
    self.postMessage(message);
}

start();
