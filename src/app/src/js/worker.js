import { Crypto } from "kestrel-crypto";
import { secureRandom } from "kestrel-crypto/utils";

self.onmessage = (e) => {
    const msg = e.data;
    try {
        switch (msg.action) {
            case "pass_encrypt":
                passEncrypt(msg);
                break;
            case "pass_decrypt":
                passDecrypt(msg);
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
    const crypto = await Crypto.createInstance();
    const inputFile = msg.args[0];
    const filename = `${inputFile.name}.ktl`;
    const password = msg.args[1];
    const salt = secureRandom(32);
    const buffer = await inputFile.arrayBuffer();
    const plaintext = new Uint8Array(buffer);

    const ciphertext = crypto.passEncrypt(plaintext, password, salt);
    const blob = new Blob([ciphertext], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const message = {
        action: msg.action,
        result: { url: url, filename: filename }
    };
    self.postMessage(message);
}

async function passDecrypt(msg) {
    const crypto = await Crypto.createInstance();
    const inputFile = msg.args[0];
    const filename = stripExtension(inputFile.name);
    const password = msg.args[1];
    const buffer = await inputFile.arrayBuffer();
    const ciphertext = new Uint8Array(buffer);

    try {
        const plaintext = crypto.passDecrypt(ciphertext, password);
        const blob = new Blob([plaintext], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const message = {
            action: msg.action,
            result: { url: url, filename: filename }
        };
        self.postMessage(message);
    } catch (err) {
        const message = {
            action: msg.action,
            result: { exception: { name: err.name, message: err.message } }
        };
        self.postMessage(message);
    }
}

function stripExtension(filename) {
    if (filename.endsWith(".ktl")) {
        return filename.slice(0, filename.length - 4);
    } else {
        return filename;
    }
}

self.postMessage({ action: "init", result: true });
