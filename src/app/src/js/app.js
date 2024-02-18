import { useState, useEffect } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

function DotLoader({ className }) {
    return (
        <div className={`dot-loader ${className}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}

function EncryptButton({ sendMessage }) {
    const [deriveKeyLoading, setDeriveKeyLoading] = useState(false);
    const [dkAnimStart, setDkAnimStart] = useState(false);
    const [dkAnimMet, setDkAnimMet] = useState(false);

    const [keyResult, setKeyResult] = useState("");
    const dkShowSpinner = deriveKeyLoading || (dkAnimStart && !dkAnimMet);

    function deriveKey() {
        setDeriveKeyLoading(true);
        setDkAnimStart(true);
        setDkAnimMet(false);
        setTimeout(() => {
            setDkAnimStart(false);
            setDkAnimMet(true);
        }, 200);
        sendMessage("scrypt", [toUtf8Bytes("hackme")], msg => {
            let key = msg.result;
            setDeriveKeyLoading(false);
            setKeyResult(key);
        });
    }

    if (dkShowSpinner) {
        return (
            <div>
                <button onClick={deriveKey} disabled>Encrypt</button>
                <DotLoader className={"ml-1"} />
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
    const [messageId, setMessageId] = useState(0);
    const [messageCallbacks, setMessageCallbacks] = useState(new Map());

    const [workerLoading, setWorkerLoading] = useState(true);
    const [animStart, setAnimStart] = useState(false);
    const [animMet, setAnimMet] = useState(false);

    const showSpinner = workerLoading || (animStart && !animMet);

    useEffect(() => {
        const worker = new Worker("worker.bundle.js", { type: "module" });
        worker.onmessage = e => {
            let msg = e.data;
            if (msg.type == "init") {
                setWorkerLoading(false);
            } else if (msg.type == "exception") {
                processError(msg);
            } else {
                let callback = messageCallbacks.get(msg.id);
                setMessageCallbacks(prev => prev.delete(msg.id));
                callback(msg);
            }
        }
        worker.onerror = e => {
            const msg = {
                id: 0,
                type: "exception",
                result: {
                    type: "worker-onerror", msg: "Worker communication failed."
                }
            };
            processError(msg);
        }
        setCryptoWorker(worker);
        setAnimStart(true);
        setTimeout(() => {
            setAnimMet(true);
            setAnimStart(false);
        }, 200);
        return () => {
            if (cryptoWorker) {
                cryptoWorker.terminate();
            }
        }
    }, []);

    function sendMessage(type, args, callback) {
        setHasError(null);
        const id = messageId + 1;
        const msg = {
            id: id,
            type: type,
            args: args
        };
        setMessageId(id);
        setMessageCallbacks(prev => prev.set(id, callback));
        cryptoWorker.postMessage(msg);
    }

    function processError(msg) {
        let result = msg.result;
        setHasError(result);
    }

    if (hasError) {
        return (
            <div>
                <h1>Kestrel</h1>
                <div><span className="error">Error:</span> {hasError.msg}</div>
            </div>
        )
    }

    if (showSpinner) {
        return (
            <div>
                <h1>Kestrel</h1>
                <DotLoader />
            </div>
        )
    }

    return (
        <div>
            <h1>Kestrel</h1>
            <EncryptButton
                sendMessage={sendMessage} />
            {hasError != null &&
                <div className="error">{hasError.msg}</div>
            }
        </div>
    )
}
