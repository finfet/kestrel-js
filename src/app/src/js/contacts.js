import { useState } from "react";

export function GenKeyPage() {
    return (
        <div>
            <h4>Generate Key</h4>
        </div>
    );
}

export function AddKeyPage() {
    const [name, setName] = useState("");
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const addDisabled = hasError;

    function nameChange(event) {
        setHasError(false);
        setName(event.target.value);
    }

    function addClick(event) {
        if (name.length < 1) {
            setHasError(true);
            setErrorMsg("Please enter a name");
            return;
        }

        console.log("Adding key:", name);
    }

    return (
        <div>
            <h4>Add Key</h4>
            <div className="form-group pt-3">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" value={name} onChange={nameChange} />
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
        <div>
            <div className="contact-actions row-container">
                <div style={{margin: "auto"}}></div>
                <div><button className="link-button">Edit</button></div>
                <div><button className="link-button">Delete</button></div>
            </div>
            <div className="contact" key={contact.publicKey}>
                <ul>
                    <li className="text-bold">{contact.name}</li>
                    <li>Public Key</li>
                    <li><pre>{contact.publicKey}</pre></li>
                    <li>Private Key</li>
                    <li><pre>{contact.privateKey}</pre></li>
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

export function ContactsPage({ navGenKeyClick, navAddKeyClick, navExtractClick, navChangePassClick }) {
    const contacts = [
        {
            id: 0,
            name: "Alice",
            publicKey: "D7ZZstGYF6okKKEV2rwoUza/tK3iUa8IMY+l5tuirmzzkEog",
            privateKey: "ZWdrMPEp09tKN3rAutCDQTshrNqoh0MLPnEERRCm5KFxvXcTo+s/Sf2ze0fKebVsQilImvLzfIHRcJuX8kGetyAQL1VchvzHR28vFhdKeq+NY2KT"
        },
        {
            id: 1,
            name: "Bobby Bobertson",
            publicKey: "CT/e0R9tbBjTYUhDNnNxltT3LLWZLHwW4DCY/WHxBA8am9vP",
            privateKey: ""
        }
    ]

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
