import { useState, useEffect } from "react";

function EncryptButton({ cryptoWorker }) {
    const [result, setResult] = useState("");
    const [workerLoaded, setWorkerLoaded] = useState(false);

    useEffect(() => {
        cryptoWorker.onmessage = e => {
            const msgType = e.data.type;
            const result = e.data.result;
            if (msgType == "scrypt") {
                deriveKeyResult(result);
            }
        }
        setWorkerLoaded(true);
    }, []);

    function deriveKey() {
        setResult("Loading...");
        const message = {
            type: "scrypt",
            args: ["hackme"],
        };
        sendMessage(message);
    }

    function sendMessage(msg) {
        if (workerLoaded) {
            cryptoWorker.postMessage(msg);
        }
    }

    function deriveKeyResult(keyData) {
        setResult(keyData);
    }

    return (
        <div>
            <button onClick={deriveKey}>Encrypt</button>
            <span style={{paddingLeft: 0.5 + 'rem'}}>{result}</span>
        </div>
    )
}

export default function App() {
    const [cryptoWorker, setCryptoWorker] = useState(null);

    useEffect(() => {
        const worker = new Worker("worker.bundle.js");
        setCryptoWorker(worker);
        return () => {
            cryptoWorker.terminate();
        }
    }, []);

    if (!cryptoWorker) {
        return <div>Initializing...</div>
    }

    return (
        <div>
            <h1>Kestrel</h1>
            <EncryptButton cryptoWorker={cryptoWorker} />
        </div>
    )
}
