import { useEffect, useReducer } from "react";

import { reducer, initialState, appNavStates, encryptNavStates, decryptNavStates } from "./state.js";
import { ANIMATION_DURATION, DotLoader } from "./components.js";
import { PassEncryptPage, KeyEncryptPage } from "./encrypt.js";
import { PassDecryptPage, KeyDecryptPage } from "./decrypt.js";
import { ContactsPage } from "./contacts.js";

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
