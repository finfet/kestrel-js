import { useState, useEffect, useMemo } from "react";

function EncryptButton({ cryptoWorker }) {
    const [result, setResult] = useState("");

    useEffect(() => {
        cryptoWorker.onmessage = (e) => {
            const msgType = e.data.type;
            const result = e.data.result;
            if (msgType == "scrypt") {
                deriveKeyResult(result);
            }
        }
    }, [cryptoWorker]);

    function deriveKey() {
        setResult("Loading...");
        const message = {
            type: "scrypt",
            args: ["hackme"],
        };
        cryptoWorker.postMessage(message);
    }

    function deriveKeyResult(keyData) {
        setResult(keyData);
    }

    return (
        <div>
            <button onClick={() => deriveKey()}>Encrypt</button>
            <span style={{paddingLeft: 0.5 + 'rem'}}>{result}</span>
        </div>
    )
}

export default function App() {
    const cryptoWorker = useMemo(() => new Worker("worker.bundle.js"), []);

    return (
        <div>
            <h1>Kestrel</h1>
            <EncryptButton cryptoWorker={cryptoWorker} />
        </div>
    )
}
