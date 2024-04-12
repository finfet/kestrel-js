import { useState, useEffect } from "react";
import { base64Decode, toUtf8Bytes } from "kestrel-crypto/utils";
import { workerMsgActions } from "./state";
import { ANIMATION_DURATION, ResultDone } from "./common";

function nameExists(name, contacts) {
    for (let i = 0; i < contacts.length; i++) {
        if (name == contacts[i].name) {
            return true;
        }
    }

    return false;
}

function publicKeyExists(pubKey, contacts) {
    for (let i = 0; i < contacts.length; i++) {
        if (pubKey == contacts[i].publicKey) {
            return true;
        }
    }

    return false;
}

function validPublicKey(pubKey) {
    try {
        let bytes = base64Decode(pubKey);
        if (bytes.length != 36) {
            return false;
        }
    } catch (_) {
        return false;
    }
    return true;
}

function validPrivateKey(privateKey) {
    try {
        let bytes = base64Decode(privateKey);
        if (bytes.length != 84) {
            return false;
        }
    } catch (_) {
        return false;
    }
    return true;
}

function BackButton({ backClick }) {
    return (
        <div className="row-container pb-3">
            <button className="link-button" onClick={backClick}><span className="icon icon-back"></span>Back</button>
        </div>
    );
}

export function GenKeyPage({ sendMessage, generateKeyResult, generateKeyLoading, addContact, backClick }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [showDone, setShowDone] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const showSpinner = generateKeyLoading || (anim.start && !anim.met);
    const generateDisabled = hasError || showSpinner || showDone;

    useEffect(() => {
        if (generateKeyResult && showDone) {
            const privateKey = generateKeyResult.privateKey;
            const publicKey = generateKeyResult.publicKey;
            console.log("Adding contact mallory");
            console.log("privateKey:", privateKey);
            console.log("publicKey :", publicKey);
        }
    }, [generateKeyResult, showDone]);

    function generateClick() {
        setAnim({ start: true, met: false });
        setHasError(false);
        setShowDone(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.generateKey, [toUtf8Bytes("mallory")]);
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Generate Key</h4>
            <div className="row-container pt-3">
                <div>
                    <button onClick={generateClick} disabled={generateDisabled}>Generate</button>
                </div>
                <ResultDone showSpinner={showSpinner} showDone={showDone} doneClick={backClick} />
            </div>
        </div>
    );
}

