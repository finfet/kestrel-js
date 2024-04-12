
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

export function ErrorInfo({ showError, errorMsg }) {
    if (showError) {
        return (
            <div className="mt-3 error">Error: {errorMsg}</div>
        );
    } else {
        return (
            <div className="mt-3 error hidden">OK</div>
        );
    }
}

export function ResultDone({ showSpinner, showDone, doneClick }) {
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

    return (<></>);
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
