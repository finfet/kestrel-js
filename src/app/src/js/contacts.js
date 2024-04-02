import { useState } from "react";
import { base64Decode } from "kestrel-crypto/utils";

export function GenKeyPage() {
    return (
        <div>
            <h4>Generate Key</h4>
        </div>
    );
}

export function AddKeyPage({ contacts, addContact }) {
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

    function doneClick() {
        setContactAdded(false);
        setHasError(false);
        setSuccess(false);
        setPublicKey("");
        setPrivateKey("");
        setName("");
    }

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

    return (
        <div>
            <h4>Add Key</h4>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="public-key">Public Key</label>
                <textarea id="public-key" name="public-key" rows="3" value={publicKey} onChange={publicKeyChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="private-key">Private Key</label>
                <textarea id="private-key" name="private-key" rows="6" value={privateKey} onChange={privateKeyChange} />
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
                    <></>
                )
            }
            <div className="row-container pt-3">
                <div>
                    <button onClick={addClick} disabled={addDisabled}>Add</button>
                </div>
                { (contactAdded == true) ? (
                    <div>
                        <button onClick={doneClick}>Done</button>
                    </div>
                ) : (
                    <></>
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

function ContactList({ contacts }) {
    const contactItems = contacts.map(contact =>
        <div key={contact.publicKey}>
            <div className="contact-actions row-container">
                <div><button className="link-button">Delete</button></div>
                <div><button className="link-button">Edit</button></div>
            </div>
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
    navChangePassClick, contacts
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
                    <button className="link-button" onClick={navExtractClick}>Extract Key</button>
                </div>
                <div>
                    <button className="link-button" onClick={navChangePassClick}>Change Password</button>
                </div>
            </div>
            <div className="pt-2">
                <ContactList contacts={contacts} />
            </div>
        </div>
    );
}
