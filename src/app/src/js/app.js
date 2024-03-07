import { useState, useEffect, useReducer } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const ANIMATION_DURATION = 200;

const workerMsgActions = {
    passEncrypt: "pass_encrypt"
}

const appNavStates = {
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
    appNavState: appNavStates.encrypt,
    encryptNavState: encryptNavStates.start,
    workerLoading: true,
    hasError: null,
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
                <li onClick={encryptClick} className={"nav-button " + (active == appNavStates.encrypt ? "nav-button-active" : "")}>Encrypt</li>
                <li onClick={decryptClick} className={"nav-button " + (active == appNavStates.decrypt ? "nav-button-active" : "")}>Decrypt</li>
                <li onClick={contactsClick} className={"nav-button nav-button-end " + (active == appNavStates.contacts ? "nav-button-active" : "")}>Contacts</li>
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

function PassEncryptPage({ sendMessage, passEncryptResult, passEncryptLoading }) {
    const [peAnimStart, setPeAnimStart] = useState(false);
    const [peAnimMet, setPeAnimMet] = useState(false);
    const [encryptClicked, setEncryptClicked] = useState(false);
    const [fileDownloaded, setFileDownloaded] = useState(false);

    const [plaintextFile, setPlaintextFile] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const peShowSpinner = passEncryptLoading || (peAnimStart && !peAnimMet);
    const encryptDisabled = validationError || peShowSpinner;

    useEffect(() => {
        if (fileDownloaded) {
            if (passEncryptResult && passEncryptResult.url) {
                setTimeout(() => {
                    URL.revokeObjectURL(passEncryptResult.url);
                }, 0);
            }
        }
    }, [fileDownloaded]);

    function fileChange(event) {
        setEncryptClicked(false);
        setValidationError(false);
        setPlaintextFile(event.target.files[0]);
    }

    function passwordChange(event) {
        setEncryptClicked(false);
        setValidationError(false);
        setPassword(event.target.value);
    }

    function confirmPasswordChange(event) {
        setEncryptClicked(false);
        setValidationError(false);
        setConfirmPassword(event.target.value);
    }

    function encryptClick(event) {
        event.preventDefault();
        if (!plaintextFile) {
            setValidationError(true);
            setErrorMsg("Please select a file");
            return;
        }
        if (password != confirmPassword) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }
        setPeAnimStart(true);
        setPeAnimMet(false);
        setFileDownloaded(false);
        setEncryptClicked(true);
        setTimeout(() => {
            setPeAnimStart(false);
            setPeAnimMet(true);
        }, ANIMATION_DURATION);
        sendMessage(workerMsgActions.passEncrypt, [plaintextFile, toUtf8Bytes(password)]);
    }

    function fileDownloadClick() {
        setFileDownloaded(true);
        setEncryptClicked(false);
        return true;
    }

    return (
        <div>
            <h4>Encrypt with Password</h4>
            <form className="pb-4">
                <div className="form-group pt-3">
                    <label htmlFor="plaintext-file">Select File</label>
                    <input className="file-input" type="file" id="plaintext-file" name="plaintext-file" onChange={fileChange} />
                </div>
                <div className="form-group pt-3">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" onChange={passwordChange} />
                </div>
                <div className="form-group pt-1">
                    <label htmlFor="confirm-password">Confirm</label>
                    <input type="password" id="confirm-password" name="confirm-password" onChange={confirmPasswordChange} />
                </div>
                { validationError ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                    ) : <div className="mt-3 hidden"><span>OK</span></div>
                }
                <div className="pt-3">
                    <button onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                    { peShowSpinner ? (
                            <DotLoader classes={"ml-1"} />
                        ) : (
                            <>
                                {encryptClicked ? (
                                    <span className={"ml-4"}><a href={passEncryptResult.url} download={passEncryptResult.filename} onClick={fileDownloadClick}>{passEncryptResult.filename}</a></span>
                                ) : (
                                    <span></span>
                                )
                            }
                            </>
                        )
                    }
                </div>
            </form>
        </div>
    )
}

