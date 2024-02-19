import { useState, useEffect, useReducer } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const ANIMATION_DURATION = 200;

const WORKER_MSG_STATES = {
    encryptButtonDeriveKey: "encrypt_button_derive_key"
}

const NAV_STATES = {
    encrypt: 0,
    decrypt: 1,
    contacts: 2,
    encryptKey: 3,
    encryptPassword: 4,
}

function DotLoader({ classes }) {
    return (
        <div className={`dot-loader ${classes}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}

function NavBar({ encryptClick, decryptClick, contactsClick, active }) {
    return (
        <div className="mt-3 pb-3">
            <button onClick={encryptClick} className={"nav-button " + (active == NAV_STATES.encrypt ? "nav-button-active" : "")}>Encrypt</button>
            <button onClick={decryptClick} className={"nav-button " + (active == NAV_STATES.decrypt ? "nav-button-active" : "")}>Decrypt</button>
            <button onClick={contactsClick} className={"nav-button nav-button-end " + (active == NAV_STATES.contacts ? "nav-button-active" : "")}>Contacts</button>
        </div>
    )
}

function DecryptPage() {
    return (
        <div>Decrypt</div>
    )
}

function ContactsPage() {
    return (
        <div>Contacts</div>
    )
}

function EncryptPage({ sendMessage, msgId, keyResult, keyLoading }) {
    const [dkAnimStart, setDkAnimStart] = useState(false);
    const [dkAnimMet, setDkAnimMet] = useState(false);

    const dkShowSpinner = keyLoading || (dkAnimStart && !dkAnimMet);

    function deriveKey() {
        setDkAnimStart(true);
        setDkAnimMet(false);
        setTimeout(() => {
            setDkAnimStart(false);
            setDkAnimMet(true);
        }, ANIMATION_DURATION);
        sendMessage(msgId, "scrypt", WORKER_MSG_STATES.encryptButtonDeriveKey, [toUtf8Bytes("hackme")]);
    }

    if (dkShowSpinner) {
        return (
            <div>
                <button onClick={deriveKey} disabled>Encrypt</button>
                <DotLoader classes={"ml-1"} />
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

function workerReducer(state, action) {
    if (action.action == "send" && action.msg.name == WORKER_MSG_STATES.encryptButtonDeriveKey) {
        return {
            ...state,
            encryptButtonDeriveKey: {
                ...state.encryptButtonDeriveKey,
                loading: true
            }
        };
    } else if (action.action == "recv" && action.msg.name == WORKER_MSG_STATES.encryptButtonDeriveKey) {
        return {
            ...state,
            encryptButtonDeriveKey: {
                result: action.msg.result,
                loading: false
            }
        };
    } else {
        throw new Error("Unsupported crypto worker state action");
    }
}

export default function App() {

    const [cryptoWorker, setCryptoWorker] = useState(null);
    const [workerResults, dispatch] = useReducer(workerReducer, {
        encryptButtonDeriveKey: {
            result: "",
            loading: false
        }
    });
    const [navState, setNavState] = useState(NAV_STATES.encrypt);
    const [hasError, setHasError] = useState(null);

    const [workerLoading, setWorkerLoading] = useState(true);
    const [animStart, setAnimStart] = useState(false);
    const [animMet, setAnimMet] = useState(false);
    const [messageId, setMessageId] = useState(0);

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
                dispatch({ action: "recv", msg: msg });
            }
        }
        worker.onerror = (_e) => {
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
        }, ANIMATION_DURATION);
        return () => {
            if (cryptoWorker) {
                cryptoWorker.terminate();
            }
        }
    }, []);

    function sendMessage(id, type, name, args) {
        setHasError(null);
        let msgId = id + 1;
        const msg = {
            id: id,
            type: type,
            name: name,
            args: args
        };
        setMessageId(msgId);
        dispatch({ action: "send", msg: msg });
        cryptoWorker.postMessage(msg);
    }

    function processError(msg) {
        let result = msg.result;
        setHasError(result);
    }

    function encryptClicked() {
        setNavState(NAV_STATES.encrypt);
    }

    function decryptClicked() {
        setNavState(NAV_STATES.decrypt);
    }

    function contactsClicked() {
        setNavState(NAV_STATES.contacts);
    }

    if (hasError) {
        return (
            <div>
                <h1 className="uppercase">Kestrel</h1>
                <div><span className="error">Error:</span> {hasError.msg}</div>
            </div>
        )
    }

    if (showSpinner) {
        return (
            <div>
                <h1 className="uppercase">Kestrel</h1>
                <DotLoader />
            </div>
        )
    }

    if (navState == NAV_STATES.encrypt) {
        return (
            <div>
                <h1 className="uppercase">Kestrel</h1>
                <NavBar
                    encryptClick={encryptClicked}
                    decryptClick={decryptClicked}
                    contactsClick={contactsClicked}
                    active={navState} />
                <EncryptPage
                    sendMessage={sendMessage}
                    msgId={messageId}
                    keyResult={workerResults.encryptButtonDeriveKey.result}
                    keyLoading={workerResults.encryptButtonDeriveKey.loading} />
                {hasError != null &&
                    <div className="error">{hasError.msg}</div>
                }
            </div>
        )
    } else if (navState == NAV_STATES.decrypt) {
        return (
            <div>
                <h1 className="uppercase">Kestrel</h1>
                <NavBar
                    encryptClick={encryptClicked}
                    decryptClick={decryptClicked}
                    contactsClick={contactsClicked}
                    active={navState} />
                <DecryptPage />
            </div>
        )
    } else if (navState == NAV_STATES.contacts) {
        return (
            <div>
                <h1 className="uppercase">Kestrel</h1>
                <NavBar
                    encryptClick={encryptClicked}
                    decryptClick={decryptClicked}
                    contactsClick={contactsClicked}
                    active={navState} />
                <ContactsPage />
            </div>
        )
    } else {
        return (
            <div>Invalid State</div>
        )
    }
}
