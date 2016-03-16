import Reflux from 'reflux';
import Actions from 'appRoot/actions';
import Request from 'superagent';
import Config from 'appRoot/appConfig';

export default Reflux.createStore({
    listenables: Actions,
    endpoint: Config.apiRoot + '/notebooks',
    notebooks: [],
    // called when mixin is used to init the component state
    getInitialState: function() {
        return this.notebooks;
    },
    init: function () {
        Request
            .get(this.endpoint)
            .end(function (err, res) {
                if (res.ok) {
                    this.notebooks = res.body;
                    this.trigger(this.notebooks);
                } else {
                }
            }.bind(this)); 
    },
    onGetNotebook: function(id) {
        console.log("onGetNotebook: id = " + id);
        function req() {
            Request
                .get(this.endpoint)
                .query({
                    id: id
                })
                .end(function(err, res) {
                    if (res.ok) {
                        if (res.body.length > 0) {
                            Actions.getNotebook.completed(res.body[0]);
                        } else {
                            Actions.getNotebook.failed('Notebook (' + id + ') not found');    
                        }
                    } else {
                        Actions.getNotebook.failed(err);
                    }
                })
        }
        Config.loadTimeSimMs ? setTimeout(req.bind(this), Config.loadTimeSimMs) : req();
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