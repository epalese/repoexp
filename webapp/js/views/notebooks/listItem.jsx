"use strict";

import React      from 'react';
import { Link }   from 'react-router';
import ClassNames from 'classnames';
import Moment     from 'moment';
import Loader     from 'appRoot/components/loader';

let dateFormat    = 'MM/DD/YYYY HH:mm:ss';
 
export default React.createClass({
    getInitialState: function () {
        return {
            notebook: this.props.notebook
        };
    },
    render: function () {
        if (this.state.loading) { return <Loader />; }
        var notebook = this.state.notebook;
 
        return (
            <li className="notebook-view-summary">
                <aside>
                    <Link to={`/notebooks/${notebook.id}/edit`}>
                        <div className="notebook-metadata">
                            <strong>{notebook.name}</strong>
                            &nbsp;
                            <em>({Moment(notebook.date, 'x').format(dateFormat)})</em>
                        </div>
                    </Link>
                </aside>
            </li> 
        );
    }
});
 
