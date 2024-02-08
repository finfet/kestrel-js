import { scrypt } from "./crypto";

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

    switch (msgType) {
        case "scrypt":
            runScrypt(msgType, args);
            break;
        default:
            break;
    }
}

function runScrypt(msgType, args) {
    let result = scrypt(libsodium, args[0]);
    let message = {
        result: result,
        type: msgType
    };
    self.postMessage(message);
}
