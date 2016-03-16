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
        var notebooks = this.props.user ? this.state.notebooks.filter(function (notebook) {
            return notebook.user == this.props.user;
        }.bind(this)) : this.state.notebook;

        var notebooksUI = notebooks.map(function (notebook) {
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
 