export function AddKeyPage({ contacts, addContact, backClick }) {
    const [name, setName] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [contactAdded, setContactAdded] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const addDisabled = hasError || contactAdded;

    function nameChange(event) {
        setContactAdded(false);
        setHasError(false);
        setName(event.target.value);
    }

    function publicKeyChange(event) {
        setContactAdded(false);
        setHasError(false);
        setPublicKey(event.target.value);
    }

    function privateKeyChange(event) {
        setContactAdded(false);
        setHasError(false);
        setPrivateKey(event.target.value);
    }

    function addClick() {
        if (name.length < 1) {
            setHasError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        const cleanedPubKey = publicKey.replaceAll("\n", "").replaceAll(" ", "");
        const cleanedPrivKey = privateKey.replaceAll("\n", "").replaceAll(" ", "");

        if (nameExists(name, contacts)) {
            setHasError(true);
            setErrorMsg("Contact name already exists");
            return;
        }

        if (publicKeyExists(cleanedPubKey, contacts)) {
            setHasError(true);
            setErrorMsg("Public key already exists");
            return;
        }

        if (!validPublicKey(cleanedPubKey)) {
            setHasError(true);
            setErrorMsg("Invalid public key");
            return;
        }

        if (cleanedPrivKey.length > 0 && !validPrivateKey(cleanedPrivKey)) {
            setHasError(true);
            setErrorMsg("Invalid private key");
            return;
        }

        setContactAdded(true);
        setSuccessMsg("Contact added");
        setSuccess(true);

        addContact({
            name: name,
            publicKey: cleanedPubKey,
            privateKey: cleanedPrivKey
        });
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Add Key</h4>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} disabled={contactAdded} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="public-key">Public Key</label>
                <textarea id="public-key" name="public-key" rows="3" value={publicKey} onChange={publicKeyChange} disabled={contactAdded} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="private-key">Private Key</label>
                <textarea id="private-key" name="private-key" rows="6" value={privateKey} onChange={privateKeyChange} disabled={contactAdded} />
            </div>
            { (hasError == true) ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            {
                (success == true) ? (
                    <div className="mt-3 success">{successMsg}</div>
                ) : (
                    <div className="mt-3 success hidden">OK</div>
                )
            }
            <div className="row-container pt-3">
                <div>
                    <button onClick={addClick} disabled={addDisabled}>Add</button>
                </div>
                { (contactAdded == true) ? (
                    <div>
                        <button onClick={backClick}>Done</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={backClick}>Cancel</button>
                    </div>
                )
                }
            </div>
        </div>
    );
}

export function EditKeyPage({ contacts, contact, editContact, backClick }) {
    const [name, setName] = useState(contact.name);
    const [publicKey, setPublicKey] = useState(contact.publicKey);
    const [privateKey, setPrivateKey] = useState(contact.privateKey);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [contactEdited, setContactEdited] = useState(false);
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const editDisabled = hasError || contactEdited;

    function nameChange(event) {
        setContactEdited(false);
        setHasError(false);
        setName(event.target.value);
    }

    function publicKeyChange(event) {
        setContactEdited(false);
        setHasError(false);
        setPublicKey(event.target.value);
    }

    function privateKeyChange(event) {
        setContactEdited(false);
        setHasError(false);
        setPrivateKey(event.target.value);
    }

    function editClick() {
        if (name.length < 1) {
            setHasError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        const cleanedPubKey = publicKey.replaceAll("\n", "").replaceAll(" ", "");
        const cleanedPrivKey = privateKey.replaceAll("\n", "").replaceAll(" ", "");

        if (nameExists(name, contacts) && name != contact.name) {
            setHasError(true);
            setErrorMsg("Contact name already exists");
            return;
        }

        if (publicKeyExists(cleanedPubKey, contacts) && cleanedPubKey != contact.publicKey) {
            setHasError(true);
            setErrorMsg("Public key already exists");
            return;
        }

        if (!validPublicKey(cleanedPubKey)) {
            setHasError(true);
            setErrorMsg("Invalid public key");
            return;
        }

        if (cleanedPrivKey.length > 0 && !validPrivateKey(cleanedPrivKey)) {
            setHasError(true);
            setErrorMsg("Invalid private key");
            return;
        }

        setContactEdited(true);
        setSuccessMsg("Contact updated");
        setSuccess(true);

        editContact({
            name: name,
            publicKey: cleanedPubKey,
            privateKey: cleanedPrivKey
        }, contact.name);
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Edit Key</h4>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} disabled={contactEdited} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="public-key">Public Key</label>
                <textarea id="public-key" name="public-key" rows="3" value={publicKey} onChange={publicKeyChange} disabled={contactEdited} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="private-key">Private Key</label>
                <textarea id="private-key" name="private-key" rows="6" value={privateKey} onChange={privateKeyChange} disabled={contactEdited} />
            </div>
            { (hasError == true) ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            {
                (success == true) ? (
                    <div className="mt-3 success">{successMsg}</div>
                ) : (
                    <div className="mt-3 success hidden">OK</div>
                )
            }
            <div className="row-container pt-3">
                <div>
                    <button onClick={editClick} disabled={editDisabled}>Edit</button>
                </div>
                { (contactEdited == true) ? (
                    <div>
                        <button onClick={backClick}>Done</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={backClick}>Cancel</button>
                    </div>
                )
                }
            </div>
        </div>
    );
}

export function DeleteKeyPage({ contact, deleteContact, backClick }) {
    const [deleteClicked, setDeleteClicked] = useState(false);
    const deleteMsg = "Contact deleted";

    function deleteClick() {
        setDeleteClicked(true);
        deleteContact(contact.name);
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4 className="pb-3">Delete Key</h4>
            { (deleteClicked == false) ? (
                <ContactCard contact={contact} />
            ) : (
                <div className="hidden">
                    <ContactCard contact={contact} />
                </div>
            )
            }
            { (deleteClicked == true) ? (
                    <div className="mt-3 error">{deleteMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            <div className="row-container pt-3">
                <div>
                    <button onClick={deleteClick} disabled={deleteClicked}>
                        <span className="icon icon-delete"></span>
                        <span>Delete</span>
                    </button>
                </div>
                { (deleteClicked == true) ? (
                    <div>
                        <button onClick={backClick}>Done</button>
                    </div>
                ) : (
                    <div>
                        <button onClick={backClick}>Cancel</button>
                    </div>
                )
                }
            </div>
        </div>
    );
}

export function ExtractPage() {
    return (
        <div>
            <h4>Extract Public Key</h4>
        </div>
    );
}

export function ChangePassPage() {
    return (
        <div>
            <h4>Change Password</h4>
        </div>
    )
}

function ContactCard({ contact }) {
    return (
        <div className="contact-card">
            <ul>
                <li className="text-bold">{contact.name}</li>
                <li>Public Key</li>
                <li><span className="text-mono">{contact.publicKey}</span></li>
                { !!contact.privateKey ? (
                        <>
                        <li>Private Key</li>
                        <li><span className="text-mono">{contact.privateKey}</span></li>
                        </>
                    ) : (
                        <></>
                    )
                }
            </ul>
        </div>
    );
}

export function ContactList({ contacts, editKeyClick, deleteKeyClick }) {
    const contactItems = contacts.map(contact =>
        <div key={contact.publicKey}>
            <div className="contact-actions row-container">
                <div><button onClick={() => deleteKeyClick(contact)} className="link-button">Delete</button></div>
                <div><button onClick={() => editKeyClick(contact)} className="link-button">Edit</button></div>
            </div>
            <ContactCard contact={contact} />
        </div>
    );

    if (contactItems.length < 1) {
        return (<p className="pt-4">No contacts yet. Try generating a new key.</p>);
    }

    return (
        <>
            {contactItems}
        </>
    );
}

export function ContactsPage({
    navGenKeyClick, navAddKeyClick, navExtractClick,
    navChangePassClick, children
}) {
    return (
        <div>
            <h4>Contacts</h4>
            <div className="pt-3 row-container">
                <div>
                    <button className="link-button" onClick={navAddKeyClick}>Add Key</button>
                </div>
                <div>
                    <button className="link-button" onClick={navGenKeyClick}>Generate Key</button>
                </div>
                <div>
                    <button className="link-button" onClick={navExtractClick}>Extract Public Key</button>
                </div>
                <div>
                    <button className="link-button" onClick={navChangePassClick}>Change Password</button>
                </div>
            </div>
            <div className="pt-2">
                {children}
            </div>
        </div>
    );
}
