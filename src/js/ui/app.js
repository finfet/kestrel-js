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
    const [hasError, setHasError] = useState(null);

    const [workerLoading, setWorkerLoading] = useState(true);
    const [minAnim, setMinAnim] = useState(false);

    const [keyResult, setKeyResult] = useState("");

    useEffect(() => {
        const worker = new Worker("worker.bundle.js");
        worker.onmessage = e => {
            let msg = e.data;
            if (msg.type == "init") {
                setWorkerLoading(false);
            } else if (msg.type == "scrypt") {
                deriveKeyResult(msg.result);
            } else if (msg.type == "exception") {
                processError(msg);
            }
        }
        setCryptoWorker(worker);
        setTimeout(() => {
            setMinAnim(true);
        }, 1000);
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

    if (workerLoading || !minAnim) {
        return (
            <div>
                <h1>Kestrel</h1>
                <div>Loading...</div>
            </div>
        )
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
