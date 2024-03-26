import { useState, useEffect, useRef } from "react";
import { toUtf8Bytes } from "kestrel-crypto/utils";

import { workerMsgActions } from "./state.js";
import { DotLoader, ANIMATION_DURATION } from "./components.js";

export function PassDecryptPage({ sendMessage, passDecryptResult, passDecryptLoading, reloadWorker }) {
    const [anim, setAnim] = useState({ start: false, met: false });
    const [resultShown, setResultShown] = useState(false);

    const fileInputField = useRef(null);
    const [hasError, setHasError] = useState(false);
    const [decryptError, setDecryptError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [fileSize, setFileSize] = useState(0);
    const [ciphertextFile, setCiphertextFile] = useState(null);
    const [password, setPassword] = useState("");

    const showSpinner = passDecryptLoading || (anim.start && !anim.met);
    const decryptDisabled = hasError || showSpinner || resultShown;

    // 1GiB + file format overhead (32 bytes per 64k + 36 byte header)
    const s100MiB = 100 * (1024 * 1024);
    const s1GiB = 1024 * (1024 * 1024);
    const overhead = (512 * 1024) + 36;
    const maxFileSize = s1GiB + overhead;

    useEffect(() => {
        if (passDecryptResult && passDecryptResult.exception) {
            let ex = passDecryptResult.exception;
            setDecryptError(true);
            setResultShown(false);
            if (ex.name == "DecryptError::ChaPolyDecrypt") {
                setErrorMsg("Decrypt Failed. Check password used.");
            } else {
                setErrorMsg(ex.message);
            }
        }
    }, [passDecryptResult]);

    function fileChange(event) {
        const file = event.target.files[0];
        setHasError(false);
        setDecryptError(false);
        setFileSize(file.size);
        setCiphertextFile(file);
    }

    function passwordChange(event) {
        setHasError(false);
        setDecryptError(false);
        setPassword(event.target.value);
    }

    function decryptClick() {
        if (!ciphertextFile) {
            setHasError(true);
            setErrorMsg("Please select a file");
            return;
        }

        if (fileSize > maxFileSize) {
            setHasError(true);
            setErrorMsg("File is too large. Maximum 1GB");
            return;
        }

        setAnim({ start: true, met: false });
        setHasError(false);
        setDecryptError(false);
        setResultShown(true);
        setTimeout(() => {
            setAnim({ start: false, met: true });
        }, ANIMATION_DURATION);

        sendMessage(workerMsgActions.passDecrypt, [ciphertextFile, toUtf8Bytes(password)]);
    }

    function doneClick() {
        if (passDecryptResult && passDecryptResult.url) {
            URL.revokeObjectURL(passDecryptResult.url);
        }
        setAnim({ start: false, met: false });
        setResultShown(false);
        setCiphertextFile(null);
        if (fileInputField) {
            fileInputField.current.value = "";
        }
        setPassword("");
        setHasError(false);
        setErrorMsg("");
        if (fileSize > s100MiB) {
            reloadWorker();
        }
        setFileSize(0);
    }

    return (
        <div>
            <h4>Decrypt with Password</h4>
            <div className="form-group pt-3">
                <label htmlFor="ciphertext-file">Select File</label>
                <input className="file-input" type="file" id="ciphertext-file" name="ciphertext-file" ref={fileInputField} onChange={fileChange} />
            </div>
            <div className="form-group pt-3">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" value={password} onChange={passwordChange} />
            </div>
            { (hasError || decryptError) ? (
                    <div className="mt-3 error">Error: {errorMsg}</div>
                ) : (
                    <div className="mt-3 error hidden">OK</div>
                )
            }
            <div className="pt-3 row-container">
                <div>
                    <button onClick={decryptClick} disabled={decryptDisabled}>Decrypt</button>
                </div>
                { showSpinner ? (
                        <div className="pt-2">
                            <DotLoader classes={"ml-1 mt-1"} />
                        </div>
                    ) : (
                        <>
                        { resultShown ? (
                            <>
                            <div className="pt-2">
                                <a href={passDecryptResult.url} download={passDecryptResult.filename}>
                                    <span className="icon icon-download"></span>
                                    <span>{passDecryptResult.filename}</span>
                                </a>
                            </div>
                            <div>
                                <button onClick={doneClick}>Done</button>
                            </div>
                            </>
                            ) : (
                                <></>
                            )
                        }
                        </>
                    )
                }
            </div>
        </div>
    );
}

export function KeyDecryptPage() {
    return (
        <div>
            <h4>Decrypt with Key</h4>
        </div>
    );
}
