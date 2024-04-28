import { Crypto } from "kestrel-crypto";
import { lockPrivateKey, unlockPrivateKey, encodePublicKey, decodePublicKey } from "./keyring.js";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const workerMsgActions = {
    passEncrypt: "pass_encrypt",
    passDecrypt: "pass_decrypt",
    keyEncrypt: "key_encrypt",
    keyDecrypt: "key_decrypt",
    generateKey: "generate_key",
    extractKey: "extract_key",
    changePass: "change_pass"
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
            case workerMsgActions.keyEncrypt:
                keyEncrypt(msg.args[0], msg.args[1], msg.args[2], msg.args[3]);
                break;
            case workerMsgActions.keyDecrypt:
                keyDecrypt(msg.args[0], msg.args[1], msg.args[2]);
                break;
            case workerMsgActions.generateKey:
                generateKey(msg.args[0]);
                break;
            case workerMsgActions.extractKey:
                extractKey(msg.args[0], msg.args[1]);
                break;
            case workerMsgActions.changePass:
                changePass(msg.args[0], msg.args[1], msg.args[2]);
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

function attemptUnlock(crypto, b64PriavateKey, password, action) {
    let privateKey = null;
    try {
        privateKey = unlockPrivateKey(crypto, b64PriavateKey, password);
    } catch (err) {
        if (err.name == "PrivateKeyFormat" || err.name == "PrivateKeyLength") {
            let ex = new Error(`Failed to unlock key: ${err.message}`);
            ex.name = "KeyUnlockError";
            const message = {
                action: action,
                result: { exception: { name: ex.name, message: ex.message }}
            };
            return {
                privateKey: null,
                exception: message
            };
        } else {
            let ex = new Error("Failed to unlock key. Check password used.");
            ex.name = "KeyUnlockError";
            const message = {
                action: action,
                result: { exception: { name: ex.name, message: ex.message }}
            };
            return {
                privateKey: null,
                exception: message
            };
        }
    }

    return {
        privateKey: privateKey,
        exception: null
    };
}

async function keyEncrypt(inputFile, b64SenderPrivate, senderPass, b64RecipientPublic) {
    const crypto = await Crypto.createInstance();
    const filename = `${inputFile.name}.ktl`;
    const buffer = await inputFile.arrayBuffer();
    const plaintext = new Uint8Array(buffer);

    const unlockAttempt = attemptUnlock(crypto, b64SenderPrivate, senderPass, workerMsgActions.keyEncrypt);
    if (unlockAttempt.exception) {
        self.postMessage(unlockAttempt.exception);
        return;
    }
    const senderPrivate = unlockAttempt.privateKey;

    try {
        const recipientPublic = decodePublicKey(crypto, b64RecipientPublic);
        const ciphertext = crypto.keyEncrypt(plaintext, senderPrivate, recipientPublic);
        const blob = new Blob([ciphertext], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const message = {
            action: workerMsgActions.keyEncrypt,
            result: { url: url, filename: filename }
        };
        self.postMessage(message);
    } catch (err) {
        const message = {
            action: workerMsgActions.keyEncrypt,
            result: { exception: { name: err.name, message: err.message } }
        };
        self.postMessage(message);
    }
}

async function keyDecrypt(inputFile, b64RecipientPrivate, recipientPass) {
    const crypto = await Crypto.createInstance();
    const filename = stripExtension(inputFile.name);
    const buffer = await inputFile.arrayBuffer();
    const ciphertext = new Uint8Array(buffer);

    const unlockAttempt = attemptUnlock(crypto, b64RecipientPrivate, recipientPass, workerMsgActions.keyDecrypt);
    if (unlockAttempt.exception) {
        self.postMessage(unlockAttempt.exception);
        return;
    }

    const recipientPrivate = unlockAttempt.privateKey;

    try {
        const { plaintext, publicKey } = crypto.keyDecrypt(ciphertext, recipientPrivate);
        const b64SenderPublic = encodePublicKey(crypto, publicKey);
        const blob = new Blob([plaintext], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const message = {
            action: workerMsgActions.keyDecrypt,
            result: { url: url, filename: filename, publicKey: b64SenderPublic }
        };
        self.postMessage(message);
    } catch (err) {
        const message = {
            action: workerMsgActions.keyDecrypt,
            result: { exception: { name: err.name, message: err.message }}
        };
        self.postMessage(message);
    }
}

async function generateKey(password) {
    const crypto = await Crypto.createInstance();

    const privateKey = crypto.secureRandom(32);
    const publicKey = crypto.x25519DerivePublic(privateKey);
    const salt = crypto.secureRandom(32);
    const b64PrivateKey = lockPrivateKey(crypto, privateKey, password, salt);
    const b64PublicKey = encodePublicKey(crypto, publicKey);

    const message = {
        action: workerMsgActions.generateKey,
        result: { publicKey: b64PublicKey, privateKey: b64PrivateKey }
    };

    self.postMessage(message);
}

async function extractKey(b64PrivateKey, password) {
    const crypto = await Crypto.createInstance();
    try {
        const privateKey = unlockPrivateKey(crypto, b64PrivateKey, password);
        const publicKey = crypto.x25519DerivePublic(privateKey);
        const b64PublicKey = encodePublicKey(crypto, publicKey);

        const message = {
            action: workerMsgActions.extractKey,
            result: { publicKey: b64PublicKey }
        }

        self.postMessage(message);
    } catch (err) {
        const message = {
            action: workerMsgActions.extractKey,
            result: { exception: { name: err.name, message: err.message }}
        };
        self.postMessage(message);
    }
}

async function changePass(b64PrivateKey, oldPassword, newPassword) {
    const crypto = await Crypto.createInstance();
    try {
        const privateKey = unlockPrivateKey(crypto, b64PrivateKey, oldPassword);
        const salt = crypto.secureRandom(32);
        const updatedB64PrivateKey = lockPrivateKey(crypto, privateKey, newPassword, salt);

        const message = {
            action: workerMsgActions.changePass,
            result: { privateKey: updatedB64PrivateKey }
        }

        self.postMessage(message);
    } catch (err) {
        const message = {
            action: workerMsgActions.changePass,
            result: { exception: { name: err.name, message: err.message }}
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
