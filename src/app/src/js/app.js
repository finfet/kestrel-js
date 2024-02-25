import { useState, useEffect, useReducer } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const ANIMATION_DURATION = 200;

const workerMsgNames = {
    passEncrypt: "pass_encrypt"
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
    passEncryptResult: "",
    passEncryptLoading: false
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

function PassEncryptPage({ sendMessage, msgId, passEncryptResult, passEncryptLoading }) {
    const [dkAnimStart, setDkAnimStart] = useState(false);
    const [dkAnimMet, setDkAnimMet] = useState(false);
    const [unlockClicked, setUnlockClicked] = useState(false);

    const [plaintextFile, setPlaintextFile] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const dkShowSpinner = passEncryptLoading || (dkAnimStart && !dkAnimMet);
    const encryptDisabled = validationError || dkShowSpinner;

    let unlock = "";
    if (unlockClicked) {
        unlock = passEncryptResult;
    }

    function fileChange(event) {
        setValidationError(false);
        setPlaintextFile(event.target.files[0]);
    }

    function passwordChange(event) {
        setValidationError(false);
        setPassword(event.target.value);
    }

    function confirmPasswordChange(event) {
        setValidationError(false);
        setConfirmPassword(event.target.value);
    }

    function encryptClick(event) {
        event.preventDefault();
        if (plaintextFile) {
            console.log("plaintextFile:", plaintextFile.name);
        }
        if (password != confirmPassword) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }
        console.log("password:", password);
        console.log("confirm :", confirmPassword);
        setDkAnimStart(true);
        setDkAnimMet(false);
        setUnlockClicked(true);
        setTimeout(() => {
            setDkAnimStart(false);
            setDkAnimMet(true);
        }, ANIMATION_DURATION);
        sendMessage(msgId, "scrypt", workerMsgNames.passEncrypt, [toUtf8Bytes(password)]);
    }

    return (
        <div>
            <h4>Encrypt with Password</h4>
            <form className="pb-4">
                <div className="pt-3">
                    <label htmlFor="plaintext-file">Input File:</label>
                    <input className="file-input" type="file" id="plaintext-file" name="plaintext-file" style={{marginLeft: 1 + "rem"}} onChange={fileChange} />
                </div>
                <div className="pt-3">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" style={{marginLeft: 1 + "rem"}} onChange={passwordChange} />
                </div>
                <div className="pt-1">
                    <label htmlFor="confirm-password">Confirm:</label>
                    <input type="password" id="confirm-password" name="confirm-password" style={{marginLeft: 1.85 + "rem"}} onChange={confirmPasswordChange} />
                </div>
                { validationError ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                    ) : <div className="mt-3 hidden"><span class="error">OK</span></div>
                }
                <div className="pt-3">
                    <button onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                    { dkShowSpinner ? (
                            <DotLoader classes={"ml-1"} />
                        ) : (
                            <span style={{paddingLeft: 0.5 + "rem"}}>{unlock}</span>
                        )
                    }
                </div>
            </form>
        </div>
    )
}

function EncryptPage(props) {
    if (props.encryptNavState == encryptNavStates.key) {
        return (
            <KeyEncryptPage />
        );
    } else if (props.encryptNavState == encryptNavStates.pass) {
        return (
            <PassEncryptPage
                sendMessage={props.sendMessage}
                msgId={props.messageId}
                passEncryptResult={props.state.passEncryptResult}
                passEncryptLoading={props.state.passEncryptLoading} />
        );
    } else {
        return (
            <div>
                <button onClick={() => props.encryptNavClick(true)}>Use Key</button>
                <button className="ml-4" onClick={() => props.encryptNavClick(false)}>Use Password</button>
            </div>
        );
    }
}

function workerReducer(state, action) {
    if (action.action == "send" && action.msg.name == workerMsgNames.passEncrypt) {
        return {
            ...state,
            passEncryptLoading: true
        };
    } else if (action.action == "recv" && action.msg.name == workerMsgNames.passEncrypt) {
        return {
            ...state,
            passEncryptLoading: false,
            passEncryptResult: action.msg.result
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
        setEncryptNavState(encryptNavStates.start);
        setNavState(navStates.encrypt);
    }

    function decryptClick() {
        setNavState(navStates.decrypt);
    }

    function contactsClick() {
        setNavState(navStates.contacts);
    }

    function encryptNavClick(key) {
        if (key) {
            setEncryptNavState(encryptNavStates.key);
        } else {
            setEncryptNavState(encryptNavStates.pass);
        }
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
                <EncryptPage
                    sendMessage={sendMessage}
                    messageId={messageId}
                    encryptNavState={encryptNavState}
                    encryptNaveStates={encryptNavStates}
                    encryptNavClick={encryptNavClick}
                    state={state} />
            </div>
        );
    } else if (navState == navStates.decrypt) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                <DecryptPage />
            </div>
        );
    } else if (navState == navStates.contacts) {
        return (
            <div>
                <NavBar
                    encryptClick={encryptClick}
                    decryptClick={decryptClick}
                    contactsClick={contactsClick}
                    active={navState} />
                <ContactsPage />
            </div>
        )
    } else {
        return (<div>Error: Invalid State</div>);
    }
}
