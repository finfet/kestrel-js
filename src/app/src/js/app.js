import { useState, useEffect, useReducer } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const ANIMATION_DURATION = 200;

const workerMsgNames = {
    passEncryptUnlock: "pass_encrypt_unlock"
}

const navStates = {
    encrypt: 0,
    decrypt: 1,
    contacts: 2
}

const encryptNavStates = {
    start: 0,
    key: 1,
    pass: 2
}

const initialState = {
    passEncryptUnlockResult: "",
    passEncryptUnlockLoading: false
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
            <ul className="nav">
                <li className="nav-title"><a className="nav-link" href="/">Kestrel</a></li>
                <li onClick={encryptClick} className={"nav-button " + (active == navStates.encrypt ? "nav-button-active" : "")}>Encrypt</li>
                <li onClick={decryptClick} className={"nav-button " + (active == navStates.decrypt ? "nav-button-active" : "")}>Decrypt</li>
                <li onClick={contactsClick} className={"nav-button nav-button-end " + (active == navStates.contacts ? "nav-button-active" : "")}>Contacts</li>
            </ul>
        </div>
    )
}

function LoadingNavBar() {
    return (
        <div className="mt-3 pb-3">
            <ul className="nav">
                <li className="nav-title">Kestrel</li>
            </ul>
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

function KeyEncryptPage() {
    return (
        <div>
            <h2>Encrypt with Key</h2>
        </div>
    )
}

function PassEncryptPage({ sendMessage, msgId, passEncryptUnlockResult, passEncryptUnlockLoading }) {
    const [dkAnimStart, setDkAnimStart] = useState(false);
    const [dkAnimMet, setDkAnimMet] = useState(false);
    const [unlockClicked, setUnlockClicked] = useState(false);
    const dkShowSpinner = passEncryptUnlockLoading || (dkAnimStart && !dkAnimMet);

    let unlock = "";
    if (unlockClicked) {
        unlock = passEncryptUnlockResult;
    }

    function deriveKey() {
        setDkAnimStart(true);
        setDkAnimMet(false);
        setUnlockClicked(true);
        setTimeout(() => {
            setDkAnimStart(false);
            setDkAnimMet(true);
        }, ANIMATION_DURATION);
        sendMessage(msgId, "scrypt", workerMsgNames.passEncryptUnlock, [toUtf8Bytes("hackme")]);
    }

    return (
        <div>
            <h4>Encrypt with Password</h4>
            <button onClick={deriveKey} disabled={dkShowSpinner}>Encrypt</button>
            { dkShowSpinner ? (
                    <DotLoader classes={"ml-1"} />
                ) : (
                    <span style={{paddingLeft: 0.5 + "rem"}}>{unlock}</span>
                )
            }
        </div>
    )
}

function workerReducer(state, action) {
    if (action.action == "send" && action.msg.name == workerMsgNames.passEncryptUnlock) {
        return {
            ...state,
            passEncryptUnlockLoading: true
        };
    } else if (action.action == "recv" && action.msg.name == workerMsgNames.passEncryptUnlock) {
        return {
            ...state,
            passEncryptUnlockLoading: false,
            passEncryptUnlockResult: action.msg.result
        };
    } else {
        throw new Error("Unsupported crypto worker state action");
    }
}

export default function App() {
    const [cryptoWorker, setCryptoWorker] = useState(null);
    const [state, dispatch] = useReducer(workerReducer, initialState);
    const [navState, setNavState] = useState(navStates.encrypt);
    const [encryptNavState, setEncryptNavState] = useState(encryptNavStates.start);
    const [resetKey, setResetKey] = useState(0);
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

    function encryptClick() {
        setResetKey(resetKey + 1);
        setEncryptNavState(encryptNavStates.start);
        setNavState(navStates.encrypt);
    }

    function decryptClick() {
        setResetKey(resetKey + 1);
        setNavState(navStates.decrypt);
    }

    function contactsClick() {
        setResetKey(resetKey + 1);
        setNavState(navStates.contacts);
    }

    function encryptNavClick(key) {
        if (key) {
            setEncryptNavState(encryptNavStates.key);
        } else {
            setEncryptNavState(encryptNavStates.pass);
        }
    }

    let encryptPage = (
        <div>
            <button onClick={() => encryptNavClick(true)}>Use Key</button>
            <button className="ml-4" onClick={() => encryptNavClick(false)}>Use Password</button>
        </div>
    );

    if (encryptNavState == encryptNavStates.pass) {
        encryptPage = (
            <PassEncryptPage
                sendMessage={sendMessage}
                msgId={messageId}
                passEncryptUnlockResult={state.passEncryptUnlockResult}
                passEncryptUnlockLoading={state.passEncryptUnlockLoading} />
        );
    } else if (encryptNavState == encryptNavStates.key) {
        encryptPage = (
            <KeyEncryptPage />
        )
    }

    if (hasError) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                <div><span className="error">Error:</span> {hasError.msg}</div>
            </div>
        )
    }

    if (showSpinner) {
        return (
            <div>
                <LoadingNavBar />
                <DotLoader />
            </div>
        )
    }

    if (navState == navStates.encrypt) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                { encryptPage }
            </div>
        )
    } else if (navState == navStates.decrypt) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                <DecryptPage key={resetKey} />
            </div>
        )
    } else if (navState == navStates.contacts) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                <ContactsPage key={resetKey} />
            </div>
        )
    } else {
        return <div>Error: Invalid State</div>
    }
}
