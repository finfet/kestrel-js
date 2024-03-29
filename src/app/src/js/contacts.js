import { useState } from "react";

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

    const addDisabled = hasError;

    function nameChange(event) {
        setHasError(false);
        setName(event.target.value);
    }

    function publicKeyChange(event) {
        setHasError(false);
        setPublicKey(event.target.value);
    }

    function privateKeyChange(event) {
        setHasError(false);
        setPrivateKey(event.target.value);
    }

    function addClick() {
        if (name.length < 1) {
            setHasError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        // TODO: Strip any blanks or newlines in the public/private key input

        for (let i = 0; i < contacts.length; i++) {
            if (name == contacts[i].name) {
                setHasError(true);
                setErrorMsg("Contact name already exists");
                return;
            }
        }

        addContact({
            name: name,
            publicKey: publicKey,
            privateKey: privateKey
        });
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
                <textarea id="private-key" name="private-key" rows="3" value={privateKey} onChange={privateKeyChange} />
            </div>
            { (hasError == true) ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            <div className="pt-3">
                <button onClick={addClick} disabled={addDisabled}>Add</button>
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
