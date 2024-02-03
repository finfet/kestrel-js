import { useState, useEffect } from "react";

function EncryptButton({ cryptoWorker }) {
    const [result, setResult] = useState("");
    let loaded = false;

    useEffect(() => {
        cryptoWorker.onmessage = e => {
            const msgType = e.data.type;
            const result = e.data.result;
            if (msgType == "scrypt") {
                deriveKeyResult(result);
            }
        }
        loaded = true;
    }, []);

    function deriveKey() {
        setResult("Loading...");
        if (loaded) {
            const message = {
                type: "scrypt",
                args: ["hackme"],
            };
            cryptoWorker.postMessage(message);
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
