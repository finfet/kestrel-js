import { useState, useEffect } from "react";
import { base64Decode, toUtf8Bytes } from "kestrel-crypto/utils";
import { workerMsgActions } from "./state";
import { ANIMATION_DURATION, MessageInfo, ResultDone, SelectBox, DeleteIcon, BackIcon } from "./common";

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
    } catch {
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
    } catch {
        return false;
    }
    return true;
}

function BackButton({ backClick }) {
    return (
        <div className="row-container pb-3">
            <div>
                <button className="link-button" onClick={backClick}>
                    <BackIcon />
                    <span>Back</span>
                </button>
            </div>
        </div>
    );
}

export function GenKeyPage({ sendMessage, generateKeyResult, generateKeyLoading, contacts, addContact, backClick }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [showDone, setShowDone] = useState(false);
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const showSpinner = generateKeyLoading || (anim.start && !anim.met);
    const showError = validationError && !success;
    const showSuccess = success && showDone && !showSpinner && !validationError;
    const inputDisabled = showSpinner || showDone;
    const generateDisabled = validationError || showSpinner || showDone;

    useEffect(() => {
        if (generateKeyResult && showDone) {
            const privateKey = generateKeyResult.privateKey;
            const publicKey = generateKeyResult.publicKey;
            addContact({
                name: name,
                publicKey: publicKey,
                privateKey: privateKey,
            });
        }
    }, [generateKeyResult, showDone]);

    function nameChange(event) {
        setValidationError(false);
        setName(event.target.value);
    }

    function passwordChange(event) {
        setValidationError(false);
        setPassword(event.target.value);
    }

    function confirmPasswordChange(event) {
        setValidationError(false);
        setConfirmPassword(event.target.value);
    }

    function generateClick(event) {
        event.preventDefault();
        if (name.length < 1) {
            setValidationError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        if (name.length > 128) {
            setHasError(true);
            setErrorMsg("Names must be less than 128 characters");
            return;
        }

        if (nameExists(name, contacts)) {
            setValidationError(true);
            setErrorMsg("Contact name already exists");
            return;
        }

        if (password != confirmPassword) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }

        setAnim({ start: true, met: false });
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.generateKey, [toUtf8Bytes(password)]);
        setShowDone(true);
        setSuccess(true);
        setSuccessMsg("Key generated");
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Generate Key</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} disabled={inputDisabled} autoFocus />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} disabled={inputDisabled} />
            </div>
            <div className="form-group pt-1">
                <label htmlFor="confirm-password">Confirm</label>
                <input type="password" id="confirm-password" name="confirm-password" value={confirmPassword} onChange={confirmPasswordChange} disabled={inputDisabled} />
            </div>
            { showError ? (
                <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            ) : (
                <MessageInfo showMsg={showSuccess} msg={successMsg} msgType="success" />
            )}
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={generateClick} disabled={generateDisabled}>Generate</button>
                </div>
                <ResultDone showSpinner={showSpinner} showDone={showDone} doneClick={backClick} backClick={backClick} />
            </div>
            </form>
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

    const showError = hasError && !success;
    const showSuccess = success && !hasError;
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

    function addClick(event) {
        event.preventDefault();
        if (name.length < 1) {
            setHasError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        if (name.length > 128) {
            setHasError(true);
            setErrorMsg("Names must be less than 128 characters");
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
            <form>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} disabled={contactAdded} autoFocus />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="public-key">Public Key</label>
                <textarea id="public-key" name="public-key" rows="3" value={publicKey} onChange={publicKeyChange} disabled={contactAdded} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="private-key">Private Key (optional)</label>
                <textarea id="private-key" name="private-key" rows="6" value={privateKey} onChange={privateKeyChange} disabled={contactAdded} />
            </div>
            { showError ? (
                <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            ) : (
                <MessageInfo showMsg={showSuccess} msg={successMsg} msgType="success" />
            )}
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={addClick} disabled={addDisabled}>Add</button>
                </div>
                { contactAdded ? (
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
            </form>
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

    function editClick(event) {
        event.preventDefault();
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
            <form>
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
                    <button type="submit" onClick={editClick} disabled={editDisabled}>Edit</button>
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
            </form>
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
                        <DeleteIcon />
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

export function ExtractPage({ sendMessage, extractKeyResult, extractKeyLoading, backClick }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [showDone, setShowDone] = useState(false);
    const [privateKey, setPrivateKey] = useState("");
    const [password, setPassword] = useState("");
    const [hasError, setHasError] = useState(false);
    const [validationError, setValidationError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const showError = validationError || hasError;

    const showSpinner = extractKeyLoading || (anim.start && !anim.met);
    const extractDisabled = hasError || showSpinner || showDone;
    const inputDisabled = showSpinner || showDone;

    useEffect(() => {
        if (extractKeyResult && extractKeyResult.exception) {
            let ex = extractKeyResult.exception;
            setHasError(true);
            setSuccess(false);
            setShowDone(false);
            if (ex.name == "ChaPolyDecryptError") {
                setErrorMsg("Decrypt Failed. Check password used.");
            } else {
                setErrorMsg(ex.message);
            }
        } else if (extractKeyResult && showDone) {
            setSuccess(true);
            setSuccessMsg(extractKeyResult.publicKey);
        }
    }, [extractKeyResult, showDone]);

    function inputFocus(_event) {
        setHasError(false);
    }

    function privateKeyChange(event) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setPrivateKey(event.target.value);
    }

    function passwordChange(event) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setPassword(event.target.value);
    }

    function extractClick(event) {
        event.preventDefault();
        const cleanedPrivKey = privateKey.replaceAll("\n", "").replaceAll(" ", "");
        if (cleanedPrivKey.length < 1) {
            setValidationError(true);
            setErrorMsg("Please enter a private key");
            return;
        }

        if (!validPrivateKey(cleanedPrivKey)) {
            setValidationError(true);
            setErrorMsg("Invalid private key");
            return;
        }

        setAnim({ start: true, met: false });
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.extractKey, [cleanedPrivKey, toUtf8Bytes(password)]);
        setShowDone(true);
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Extract Public Key</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="private-key">Private Key</label>
                <textarea id="private-key" name="private-key"
                    rows="6" value={privateKey}
                    onChange={privateKeyChange} disabled={inputDisabled}
                    onFocus={inputFocus} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password"
                    name="password" value={password}
                    onChange={passwordChange} disabled={inputDisabled}
                    onFocus={inputFocus} />
            </div>
            { success ? (
                <div className="pt-3">
                    <ul className="minimal-ul">
                        <li>Public Key</li>
                        <li><span className="text-mono" style={{ textOverflow: "auto" }}>{successMsg}</span></li>
                    </ul>
                </div>
            ) : (
                <div className="pt-3 hidden">
                    <ul className="minimal-ul">
                        <li>Public Key</li>
                        <li><span className="text-mono" style={{ textOverflow: "auto" }}>EMPTY</span></li>
                    </ul>
                </div>
            )}
            <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={extractClick} disabled={extractDisabled}>Extract</button>
                </div>
                <ResultDone showSpinner={showSpinner} showDone={showDone} doneClick={backClick} backClick={backClick} />
            </div>
            </form>
        </div>
    );
}

export function ChangePassPage({ sendMessage, contacts, changePassResult, changePassLoading, changeContactPass, backClick }) {
    const [contactName, setContactName] = useState("");
    const [currentPass, setCurrentPass] = useState("");
    const [updatedPass, setUpdatedPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [anim, setAnim] = useState({ start: false, met: false });
    const [showDone, setShowDone] = useState(false);
    const [validationError, setValidationError] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const showError = validationError || hasError;
    const showSpinner = changePassLoading || (anim.start && !anim.met);
    const changePassDisabled = hasError || showSpinner || showDone;
    const inputDisabled = showSpinner || showDone;

    const validContacts = contacts.filter(contact => contact.privateKey != "")
        .map(contact => {
            return {
                display: contact.name,
                value: contact.name
            };
        });

    const blankContact = [{ display: "Select Key", value: "" }];
    const contactNames = blankContact.concat(validContacts);

    useEffect(() => {
        if (changePassResult && changePassResult.exception) {
            let ex = changePassResult.exception;
            setHasError(true);
            setSuccess(false);
            setShowDone(false);
            if (ex.name == "ChaPolyDecryptError") {
                setErrorMsg("Decrypt Failed. Check password used.");
            } else {
                setErrorMsg(ex.message);
            }
        } else if (changePassResult && showDone) {
            setSuccess(true);
            setSuccessMsg("Contact updated");
            changeContactPass(changePassResult.privateKey, contactName);
        }
    }, [changePassResult, showDone]);

    function contactNameChange(name) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setContactName(name);
    }

    function currentPassChange(event) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setCurrentPass(event.target.value);
    }

    function updatedPassChange(event) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setUpdatedPass(event.target.value);
    }

    function confirmPassChange(event) {
        setValidationError(false);
        setHasError(false);
        setSuccess(false);
        setConfirmPass(event.target.value);
    }

    function inputFocus(_event) {
        setHasError(false);
    }

    function changePassClick(event) {
        event.preventDefault();
        if (contactName == "") {
            setValidationError(true);
            setErrorMsg("Please select a key");
            return;
        }

        if (updatedPass != confirmPass) {
            setValidationError(true);
            setErrorMsg("Passwords do not match");
            return;
        }

        let privateKey = null;
        for (let i = 0; i < contacts.length; i++) {
            if (contacts[i].name == contactName) {
                privateKey = contacts[i].privateKey;
                break;
            }
        }

        if (!privateKey) {
            setValidationError(true);
            setErrorMsg("Private key not found");
            return;
        }

        setAnim({ start: true, met: false });
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.changePass, [privateKey, toUtf8Bytes(currentPass), toUtf8Bytes(updatedPass)]);
        setShowDone(true);
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Change Password</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="select-contact">Private Key</label>
                <SelectBox options={contactNames} onChange={contactNameChange} id="select-key" disabled={inputDisabled} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="current-password">Current Password</label>
                <input type="password" id="current-password"
                    name="current-password" value={currentPass}
                    onChange={currentPassChange} disabled={inputDisabled}
                    onFocus={inputFocus} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="updated-password">New Password</label>
                <input type="password" id="updated-password"
                    name="updated-password" value={updatedPass}
                    onChange={updatedPassChange} disabled={inputDisabled}
                    onFocus={inputFocus} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password"
                    name="confirm-password" value={confirmPass}
                    onChange={confirmPassChange} disabled={inputDisabled}
                    onFocus={inputFocus} />
            </div>
            { showError ? (
                <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            ) : (
                <MessageInfo showMsg={success} msg={successMsg} msgType="success" />
            )}
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={changePassClick} disabled={changePassDisabled}>Save</button>
                </div>
                <ResultDone showSpinner={showSpinner} showDone={showDone} doneClick={backClick} backClick={backClick} />
            </div>
            </form>
        </div>
    );
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
