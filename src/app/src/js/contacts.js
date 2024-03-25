
export function GenKeyPage({ navContactsClick }) {
    return (
        <div>
            <h4>Generate Key</h4>
            <button onClick={navContactsClick}>
                <span className="icon icon-back"></span>
                <span>Contacts</span>
            </button>
        </div>
    );
}

export function ContactsPage({ navGenKeyClick }) {
    return (
        <div>
            <h4>Contacts</h4>
            <button onClick={navGenKeyClick}>Generate Key</button>
        </div>
    );
}
