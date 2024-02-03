import { scrypt } from "./crypto"

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
    let result = scrypt(args[0]);
    let message = {
        result: result,
        type: msgType
    };
    self.postMessage(message);
}
