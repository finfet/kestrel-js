import { useState, useEffect } from "react";

function EncryptButton({ deriveKey, keyResult, dkShowSpinner }) {
    if (dkShowSpinner) {
        return (
            <div>
                <button onClick={deriveKey} disabled>Encrypt</button>
                <div className="spin-loader"></div>
            </div>
        )
    }
    return (
        <div>
            <button onClick={deriveKey}>Encrypt</button>
            <span style={{paddingLeft: 0.5 + "rem"}}>{keyResult}</span>
        </div>
    )
}

export default function App() {
    const [cryptoWorker, setCryptoWorker] = useState(null);
    const [hasError, setHasError] = useState(null);

    const [workerLoading, setWorkerLoading] = useState(true);
    const [animStart, setAnimStart] = useState(false);
    const [animMet, setAnimMet] = useState(false);

    const [deriveKeyLoading, setDeriveKeyLoading] = useState(false);
    const [dkAnimStart, setDkAnimStart] = useState(false);
    const [dkAnimMet, setDkAnimMet] = useState(false);

    const [keyResult, setKeyResult] = useState("");

    const showSpinner = workerLoading || (animStart && !animMet);
    const dkShowSpinner = deriveKeyLoading || (dkAnimStart && !dkAnimMet);

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
        worker.onerror = e => {
            processError({msgType: "exception", msg: "Worker communication failed."});
        }
        setCryptoWorker(worker);
        setAnimStart(true);
        setTimeout(() => {
            setAnimMet(true);
            setAnimStart(false);
        }, 1000);
        return () => {
            cryptoWorker.terminate();
        }
    }, []);

    function deriveKey() {
        setDeriveKeyLoading(true);
        setDkAnimStart(true);
        setDkAnimMet(false);
        setTimeout(() => {
            setDkAnimStart(false);
            setDkAnimMet(true);
        }, 1000);
        sendMessage("scrypt", ["hackme"]);
    }

    function deriveKeyResult(key) {
        setDeriveKeyLoading(false);
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

    if (hasError) {
        return (
            <div>
                <h1>Kestrel</h1>
                <div className="error">Error: {hasError.msg}</div>
            </div>
        )
    }

    if (showSpinner) {
        return (
            <div>
                <h1>Kestrel</h1>
                <div className="bounce-loader">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1>Kestrel</h1>
            <EncryptButton
                keyResult={keyResult}
                deriveKey={deriveKey}
                dkShowSpinner={dkShowSpinner} />
            {hasError != null &&
                <div className="error">{hasError.msg}</div>
            }
        </div>
    )
}
