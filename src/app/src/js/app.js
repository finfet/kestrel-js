import { useEffect, useReducer } from "react";

import {
    reducer, initialState, appNavStates,
    encryptNavStates, decryptNavStates, contactsNavStates
} from "./state.js";
import { ANIMATION_DURATION, DotLoader } from "./common.js";
import { PassEncryptPage, KeyEncryptPage } from "./encrypt.js";
import { PassDecryptPage, KeyDecryptPage } from "./decrypt.js";
import {
    ContactsPage, GenKeyPage, AddKeyPage,
    EditKeyPage, DeleteKeyPage, ExtractPage,
    ChangePassPage, ContactList
} from "./contacts.js";

function NavBar({ encryptClick, decryptClick, contactsClick, active }) {
    return (
        <div className="pb-3">
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
        <div>
            <h4>{ title }</h4>
            <div className="pt-3 row-container">
                <div>
                    <button onClick={() => makePageSelection(true)}>Use Key</button>
                </div>
                <div>
                    <button onClick={() => makePageSelection(false)}>Use Password</button>
                </div>
            </div>
        </div>
    );
}

function sortContacts(a, b) {
    if (a.name < b.name) {
        return -1;
    }

    if (a.name > b.name) {
        return 1;
    }

    return 0;
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

    useEffect(() => {
        const contacts = localStorage.getItem("contacts");
        if (contacts == null) {
            dispatch({ action: "init_contacts", contacts: []});
        } else {
            try {
                const contacts = JSON.parse(localStorage.getItem("contacts"));
                dispatch({ action: "init_contacts", contacts: contacts });
            } catch (_e) {
                dispatch({ action: "init_contacts", contacts: [] });
            }
        }
    }, []);

    useEffect(() => {
        if (state.contactsInit) {
            localStorage.setItem("contacts", JSON.stringify(state.contacts));
        }
    }, [state.contacts, state.contactsInit]);

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

    function navGenKeyClick() {
        dispatch({ action: "nav_contacts_genkey" });
    }

    function navAddKeyClick() {
        dispatch({ action: "nav_contacts_addkey" });
    }

    function navEditKeyClick(contact) {
        dispatch({ action: "nav_contacts_editkey", contact: contact });
    }

    function navDeleteKeyClick(contact) {
        dispatch({ action: "nav_contacts_deletekey", contact: contact });
    }

    function navExtractClick() {
        dispatch({ action: "nav_contacts_extract" });
    }

    function navChangePassClick() {
        dispatch({ action: "nav_contacts_changepass" });
    }

    function addContact(contact) {
        const contacts = [...state.contacts, contact];
        contacts.sort(sortContacts);
        dispatch({ action: "update_contacts", contacts: contacts });
    }

    function editContact(contact, oldName) {
        let contacts = [...state.contacts];
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].name == oldName) {
                contacts[i] = contact;
                break;
            }
        }
        contacts.sort(sortContacts);
        dispatch({ action: "update_contacts", contacts: contacts });
    }

    function deleteContact(oldName) {
        const contacts = [...state.contacts];
        let idx = -1;
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].name == oldName) {
                idx = i;
                break;
            }
        }
        if (idx != -1) {
            contacts.splice(idx, 1);
        }
        contacts.sort(sortContacts);
        dispatch({ action: "update_contacts", contacts: contacts });
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
                <div className="pt-3">
                    <a href="/">Refresh</a>
                </div>
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
        if (state.contactsNavState == contactsNavStates.genKey) {
            selectedPage = (
                <GenKeyPage
                    sendMessage={sendMessage}
                    generateKeyResult={state.generateKeyResult}
                    generateKeyLoading={state.generateKeyLoading}
                    contacts={state.contacts}
                    addContact={addContact}
                    backClick={navContactsClick}
                />
            );
        } else if (state.contactsNavState == contactsNavStates.addKey) {
            selectedPage = (<AddKeyPage contacts={state.contacts} addContact={addContact} backClick={navContactsClick} />);
        } else if (state.contactsNavState == contactsNavStates.editKey) {
            selectedPage = (<EditKeyPage contacts={state.contacts} contact={state.contactToEdit} editContact={editContact} backClick={navContactsClick} />);
        } else if (state.contactsNavState == contactsNavStates.deleteKey) {
            selectedPage = (<DeleteKeyPage contact={state.contactToDelete} deleteContact={deleteContact} backClick={navContactsClick} />);
        } else if (state.contactsNavState == contactsNavStates.extract) {
            selectedPage = (
                <ExtractPage
                    sendMessage={sendMessage}
                    extractKeyResult={state.extractKeyResult}
                    extractKeyLoading={state.extractKeyLoading}
                    backClick={navContactsClick}
                />
            );
        } else if (state.contactsNavState == contactsNavStates.changePass) {
            selectedPage = (<ChangePassPage />);
        } else {
            selectedPage = (
                <ContactsPage
                    navGenKeyClick={navGenKeyClick}
                    navAddKeyClick={navAddKeyClick}
                    navExtractClick={navExtractClick}
                    navChangePassClick={navChangePassClick}>
                        <ContactList contacts={state.contacts} editKeyClick={navEditKeyClick} deleteKeyClick={navDeleteKeyClick} />
                </ContactsPage>
            );
        }
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
