export const workerMsgActions = {
    passEncrypt: "pass_encrypt",
    passDecrypt: "pass_decrypt",
    keyEncrypt: "key_encrypt",
    keyDecrypt: "key_decrypt",
    generateKey: "generate_key",
    extractKey: "extract_key",
    changePass: "change_pass",
}

export const appNavStates = {
    encrypt: 0,
    decrypt: 1,
    contacts: 2
}

export const encryptNavStates = {
    start: 0,
    key: 1,
    pass: 2
}

export const decryptNavStates = {
    start: 0,
    key: 1,
    pass: 2
}

export const contactsNavStates = {
    start: 0,
    genKey: 1,
    addKey: 2,
    editKey: 3,
    deleteKey: 4,
    extract: 5,
    changePass: 6
}

export const initialState = {
    appNavState: appNavStates.encrypt,
    currentHash: "#/encrypt",
    encryptNavState: encryptNavStates.start,
    decryptNavState: decryptNavStates.start,
    contactsNavState: contactsNavStates.start,
    contactToDelete: null,
    contactToEdit: null,
    contactsInit: false,
    contacts: [], // Array of { name: "", publicKey: "", privateKey: "" }
    worker: null,
    workerAnimStart: false,
    workerAnimMet: false,
    workerLoading: false,
    workerReload: false,
    hasError: null,
    notFound: false,
    passEncryptResult: null,
    passEncryptLoading: false,
    passDecryptResult: null,
    passDecryptLoading: false,
    keyEncryptResult: null,
    keyEncryptLoading: false,
    keyDecryptResult: null,
    keyDecryptLoading: false,
    generateKeyResult: null,
    generateKeyLoading: false,
    extractKeyResult: null,
    extractKeyLoading: false,
    changePassResult: null,
    changePassLoading: false
}

