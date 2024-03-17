import { useState, useEffect, useLayoutEffect, useReducer, useRef } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

const ANIMATION_DURATION = 200;

const workerMsgActions = {
    passEncrypt: "pass_encrypt",
    passDecrypt: "pass_decrypt"
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

const decryptNavStates = {
    start: 0,
    key: 1,
    pass: 2
}

const initialState = {
    appNavState: appNavStates.encrypt,
    encryptNavState: encryptNavStates.start,
    decryptNavState: decryptNavStates.start,
    worker: null,
    workerAnimStart: false,
    workerAnimMet: false,
    workerLoading: false,
    workerReload: false,
    hasError: null,
    passEncryptResult: null,
    passEncryptLoading: false,
    passDecryptResult: null,
    passDecryptLoading: false
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
    );
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
    );
}

function LoadingNavBar() {
    return (
        <div className="mt-3 pb-3">
            <ul className="nav">
                <li className="nav-title">Kestrel</li>
            </ul>
        </div>
    );
}

function SelectPage({ makePageSelection, title }) {
    return (
        <>
        <h4 className="pb-3">{ title }</h4>
        <div>
            <button onClick={() => makePageSelection(true)}>Use Key</button>
            <button className="ml-4" onClick={() => makePageSelection(false)}>Use Password</button>
        </div>
        </>
    );
}

function ContactsPage() {
    return (
        <div>
            <h4>Contacts</h4>
        </div>
    );
}

function KeyDecryptPage() {
    return (
        <div>
            <h4>Decrypt with Key</h4>
        </div>
    );
}

function PassDecryptPage({ sendMessage, passDecryptResult, passDecryptLoading, reloadWorker }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const fileInputField = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [decryptError, setDecryptError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [fileSize, setFileSize] = useState(0);
    const [ciphertextFile, setCiphertextFile] = useState(null);
    const [password, setPassword] = useState("");

    const showSpinner = passDecryptLoading || (anim.start && !anim.met);
    const decryptDisabled = hasError || showSpinner || resultShown;

    // 1GiB + file format overhead (32 bytes per 64k + 36 byte header)
    const s100MiB = 100 * (1024 * 1024);
    const s1GiB = 1024 * (1024 * 1024);
    const overhead = (512 * 1024) + 36;
    const maxFileSize = s1GiB + overhead;

    useEffect(() => {
        if (passDecryptResult && passDecryptResult.exception) {
            let ex = passDecryptResult.exception;
            setDecryptError(true);
            setResultShown(false);
            if (ex.name == "DecryptError::ChaPolyDecrypt") {
                setErrorMsg("Decrypt Failed. Check password used.");
            } else {
                setErrorMsg(ex.message);
            }
        }
    }, [passDecryptResult]);

    function fileChange(event) {
        const file = event.target.files[0];
        setHasError(false);
        setDecryptError(false);
        setFileSize(file.size);
        setCiphertextFile(file);
    }

    function passwordChange(event) {
        setHasError(false);
        setDecryptError(false);
        setPassword(event.target.value);
    }

    function decryptClick(event) {
        event.preventDefault();
        if (!ciphertextFile) {
            setHasError(true);
            setErrorMsg("Please select a file");
            return;
        }

        if (fileSize > maxFileSize) {
            setHasError(true);
            setErrorMsg("File is too large. Maximum 1GB");
            return;
        }

        setAnim({ start: true, met: false });
        setHasError(false);
        setDecryptError(false);
        setResultShown(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.passDecrypt, [ciphertextFile, toUtf8Bytes(password)]);
    }

    function doneClick() {
        if (passDecryptResult && passDecryptResult.url) {
            URL.revokeObjectURL(passDecryptResult.url);
        }
        setAnim({ start: false, met: false });
        setResultShown(false);
        setCiphertextFile(null);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setPassword("");
        setHasError(false);
        setErrorMsg("");
        if (fileSize > s100MiB) {
            reloadWorker();
        }
        setFileSize(0);
    }

    return (
        <div>
            <h4>Decrypt with Password</h4>
            <div className="form-group pt-3">
                <label htmlFor="ciphertext-file">Select File</label>
                <input className="file-input" type="file" id="ciphertext-file" name="ciphertext-file" ref={fileInputField} onChange={fileChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} />
            </div>
            { (hasError || decryptError) ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            <div className="pt-3 row-container">
                <div>
                    <button onClick={decryptClick} disabled={decryptDisabled}>Decrypt</button>
                </div>
                { showSpinner ? (
                        <div className="pt-2">
                            <DotLoader classes={"ml-1 mt-1"} />
                        </div>
                    ) : (
                        <>
                        { resultShown ? (
                            <>
                            <div className="pt-2">
                                <a href={passDecryptResult.url} style={{display: "inline-block"}} download={passDecryptResult.filename}>
                                    <img src="./assets/img/download.svg" alt="Download" style={{display: "inline-block", verticalAlign: "middle"}}></img>{passDecryptResult.filename}
                                </a>
                            </div>
                            <div>
                                <button onClick={doneClick}>Done</button>
                            </div>
                            </>
                            ) : (
                                <></>
                            )
                        }
                        </>
                    )
                }
            </div>
        </div>
    );
}

function KeyEncryptPage() {
    return (
        <div>
            <h4>Encrypt with Key</h4>
        </div>
    );
}

function PassEncryptPage({ sendMessage, passEncryptResult, passEncryptLoading, reloadWorker }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const [plaintextFile, setPlaintextFile] = useState(null);
    const [fileSize, setFileSize] = useState(0);
    const fileInputField = useRef(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const showSpinner = passEncryptLoading || (anim.start && !anim.met);
    const encryptDisabled = validationError || showSpinner || resultShown;
    const s100MiB = 100 * (1024 * 1024);
    const s1GiB = 1024 * (1024 * 1024);
    const maxFileSize = s1GiB;

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
        if (fileSize > maxFileSize) {
            setValidationError(true);
            setErrorMsg("File is too large. Maximum is 1GB");
            return;
        }
        if (password != confirmPassword) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }
        setAnim({ start: true, met: false });
        setResultShown(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);
        sendMessage(workerMsgActions.passEncrypt, [plaintextFile, toUtf8Bytes(password)]);
    }

    function doneClick() {
        if (passEncryptResult) {
            URL.revokeObjectURL(passEncryptResult.url);
        }
        setAnim({ start: false, met: false });
        setResultShown(false);
        setPlaintextFile(null);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setPassword("");
        setConfirmPassword("");
        setValidationError(false);
        setErrorMsg("");
        if (fileSize > s100MiB) {
            reloadWorker();
        }
        setFileSize(0);
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
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            <div className="pt-3 row-container">
                <div>
                    <button onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                </div>
                { showSpinner ? (
                        <div className="pt-2">
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
                                <button onClick={doneClick}>Done</button>
                            </div>
                            </>
                            ) : (
                                <></>
                            )
                        }
                        </>
                    )
                }
            </div>
        </div>
    );
}

