import { useState, useRef } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

import { workerMsgActions } from "./state.js";
import { ResultInfo, MessageInfo, ANIMATION_DURATION } from "./common.js";

export function PassEncryptPage({ sendMessage, passEncryptResult, passEncryptLoading, reloadWorker }) {
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
    const showError = validationError;
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

    function encryptClick() {
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
            <MessageInfo showMsg={showError} msg={errorMsg} msgType="error" />
            <div className="pt-3 row-container">
                <div>
                    <button onClick={encryptClick} disabled={encryptDisabled}>Encrypt</button>
                </div>
                <ResultInfo
                    showSpinner={showSpinner}
                    resultShown={resultShown}
                    result={passEncryptResult}
                    doneClick={doneClick} />
            </div>
        </div>
    );
}

export function KeyEncryptPage() {
    return (
        <div>
            <h4>Encrypt with Key</h4>
        </div>
    );
}

