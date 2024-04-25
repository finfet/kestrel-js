
export const ANIMATION_DURATION = 200;

export function DownloadIcon() {
    return (
        <span className="icon icon-download">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
        </span>
    );
}

export function BackIcon() {
    return (
        <span className="icon icon-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </span>
    );
}

export function DeleteIcon() {
    return (
        <span className="icon icon-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </span>
    );
}

export function DotLoader({ classes }) {
    if (!classes) {
        classes = "";
    }
    return (
        <div className={`dot-loader ${classes}`}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}

export function MessageInfo({ showMsg, msg, msgType }) {
    const showClasses = "mt-3 " + msgType;
    const hideClasses = "mt-3 hidden " + msgType;
    let msgFmt = msg;
    if (msgType == "error") {
        msgFmt = "Error: " + msg;
    }

    if (showMsg) {
        return (
            <div className={showClasses}>{msgFmt}</div>
        );
    } else {
        return (
            <div className={hideClasses}>OK</div>
        );
    }
}

export function ResultDone({ showSpinner, showDone, doneClick, backClick }) {
    if (showSpinner) {
        return (
            <div className="pt-2">
                <DotLoader classes={"ml-1 mt-1"} />
            </div>
        );
    }

    if (showDone) {
        return (
            <div>
                <button onClick={doneClick}>Done</button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={backClick}>Cancel</button>
        </div>
    );
}

export function ResultInfo({ showSpinner, resultShown, result, doneClick }) {
    if (showSpinner) {
        return (
            <div className="pt-2">
                <DotLoader classes={"ml-1 mt-1"} />
            </div>
        );
    }

    if (resultShown) {
        return (
            <>
            <div className="pt-2">
                <a href={result.url} download={result.filename}>
                    <DownloadIcon />
                    <span>{result.filename}</span>
                </a>
            </div>
            <div>
                <button onClick={doneClick}>Done</button>
            </div>
            </>
        );
    }

    return (<></>);
}

export function SelectBox({ options, onChange, id, disabled, autoFocus, onFocus }) {
    const optionValues = options.map(option => (
        <option key={option.value} value={option.value}>
            {option.display}
        </option>
    ));

    return (
        <select className="pt-1" id={id} name={id} onChange={e => onChange(e.target.value)} disabled={disabled} autoFocus={autoFocus} onFocus={onFocus}>
            {optionValues}
        </select>
    );
}