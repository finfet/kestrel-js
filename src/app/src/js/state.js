export const workerMsgActions = {
    passEncrypt: "pass_encrypt",
    passDecrypt: "pass_decrypt"
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

export const initialState = {
    appNavState: appNavStates.encrypt,
    encryptNavState: encryptNavStates.start,
    decryptNavState: decryptNavStates.start,
    worker: null,
    workerAnimStart: false,
    workerAnimMet: false,
    workerLoading: false,
    workerReload: false,
    hasError: null,
    passEncryptResult: null,
    passEncryptLoading: false,
    passDecryptResult: null,
    passDecryptLoading: false
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
            appNavState: appNavStates.encrypt,
            encryptNavState: encryptNavStates.start
        };
    } else if (action.action == "nav_decrypt_clicked") {
        return {
            ...state,
            appNavState: appNavStates.decrypt,
            decryptNavState: decryptNavStates.start
        };
    } else if (action.action == "nav_contacts_clicked") {
        return {
            ...state,
            appNavState: appNavStates.contacts
        };
    } else if (action.action == "nav_encrypt_select_key") {
        return {
            ...state,
            encryptNavState: encryptNavStates.key
        };
    } else if (action.action == "nav_encrypt_select_pass") {
        return {
            ...state,
            encryptNavState: encryptNavStates.pass
        };
    } else if (action.action == "nav_decrypt_select_key") {
        return {
            ...state,
            decryptNavState: decryptNavStates.key
        };
    } else if (action.action == "nav_decrypt_select_pass") {
        return {
            ...state,
            decryptNavState: decryptNavStates.pass
        };
    } else {
        return {
            ...state,
            hasError: { type: "invalid_state", msg: "Invalid state reached" }
        };
    }
}