export function reducer(state, action) {
    if (action.action == "send" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            hasError: null,
            passEncryptResult: null,
            passEncryptLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.passDecrypt) {
        return {
            ...state,
            hasError: null,
            passDecryptResult: null,
            passDecryptLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.keyEncrypt) {
        return {
            ...state,
            hasError: null,
            keyEncryptResult: null,
            keyEncryptLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.keyDecrypt) {
        return {
            ...state,
            hasError: null,
            keyDecryptResult: null,
            keyDecryptLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.generateKey) {
        return {
            ...state,
            hasError: null,
            generateKeyResult: null,
            generateKeyLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.extractKey) {
        return {
            ...state,
            hasError: null,
            extractKeyResult: null,
            extractKeyLoading: true
        };
    } else if (action.action == "send" && action.msg.action == workerMsgActions.changePass) {
        return {
            ...state,
            hasError: null,
            changePassResult: null,
            changePassLoading: true
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.passEncrypt) {
        return {
            ...state,
            passEncryptResult: action.msg.result,
            passEncryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.passDecrypt) {
        return {
            ...state,
            passDecryptResult: action.msg.result,
            passDecryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.keyEncrypt) {
        return {
            ...state,
            keyEncryptResult: action.msg.result,
            keyEncryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.keyDecrypt) {
        return {
            ...state,
            keyDecryptResult: action.msg.result,
            keyDecryptLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.generateKey) {
        return {
            ...state,
            generateKeyResult: action.msg.result,
            generateKeyLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.extractKey) {
        return {
            ...state,
            extractKeyResult: action.msg.result,
            extractKeyLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == workerMsgActions.changePass) {
        return {
            ...state,
            changePassResult: action.msg.result,
            changePassLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == "init") {
        return {
            ...state,
            workerLoading: false
        };
    } else if (action.action == "recv" && action.msg.action == "exception") {
        return {
            ...state,
            hasError: action.msg.result
        };
    } else if (action.action == "reload_worker") {
        let reload = true;
        if (state.workerReload) {
            reload = false;
        }
        return {
            ...state,
            workerReload: reload
        };
    } else if (action.action == "worker_load_start") {
        return {
            ...state,
            worker: action.worker,
            workerLoading: true,
            workerAnimStart: true,
            workerAnimMet: false
        };
    } else if (action.action == "worker_load_end") {
        return {
            ...state,
            workerAnimStart: false,
            workerAnimMet: true
        };
    } else if (action.action == "worker_terminate") {
        return {
            ...state,
            worker: null,
        };
    } else if (action.action == "nav_encrypt_clicked") {
        return {
            ...state,
            currentHash: "#/encrypt",
            notFound: false,
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.start
        };
    } else if (action.action == "nav_decrypt_clicked") {
        return {
            ...state,
            currentHash: "#/decrypt",
            notFound: false,
            appNavState: appNavStates.decrypt,
            decryptNavState: decryptNavStates.start
        };
    } else if (action.action == "nav_contacts_clicked") {
        return {
            ...state,
            currentHash: "#/contacts",
            notFound: false,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.start
        };
    } else if (action.action == "nav_encrypt_select_key") {
        return {
            ...state,
            currentHash: "#/key-encrypt",
            notFound: false,
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.key
        };
    } else if (action.action == "nav_encrypt_select_pass") {
        return {
            ...state,
            currentHash: "#/pass-encrypt",
            notFound: false,
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.pass
        };
    } else if (action.action == "nav_decrypt_select_key") {
        return {
            ...state,
            currentHash: "#/key-decrypt",
            notFound: false,
            appNavState: appNavStates.decrypt,
            decryptNavState: decryptNavStates.key
        };
    } else if (action.action == "nav_decrypt_select_pass") {
        return {
            ...state,
            currentHash: "#/pass-decrypt",
            notFound: false,
            appNavState: appNavStates.decrypt,
            decryptNavState: decryptNavStates.pass
        };
    } else if (action.action == "nav_contacts_genkey") {
        return {
            ...state,
            currentHash: "#/gen-key",
            notFound: false,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.genKey
        };
    } else if (action.action == "nav_contacts_addkey") {
        return {
            ...state,
            currentHash: "#/add-key",
            notFound: false,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.addKey
        };
    } else if (action.action == "nav_contacts_editkey") {
        const hash = `#/edit-key/${encodeURIComponent(action.contact.name)}`;
        return {
            ...state,
            currentHash: hash,
            notFound: false,
            contactToEdit: action.contact,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.editKey
        };
    } else if (action.action == "nav_contacts_deletekey") {
        const hash = `#/delete-key/${encodeURIComponent(action.contact.name)}`;
        return {
            ...state,
            currentHash: hash,
            notFound: false,
            contactToDelete: action.contact,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.deleteKey
        };
    } else if (action.action == "nav_contacts_extract") {
        return {
            ...state,
            currentHash: "#/extract-pub-key",
            notFound: false,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.extract
        };
    } else if (action.action == "nav_contacts_changepass") {
        return {
            ...state,
            currentHash: "#/change-pass",
            notFound: false,
            appNavState: appNavStates.contacts,
            contactsNavState: contactsNavStates.changePass
        };
    } else if (action.action == "init_contacts") {
        return {
            ...state,
            contactsInit: true,
            contacts: action.contacts
        };
    } else if (action.action == "update_contacts") {
        return {
            ...state,
            contacts: action.contacts
        };
    } else if (action.action == "app_error" && action.exception) {
        let contacts = state.contacts;
        let contactsInit = state.contactsInit;
        if (action.exception.type == "invalid_contacts") {
            contacts = [];
            contactsInit = true;
        }
        return {
            ...state,
            contacts: contacts,
            contactsInit: contactsInit,
            hasError: action.exception,
        };
    } else if (action.action == "not_found") {
        return {
            ...state,
            notFound: true
        };
    } else {
        return {
            ...state,
            hasError: { type: "invalid_state", msg: "Invalid state reached" }
        };
    }
}