function reducer(state, action) {
    if (action.action == "send" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            hasError: null,
            passEncryptResult: null,
            passEncryptLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.passDecrypt) {
        return {
            ...state,
            hasError: null,
            passDecryptResult: null,
            passDecryptLoading: true
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            passEncryptResult: action.msg.result,
            passEncryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.passDecrypt) {
        return {
            ...state,
            passDecryptResult: action.msg.result,
            passDecryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == "init") {
        return {
            ...state,
            workerLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == "exception") {
        return {
            ...state,
            hasError: action.msg.result
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
    } else if (action.action == "nav_encrypt_clicked") {
        return {
            ...state,
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.start
        };
    } else if (action.action == "nav_decrypt_clicked") {
        return {
            ...state,
            appNavState: appNavStates.decrypt,
            decryptNavState: decryptNavStates.start
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
    } else if (action.action == "nav_decrypt_select_key") {
        return {
            ...state,
            decryptNavState: decryptNavStates.key
        };
    } else if (action.action == "nav_decrypt_select_pass") {
        return {
            ...state,
            decryptNavState: decryptNavStates.pass
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

    useLayoutEffect(() => {
        const worker = new Worker("worker.bundle.js", { type: "module" });
        worker.onmessage = e => {
            let msg = e.data;
            dispatch({ action: "recv", msg: msg });
        }
        worker.onerror = (_e) => {
            const msg = {
                action: "exception",
                result: {
                    type: "worker_onerror", msg: "Could not communicate with worker."
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

    function makeEncryptPageSelection(useKey) {
        if (useKey) {
            dispatch({ action: "nav_encrypt_select_key" });
        } else {
            dispatch({ action: "nav_encrypt_select_pass" });
        }
    }

    function makeDecryptPageSelection(useKey) {
        if (useKey) {
            dispatch({ action: "nav_decrypt_select_key" });
        } else {
            dispatch({ action: "nav_decrypt_select_pass" });
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
                    reloadWorker={reloadWorker} />
            );
        } else {
            selectedPage = (<SelectPage makePageSelection={makeEncryptPageSelection} title="Encrypt File" />);
        }
    } else if (state.appNavState == appNavStates.decrypt) {
        if (state.decryptNavState == decryptNavStates.key) {
            selectedPage = (<KeyDecryptPage />);
        } else if (state.decryptNavState == decryptNavStates.pass) {
            selectedPage = (
                <PassDecryptPage
                    sendMessage={sendMessage}
                    passDecryptResult={state.passDecryptResult}
                    passDecryptLoading={state.passDecryptLoading}
                    reloadWorker={reloadWorker}
                />
            );
        } else {
            selectedPage = (<SelectPage makePageSelection={makeDecryptPageSelection} title="Decrypt File" />);
        }
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
        <div className="content">
            {selectedPage}
        </div>
        <div className="footer">Kestrel v0.1.0</div>
        </>
    );
}
