import { useState, useEffect } from "react";

function EncryptButton({ deriveKey, keyResult }) {
    return (
        <div>
            <button onClick={deriveKey}>Encrypt</button>
            <span style={{paddingLeft: 0.5 + 'rem'}}>{keyResult}</span>
        </div>
    )
}

export default function App() {
    const [cryptoWorker, setCryptoWorker] = useState(null);
    const [workerLoaded, setWorkerLoaded] = useState(false);
    const [keyResult, setKeyResult] = useState("");
    const [hasError, setHasError] = useState(null);

    useEffect(() => {
        const worker = new Worker("worker.bundle.js");
        worker.onmessage = e => {
            let msg = e.data;
            if (msg.type == "init") {
                setWorkerLoaded(true);
            } else if (msg.type == "scrypt") {
                deriveKeyResult(msg.result);
            } else if (msg.type == "exception") {
                processError(msg);
            }
        }
        setCryptoWorker(worker);
        return () => {
            cryptoWorker.terminate();
        }
    }, []);

    function deriveKey() {
        setKeyResult("...");
        sendMessage("scrypt", ["hackme"]);
    }

    function deriveKeyResult(key) {
        setKeyResult(key);
    }

    function sendMessage(type, args) {
        setHasError(null);
        const msg = {
            type: type,
            args: args
        };
        cryptoWorker.postMessage(msg);
    }

    function processError(msg) {
        if (msg.msgType == "scrypt") {
            setKeyResult("");
        }
        setHasError({msgType: msg.msgType, msg: msg.msg});
    }

    if (!workerLoaded) {
        return <div>Initializing...</div>
    }

    return (
        <div>
            <h1>Kestrel</h1>
            <EncryptButton keyResult={keyResult} deriveKey={deriveKey} />
            {hasError != null &&
                <div class="error">{hasError.msg}</div>
            }
        </div>
    )
}
