import { useState, useRef } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

import { workerMsgActions } from "./state.js";
import { ResultInfo, MessageInfo, ANIMATION_DURATION, SelectBox } from "./common.js";

export function PassEncryptPage({ sendMessage, passEncryptResult, passEncryptLoading, reloadWorker }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const [plaintextFile, setPlaintextFile] = useState(null);
    const [fileSize, setFileSize] = useState(0);
    const fileInputField = useRef(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const showSpinner = passEncryptLoading || (anim.start && !anim.met);
    const encryptDisabled = showSpinner || resultShown;
    const showError =  hasError && !showSpinner;
    const s100MiB = 100 * (1024 * 1024);
    const s1GiB = 1024 * (1024 * 1024);
    const maxFileSize = s1GiB;

    function fileChange(event) {
        const file = event.target.files[0];
        setHasError(false);
        setFileSize(file.size);
        setPlaintextFile(file);
    }

    function passwordChange(event) {
        setHasError(false);
        setPassword(event.target.value);
    }

    function confirmPasswordChange(event) {
        setHasError(false);
        setConfirmPassword(event.target.value);
    }

    function encryptClick() {
        if (!plaintextFile) {
            setHasError(true);
            setErrorMsg("Please select a file");
            return;
        }
        if (fileSize > maxFileSize) {
            setHasError(true);
            setErrorMsg("File is too large. Maximum is 1GB");
            return;
        }
        if (password != confirmPassword) {
            setHasError(true);
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

    function doneClick(event) {
        event.preventDefault();
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
        setHasError(false);
        setErrorMsg("");
        if (fileSize > s100MiB) {
            reloadWorker();
        }
        setFileSize(0);
    }

    return (
        <div>
            <h4>Encrypt with Password</h4>
            <form>
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
            <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            <div className="pt-3 row-container">
                <div>
                    <button type="submit" onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                </div>
                <ResultInfo
                    showSpinner={showSpinner}
                    resultShown={resultShown}
                    result={passEncryptResult}
                    doneClick={doneClick} />
            </div>
            </form>
        </div>
    );
}

export function KeyEncryptPage({ sendMessage, contacts, keyEncryptResult, keyEncryptLoading, reloadWorker }) {
    const [recipientName, setRecipientName] = useState("");
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const showError =  hasError && !showSpinner;
    const showSpinner = keyEncryptLoading || (anim.start && !anim.met);
    const encryptDisabled = showSpinner || resultShown;

    const validRecipients = contacts.filter(contact => contact.publicKey != "")
        .map(contact => {
            return {
                display: contact.name,
                value: contact.name
            };
        });
    const blankContact = [{ display: "Select Key", value: "" }];
    const recipientNames = blankContact.concat(validRecipients);

    function recipientNameChange(name) {
        setHasError(false);
        setRecipientName(name);
    }

    function encryptClick(event) {
        event.preventDefault();
        if (recipientName == "") {
            setHasError(true);
            setErrorMsg("Please select a recipient");
            return;
        }

        setAnim({ start: true, met: false });
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        console.log("encrypting with key...");
        setResultShown(true);
    }

    return (
        <div>
            <h4>Encrypt with Key</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="select-recipient">To</label>
                <SelectBox options={recipientNames} onChange={recipientNameChange} id="select-recipient" autoFocus />
            </div>
            <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                </div>
            </div>
            </form>
        </div>
    );
}

