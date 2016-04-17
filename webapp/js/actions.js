"use strict";

import Reflux from 'reflux';

export default Reflux.createActions({
    'login': {
        children: ['completed', 'failed']
    },
    'logout': {},
    'getNotebook': {
        asyncResult: true
    },
    'saveNotebook': {
        asyncResult: true
    },
    'sendMsgWS': {
        asyncResult: true
    },
    'receiveMsgWS': {
    }
});