function EncryptPage(props) {
    if (props.state.encryptNavState == encryptNavStates.key) {
        return (
            <KeyEncryptPage />
        );
    } else if (props.state.encryptNavState == encryptNavStates.pass) {
        return (
            <PassEncryptPage
                sendMessage={props.sendMessage}
                passEncryptResult={props.state.passEncryptResult}
                passEncryptLoading={props.state.passEncryptLoading} />
        );
    } else {
        return (
            <div>
                <button onClick={() => props.encryptPageSelect(true)}>Use Key</button>
                <button className="ml-4" onClick={() => props.encryptPageSelect(false)}>Use Password</button>
            </div>
        );
    }
}

function AppNavPage({ state, encryptPageSelect, sendMessage }) {
    if (state.appNavState == appNavStates.encrypt) {
        return (
            <EncryptPage
                sendMessage={sendMessage}
                encryptPageSelect={encryptPageSelect}
                state={state} />
        );
    } else if (state.appNavState == appNavStates.decrypt) {
        return (
            <DecryptPage />
        );
    } else if (state.appNavState == appNavStates.contacts) {
        return (
            <ContactsPage />
        );
    } else {
        return (
            <div>Error: Invalid State</div>
        );
    }
}

function workerReducer(state, action) {
    if (action.action == "send" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            hasError: null,
            passEncryptLoading: true
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            passEncryptLoading: false,
            passEncryptResult: action.msg.result
        };
    } else if (action.action == "recv" && action.msg.action == "init") {
        return {
            ...state,
            workerLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == "exception") {
        return {
            ...state,
            hasError: msg.result
        };
    } else if (action.action == "nav_encrypt_clicked") {
        return {
            ...state,
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.start
        };
    } else if (action.action == "nav_decrypt_clicked") {
        return {
            ...state,
            appNavState: appNavStates.decrypt
        };
    } else if (action.action == "nav_contacts_clicked") {
        return {
            ...state,
            appNavState: appNavStates.contacts
        };
    } else if (action.action == "nav_encrypt_select_key") {
        return {
            ...state,
            encryptNavState: encryptNavStates.key
        };
    } else if (action.action == "nav_encrypt_select_pass") {
        return {
            ...state,
            encryptNavState: encryptNavStates.pass
        };
    } else {
        return {
            ...state,
            hasError: { type: "invalid_state", msg: "Invalid state reached" }
        };
    }
}

export default function App() {
    const [cryptoWorker, setCryptoWorker] = useState(null);
    const [state, dispatch] = useReducer(workerReducer, initialState);

    const [animStart, setAnimStart] = useState(false);
    const [animMet, setAnimMet] = useState(false);

    const showSpinner = state.workerLoading || (animStart && !animMet);

    useEffect(() => {
        const worker = new Worker("worker.bundle.js", { type: "module" });
        worker.onmessage = e => {
            let msg = e.data;
            dispatch({ action: "recv", msg: msg });
        }
        worker.onerror = (_e) => {
            const msg = {
                action: "exception",
                result: {
                    type: "worker_onerror", msg: "Worker communication failed."
                }
            };
            dispatch({ action: "recv", msg: msg });
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

    function sendMessage(action, args) {
        const msg = {
            action: action,
            args: args
        };
        dispatch({ action: "send", msg: msg });
        cryptoWorker.postMessage(msg);
    }

    function navEncryptClick() {
        dispatch({ action: "nav_encrypt_clicked" });
    }

    function navDecryptClick() {
        dispatch({ action: "nav_decrypt_clicked" });
    }

    function navContactsClick() {
        dispatch({ action: "nav_contacts_clicked" });
    }

    function encryptPageSelect(key) {
        if (key) {
            dispatch({ action: "nav_encrypt_select_key" });
        } else {
            dispatch({ action: "nav_encrypt_select_pass" });
        }
    }

    if (state.hasError) {
        return (
            <div>
                <NavBar
                    encryptClick={navEncryptClick}
                    decryptClick={navDecryptClick}
                    contactsClick={navContactsClick}
                    active={state.appNavState} />
                <div className="error">Error: {state.hasError.msg}</div>
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

    return (
        <>
        <NavBar
            encryptClick={navEncryptClick}
            decryptClick={navDecryptClick}
            contactsClick={navContactsClick}
            active={state.appNavState} />
        <AppNavPage
            state={state}
            sendMessage={sendMessage}
            encryptPageSelect={encryptPageSelect}
        />
        </>
    );
}
