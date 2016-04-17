"use strict";

import React            from 'react';
import Reflux           from 'reflux';
import NotebookStore    from 'appRoot/stores/notebooks';
import NotebookItem     from 'appRoot/views/notebooks/NotebookListItem';


export default React.createClass({
    mixins: [
        Reflux.connect(NotebookStore, 'notebooks')
    ],
    
    render: function () {
        var notebooks = this.props.user ? this.state.notebooks.filter(function (notebook) {
            return notebook.user == this.props.user;
        }.bind(this)) : this.state.notebooks;
        var notebooksUI = notebooks.map(function (notebook) {
            return <NotebookItem
                key={notebook.id}
                notebook={notebook} />;
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
 
