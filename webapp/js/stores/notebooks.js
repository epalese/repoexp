import Reflux from 'reflux';
import Actions from 'appRoot/actions';
import Request from 'superagent';
import Config from 'appRoot/appConfig';


export default Reflux.createStore({
    listenables: Actions,
    endpoint: Config.apiRoot + '/notebooks',
    notebooks: [],
    sock: null,
    responseDeffers: {},
    requestId: 1,

    // called when mixin is used to init the component state
    getInitialState: function() {
        return this.notebooks;
    },
    init: function () {
        var req = Request.get(this.endpoint);
        req.end(function (err, res) {
            if (res.ok) {
                this.notebooks = res.body;
                this.trigger(this.notebooks);
            } else {
                console.log('stores.notebooks.init: error');
            }
        }.bind(this));
        this.initWS();
    },
    initWS: function() {
        var wsuri;
        if (window.location.protocol === "file:") {
            wsuri = "ws://127.0.0.1:3001";
        } else {
            wsuri = "ws://" + window.location.hostname + ":3001";
        }
        if ("WebSocket" in window) {
            this.sock = new WebSocket(wsuri);
        } else if ("MozWebSocket" in window) {
            this.sock = new MozWebSocket(wsuri);
        } else {
            console.log("Browser does not support WebSocket!");
            window.location = "http://autobahn.ws/unsupportedbrowser";
        }
        if (this.sock) {
            this.sock.onopen = function() {
                console.log("Connected to " + wsuri);
            };
            this.sock.onclose = function(e) {
                console.log("Connection closed (wasClean = " + 
                    e.wasClean + 
                    ", code = " + 
                    e.code + 
                    ", reason = '" + 
                    e.reason + "')");
                this.sock = null;
            };
            // let requestId = selectn('message.data.request_id');
            // if (!requestId) return;
            // //resolve or reject the promise which is kept in ActionCreator
            // if (message.data.result === 'Ok') resolveRequest(requestId, message);
            // else rejectRequest(requestId, message.error);

            this.sock.onmessage = function(e) {
                console.log('ws response: ' + e);
                var response = JSON.parse(e.data);
                console.log('ws response: ');
                console.log(response);
                console.log(this.responseDeffers[response.id]);
                this.responseDeffers[response.id].resolve(response);
                this.onSendWSCompleted("arisuca");
                // delete this.responseDeffers[response.id];
                // callback = globalCallbacks[response.id];
                // callback(response);
            }.bind(this);
        }
    },
    onSendWSCompleted: function(msg) {
        console.log("suca");
    },
    onSendWS: function (msg) {
        console.log("SUCAAAAAA");
        var req = {
            id: this.requestId++,
            payload: msg
        }
        console.log("[stores.notebook.onSendWS] req = ");
        console.log(req);
        return new Promise(function(resolve, reject) {
            this.responseDeffers[req.id] = {
                resolve,
                reject
            };
            if (this.sock) {
                var strReq = JSON.stringify(req);
                this.sock.send(strReq);
                console.log("Sent msg : " + strReq);
            } else {
                reject('Websocket connection is closed');
            }
        }.bind(this));
    },
    onGetNotebook: function(id) {
        function req() {
            console.log("onGetNotebook: req = " + id);
            var req = Request.get(this.endpoint).query({id: id});
            req.end(function(err, res) {
                if (res.ok) {
                    if (res.body.length > 0) {
                        Actions.getNotebook.completed(res.body[0]);
                        console.log("onGetNotebook: res.ok = " + res.body[0]);
                    } else {
                        Actions.getNotebook.failed('Notebook (' + id + ') not found');    
                    }
                } else {
                    Actions.getNotebook.failed(err);
                }
            });
        }
        req.bind(this)();
        // Config.loadTimeSimMs ? setTimeout(req.bind(this), Config.loadTimeSimMs) : req();
    },
    onModifyNotebook: function (notebook, id) {
        console.log("onModifyNotebook: notebook = " + notebook);
        console.log("onModifyNotebook: id = " + id);
        console.log("onModifyNotebook: endpoint = " + id ? this.endpoint+'/'+id : this.endpoint);
        function req () {
          Request
            [id ? 'put' : 'post'](id ? this.endpoint+'/'+id : this.endpoint)
            .send(notebook)
            .end(function (err, res) {
                console.log("onModifyNotebook: err = " + err);
                console.log("onModifyNotebook: res = " + res);
                if (res.ok) {
                    console.log("onModifyNotebook: action ended correctly " + res.body.id);
                    Actions.modifyNotebook.completed(res);
                    // if there's already a Notebook in our local store we need to modify it
                    // if not, add this one
                    var existingNotebookIdx = Array.findIndex(this.notebooks, function (notebook) {
                        return res.body.id == notebook.id;
                    });
                    if (existingNotebookIdx > -1) {
                        this.posts[existingNotebookIdx] = res.body;
                    } else {
                        this.notebooks.push(res.body);
                    }
                } else {
                    console.log("onModifyNotebook: action ended wrongly " + res.body);
                    Actions.modifyNotebook.completed();
                }
            }.bind(this));
        }
        Config.loadTimeSimMs ? setTimeout(req.bind(this), Config.loadTimeSimMs) : req();
    }
})