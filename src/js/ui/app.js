import { useState, useEffect } from "react";

function EncryptButton({ cryptoWorker }) {
    const [result, setResult] = useState("");
    const [workerLoaded, setWorkerLoaded] = useState(false);

    useEffect(() => {
        cryptoWorker.onmessage = e => {
            const msg = e.data;
            if (msg.type == "scrypt") {
                deriveKeyResult(msg.result);
            } else if (msg.type == "ack") {
                setWorkerLoaded(true);
            }
        }
        sendMessage("syn", []);
    }, []);

    function deriveKey() {
        setResult("Calculating...");
        sendMessage("scrypt", ["hackme"]);
    }

    function sendMessage(type, args) {
        const msg = {
            type: type,
            args: args
        }
        cryptoWorker.postMessage(msg);
    }

    function deriveKeyResult(keyData) {
        setResult(keyData);
    }

    if (!workerLoaded) {
        return <button disabled>Encrypt</button>
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
        const worker = new Worker("worker.bundle.js", { type: "module" });
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
