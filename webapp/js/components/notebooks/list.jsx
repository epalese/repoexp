"use strict";

import React            from 'react';
import Reflux           from 'reflux';
import NotebookStore    from 'appRoot/stores/notebooks';
import NotebookView     from 'appRoot/views/notebooks/view';


export default React.createClass({
    mixins: [
        Reflux.connect(NotebookStore, 'notebooks')
    ],
    render: function () {
        console.log("components.notebooks.list: this.state.notebooks.length = " + this.state.notebooks.length);
        console.log(this.state);
        var notebooks = this.props.user ? this.state.notebooks.filter(function (notebook) {
            return notebook.user == this.props.user;
        }.bind(this)) : this.state.notebooks;
        var notebooksUI = notebooks.map(function (notebook) {
            console.log("notbook id = " + notebook.id);
            return <NotebookView key={notebook.id} notebook={notebook} mode="summary"/>;
        });
        return (
            <div className="notebook-list">
                <ul>
                    {notebooksUI}
                </ul>
            </div>
        );
    }
});
 
