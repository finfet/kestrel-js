import { useState, useEffect, useReducer, useRef } from "react";
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
    worker: null,
    workerAnimStart: false,
    workerAnimMet: false,
    workerLoading: false,
    workerReload: false,
    hasError: null,
    passEncryptResult: null,
    passEncryptLoading: false
}

function DotLoader({ classes }) {
    if (!classes) {
        classes = "";
    }
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

function SelectEncryptPage({ makePageSelection }) {
    return (
        <div>
            <button onClick={() => makePageSelection(true)}>Use Key</button>
            <button className="ml-4" onClick={() => makePageSelection(false)}>Use Password</button>
        </div>
    );
}

function PassEncryptPage({ sendMessage, passEncryptResult, passEncryptLoading, resetPassEncryptResult, reloadWorker }) {
    const [peAnimStart, setPeAnimStart] = useState(false);
    const [peAnimMet, setPeAnimMet] = useState(false);
    const [resultShown, setResultShown] = useState(false);

    const [plaintextFile, setPlaintextFile] = useState(null);
    const [fileSize, setFileSize] = useState(0);
    const fileInputField = useRef(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const peShowSpinner = passEncryptLoading || (peAnimStart && !peAnimMet);
    const encryptDisabled = validationError || peShowSpinner || resultShown;

    function fileChange(event) {
        const file = event.target.files[0];
        setValidationError(false);
        setFileSize(file.size);
        setPlaintextFile(file);
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
        if (!plaintextFile) {
            setValidationError(true);
            setErrorMsg("Please select a file");
            return;
        }
        if (fileSize > (1024 * (1024 * 1024))) {
            setValidationError(true);
            setErrorMsg("Maximum file size is 1GiB");
            return;
        }
        if (password != confirmPassword) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }
        setPeAnimStart(true);
        setPeAnimMet(false);
        setResultShown(true);
        setTimeout(() => {
            setPeAnimStart(false);
            setPeAnimMet(true);
        }, ANIMATION_DURATION);
        sendMessage(workerMsgActions.passEncrypt, [plaintextFile, toUtf8Bytes(password)]);
    }

    function reset() {
        if (passEncryptResult) {
            URL.revokeObjectURL(passEncryptResult.url);
        }
        resetPassEncryptResult();
        setPeAnimStart(false);
        setPeAnimMet(false);
        setResultShown(false);
        setPlaintextFile(null);
        setFileSize(0);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setPassword("");
        setConfirmPassword("");
        setValidationError(false);
        setErrorMsg("");
        if (fileSize > (100 * (1024 * 1024))) {
            console.log("reloading worker");
            reloadWorker();
        }
    }

    return (
        <div>
            <h4>Encrypt with Password</h4>
            <div className="form-group pt-3">
                <label htmlFor="plaintext-file">Select File</label>
                <input className="file-input" type="file" id="plaintext-file" name="plaintext-file" ref={fileInputField} onChange={fileChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} />
            </div>
            <div className="form-group pt-1">
                <label htmlFor="confirm-password">Confirm</label>
                <input type="password" id="confirm-password" name="confirm-password" value={confirmPassword} onChange={confirmPasswordChange} />
            </div>
            { validationError ? (
                <div className="mt-3 error">Error: {errorMsg}</div>
                ) : <div className="mt-3 error hidden">OK</div>
            }
            <div className="pt-3 row-container">
                <div>
                    <button onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                </div>
                { peShowSpinner ? (
                        <div>
                            <DotLoader classes={"ml-1 mt-1"} />
                        </div>
                    ) : (
                        <>
                        { resultShown ? (
                            <>
                            <div className="pt-2">
                                <a href={passEncryptResult.url} style={{display: "inline-block"}} download={passEncryptResult.filename}>
                                    <img src="./assets/img/download.svg" alt="Download" style={{display: "inline-block", verticalAlign: "middle"}}></img>{passEncryptResult.filename}
                                </a>
                            </div>
                            <div>
                                <button className="icon-button icon-reset" onClick={reset}>
                                </button>
                            </div>
                            </>
                            ) : (
                                <div></div>
                            )
                        }
                        </>
                    )
                }
            </div>
        </div>
    )
}

function reducer(state, action) {
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
    } else if (action.action == "reload_worker") {
        let reload = true;
        if (state.workerReload) {
            reload = false;
        }
        return {
            ...state,
            workerReload: reload
        };
    } else if (action.action == "worker_load_start") {
        return {
            ...state,
            worker: action.worker,
            workerLoading: true,
            workerAnimStart: true,
            workerAnimMet: false
        };
    } else if (action.action == "worker_load_end") {
        return {
            ...state,
            workerAnimStart: false,
            workerAnimMet: true
        };
    } else if (action.action == "worker_terminate") {
        return {
            ...state,
            worker: null,
        };
    } else if (action.action == "reset_pass_encrypt_result") {
        return {
            ...state,
            passEncryptResult: null
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
    const [state, dispatch] = useReducer(reducer, initialState);

    const showSpinner = state.workerLoading || (state.workerAnimStart && !state.workerAnimMet);

    useEffect(() => {
        reloadWorker();
    }, []);

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
        dispatch({ action: "worker_load_start", worker: worker });
        setTimeout(() => {
            dispatch({ action: "worker_load_end" });
        }, ANIMATION_DURATION);
        return () => {
            worker.terminate();
            dispatch({ action: "worker_terminate" });
        }
    }, [state.workerReload]);

    function reloadWorker() {
        dispatch({ action: "reload_worker" });
    }

    function resetPassEncryptResult() {
        dispatch({ action: "reset_pass_encrypt_result" });
    }

    function sendMessage(action, args) {
        const msg = {
            action: action,
            args: args
        };
        dispatch({ action: "send", msg: msg });
        state.worker.postMessage(msg);
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

    function makeEncryptPageSelection(key) {
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

    let selectedPage = (<div>Error: Invalid State</div>);

    if (state.appNavState == appNavStates.encrypt) {
        if (state.encryptNavState == encryptNavStates.key) {
            selectedPage = (<KeyEncryptPage />);
        } else if (state.encryptNavState == encryptNavStates.pass) {
            selectedPage = (
                <PassEncryptPage
                    sendMessage={sendMessage}
                    passEncryptResult={state.passEncryptResult}
                    passEncryptLoading={state.passEncryptLoading}
                    resetPassEncryptResult={resetPassEncryptResult}
                    reloadWorker={reloadWorker} />
            );
        } else {
            selectedPage = (<SelectEncryptPage makePageSelection={makeEncryptPageSelection} />);
        }
    } else if (state.appNavState == appNavStates.decrypt) {
        selectedPage = (<DecryptPage />);
    } else if (state.appNavState == appNavStates.contacts) {
        selectedPage = (<ContactsPage />);
    }

    return (
        <>
        <NavBar
            encryptClick={navEncryptClick}
            decryptClick={navDecryptClick}
            contactsClick={navContactsClick}
            active={state.appNavState} />
        {selectedPage}
        </>
    );
}
