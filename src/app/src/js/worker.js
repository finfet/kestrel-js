import { Crypto } from "kestrel-crypto";

const workerMsgActions = {
    passEncrypt: "pass_encrypt",
    passDecrypt: "pass_decrypt",
    generateKey: "generate_key"
}

self.onmessage = (e) => {
    const msg = e.data;
    try {
        switch (msg.action) {
            case workerMsgActions.passEncrypt:
                passEncrypt(msg.args[0], msg.args[1]);
                break;
            case workerMsgActions.passDecrypt:
                passDecrypt(msg.args[0], msg.args[1]);
                break;
            case workerMsgActions.generateKey:
                generateKey(msg.args[0]);
                break;
            default:
                self.postMessage({ action: "exception", result: { type: "unknown_action", msg: "Cannot take unknown action" }})
                break;
        }
    } catch (err) {
        self.postMessage({ action: "exception", result: { type: msg.action, msg: err.toString() } });
    }
}

async function passEncrypt(inputFile, password) {
    const crypto = await Crypto.createInstance();
    const filename = `${inputFile.name}.ktl`;
    const salt = crypto.secureRandom(32);
    const buffer = await inputFile.arrayBuffer();
    const plaintext = new Uint8Array(buffer);

    const ciphertext = crypto.passEncrypt(plaintext, password, salt);
    const blob = new Blob([ciphertext], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const message = {
        action: workerMsgActions.passEncrypt,
        result: { url: url, filename: filename }
    };
    self.postMessage(message);
}

async function passDecrypt(inputFile, password) {
    const crypto = await Crypto.createInstance();
    const filename = stripExtension(inputFile.name);
    const buffer = await inputFile.arrayBuffer();
    const ciphertext = new Uint8Array(buffer);

    try {
        const plaintext = crypto.passDecrypt(ciphertext, password);
        const blob = new Blob([plaintext], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const message = {
            action: workerMsgActions.passDecrypt,
            result: { url: url, filename: filename }
        };
        self.postMessage(message);
    } catch (err) {
        const message = {
            action: workerMsgActions.passDecrypt,
            result: { exception: { name: err.name, message: err.message } }
        };
        self.postMessage(message);
    }
}

async function generateKey(password) {
    const crypto = await Crypto.createInstance();
    const publicKey = "JHXzGZWRb7PlpmCdulRE4vOEmynQDZOsRSF5nNXjvR7qPiMG";
    const privateKey = "ZWdrMLOAK6E7V6ntiYlUt8dqb1l5jeSPZoSH2h6xwXadmLQ4t0BKvhG7qpb8YJxBdIYrMvc7TA7/p1LZeWBNXUWixV9w/CZryk7z0/+t+Fj07qPI";
    const message = {
        action: workerMsgActions.generateKey,
        result: { publicKey: publicKey, privateKey: privateKey }
    };

    self.postMessage(message);
}

function stripExtension(filename) {
    if (filename.endsWith(".ktl")) {
        return filename.slice(0, filename.length - 4);
    } else {
        return filename;
    }
}

self.postMessage({ action: "init", result: true });
