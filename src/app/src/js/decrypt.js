import { useState, useEffect, useRef } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

import { workerMsgActions } from "./state.js";
import {
    ResultInfo, MessageInfo, ANIMATION_DURATION,
    createNameSelect, SelectBox, getPrivateKey,
    s100MiB, BackButton
} from "./common.js";

export function PassDecryptPage({ sendMessage, passDecryptResult, passDecryptLoading, reloadWorker, backClick }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const fileInputField = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [fileSize, setFileSize] = useState(0);
    const [ciphertextFile, setCiphertextFile] = useState(null);
    const [password, setPassword] = useState("");

    const showSpinner = passDecryptLoading || (anim.start && !anim.met);
    const decryptDisabled = showSpinner || resultShown;
    const showError = hasError && !showSpinner;

    // 200MiB + file format overhead (32 bytes per 64k + 36 byte header)
    const overhead = (512 * 1024) + 36;
    const maxFileSize = (2 * s100MiB) + overhead;

    useEffect(() => {
        if (passDecryptResult && passDecryptResult.exception) {
            let ex = passDecryptResult.exception;
            setHasError(true);
            setResultShown(false);
            if (ex.name == "DecryptError::ChaPolyDecrypt") {
                setErrorMsg("Decrypt Failed. Check password used.");
            } else {
                setErrorMsg(ex.message);
            }
        }
        return () => {
            if (passDecryptResult && !passDecryptResult.exception) {
                URL.revokeObjectURL(passDecryptResult.url);
            }
        }
    }, [passDecryptResult]);

    function fileChange(event) {
        const file = event.target.files[0];
        setHasError(false);
        setFileSize(file.size);
        setCiphertextFile(file);
    }

    function passwordChange(event) {
        setHasError(false);
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
            setErrorMsg("File is too large. Maximum is 200MB");
            return;
        }

        setAnim({ start: true, met: false });
        setHasError(false);
        setResultShown(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.passDecrypt, [ciphertextFile, toUtf8Bytes(password)]);
    }

    function doneClick() {
        setAnim({ start: false, met: false });
        setResultShown(false);
        setCiphertextFile(null);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setPassword("");
        setHasError(false);
        setErrorMsg("");
        const lastFileSize = fileSize;
        setFileSize(0);
        if (lastFileSize > s100MiB) {
            reloadWorker();
        }
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Decrypt with Password</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="ciphertext-file">Select File</label>
                <input className="file-input" type="file" id="ciphertext-file" name="ciphertext-file" ref={fileInputField} onChange={fileChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} />
            </div>
            <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            <div className="pt-3 row-container">
                <div>
                    <button type="submit" onClick={decryptClick} disabled={decryptDisabled}>Decrypt</button>
                </div>
                <ResultInfo
                    showSpinner={showSpinner}
                    resultShown={resultShown}
                    result={passDecryptResult}
                    doneClick={doneClick} />
            </div>
            </form>
        </div>
    );
}

