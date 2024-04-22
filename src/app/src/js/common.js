
export const ANIMATION_DURATION = 200;

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
                    <span className="icon icon-download"></span>
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

export function SelectBox({ options, onChange, id, disabled }) {
    const optionValues = options.map(option => (
        <option key={option.value} value={option.value}>
            {option.display}
        </option>
    ));

    return (
        <select className="pt-1" id={id} name={id} onChange={e => onChange(e.target.value)} disabled={disabled}>
            {optionValues}
        </select>
    );
}