"use strict";

import Reflux from 'reflux';

export default Reflux.createActions({
    'getNotebook': {
        asyncResult: true
    },
    'modifyNotebook': {
        asyncResult: true
    },
    'sendWS': {
        asyncResult: true  
    }
});