export function KeyDecryptPage({ sendMessage, contacts, keyDecryptResult, keyDecryptLoading, reloadWorker, backClick }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);
    const [fileSize, setFileSize] = useState(0);
    const fileInputField = useRef(null);

    const [ciphertextFile, setCiphertextFile] = useState(null);
    const [recipientName, setRecipientName] = useState("");
    const [password, setPassword] = useState("");

    const [senderPublicKey, setSenderPublicKey] = useState("");

    const [hasError, setHasError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const [warning, setWarning] = useState(false);
    const [warningMsg, setWarningMsg] = useState("");

    const showSpinner = keyDecryptLoading || (anim.start && !anim.met);
    const decryptDisabled = showSpinner || resultShown;
    const showError = hasError && !warning && !success && !showSpinner;
    const showSuccess = success && !warning && !hasError && resultShown && !showSpinner;
    const showWarning = warning && !success && !hasError && resultShown && !showSpinner;

    // 1GiB + file format overhead (32 bytes per 64k + 132 byte header)
    const overhead = (512 * 1024) + 132;
    const maxFileSize = (2 * s100MiB) + overhead;

    const recipientNames = createNameSelect(contacts, (contact => !!contact.privateKey));

    useEffect(() => {
        if (keyDecryptResult && keyDecryptResult.exception) {
            const err = keyDecryptResult.exception;
            setHasError(true);
            setResultShown(false);
            setErrorMsg(err.message);
        } else if (keyDecryptResult && resultShown) {
            setSenderPublicKey(keyDecryptResult.publicKey);
        }
        return () => {
            if (keyDecryptResult && !keyDecryptResult.exception) {
                URL.revokeObjectURL(keyDecryptResult.url);
            }
        }
    }, [keyDecryptResult]);

    useEffect(() => {
        if (!senderPublicKey) {
            return;
        }

        let contactName = "";
        for (let i = 0; i < contacts.length; i++) {
            if (senderPublicKey == contacts[i].publicKey) {
                contactName = contacts[i].name;
                break;
            }
        }

        if (contactName) {
            setSuccess(true);
            setSuccessMsg(`Success. File from: ${contactName}`);
        } else {
            setWarning(true);
            setWarningMsg("Caution. File is from an unknown key.");
        }
    }, [senderPublicKey]);

    function fileChange(event) {
        const file = event.target.files[0];
        setHasError(false);
        setFileSize(file.size);
        setCiphertextFile(file);
    }

    function recipientNameChange(name) {
        setHasError(false);
        setRecipientName(name);
    }

    function passwordChange(event) {
        setHasError(false);
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
            setErrorMsg("File is too large. Maximum is 200MB");
            return;
        }

        if (!recipientName) {
            setHasError(true);
            setErrorMsg("Please select a recipient");
            return;
        }

        const b64RecipientPrivate = getPrivateKey(contacts, recipientName);

        setAnim({ start: true, met: false });
        setHasError(false);
        setResultShown(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.keyDecrypt, [ciphertextFile, b64RecipientPrivate, toUtf8Bytes(password)]);
    }

    function doneClick() {
        setAnim({ start: false, met: false });
        setResultShown(false);
        setCiphertextFile(null);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setRecipientName("");
        setPassword("");
        setHasError(false);
        setSuccess(false);
        setWarning(false);
        const lastFileSize = fileSize;
        setFileSize(0);
        if (lastFileSize > s100MiB) {
            reloadWorker();
        }
    }

    return (
        <div>
            <BackButton backClick={backClick} />
            <h4>Decrypt with Key</h4>
            <form>
            <div className="form-group pt-3">
                <label htmlFor="ciphertext-file">Select File</label>
                <input className="file-input" type="file" id="ciphertext-file" name="ciphertext-file" ref={fileInputField} onChange={fileChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="select-recipient">To</label>
                <SelectBox options={recipientNames} value={recipientName} onChange={recipientNameChange} id="select-recipient" />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Unlock Key</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} />
            </div>
            { showError ? (
                <div className="mt-3 error">{errorMsg}</div>
            ) : (
                showWarning ? (
                    <div className="mt-3 warn">
                        {warningMsg}
                        <br/>
                        <code>{senderPublicKey}</code>
                    </div>
                ) : (
                    showSuccess ? (
                        <div className="mt-3 success">{successMsg}</div>
                    ) : (
                        <div className="mt-3 hidden">OK</div>
                    )
                )
            )}
            <div className="row-container pt-3">
                <div>
                    <button type="submit" onClick={decryptClick} disabled={decryptDisabled}>Decrypt</button>
                </div>
                <ResultInfo
                    showSpinner={showSpinner}
                    resultShown={resultShown}
                    result={keyDecryptResult}
                    doneClick={doneClick} />
            </div>
            </form>
        </div>
    );
}
