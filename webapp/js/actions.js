"use strict";

import Reflux from 'reflux';

export default Reflux.createActions({
    'getNotebook': {
        asyncResult: true
    },
    'modifyNotebook': {
        asyncResult: true
    },
    'sendMsgWS': {
        asyncResult: true
    },
    'receiveMsgWS': {
        asyncResult: true
    }
});
