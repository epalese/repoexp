"use strict";

import React      from 'react';
import Reflux     from 'reflux';
import { Link }   from 'react-router';
import ClassNames from 'classnames';
import Moment     from 'moment';
import Actions    from 'appRoot/actions';
// import NotebookStore  from 'appRoot/stores/notebooks';
import Loader     from 'appRoot/components/loader';

let dateFormat    = 'MM/DD/YYYY HH:mm:ss';
 
export default React.createClass({
    getInitialState: function () {
        return {
            notebook: this.props.notebook
        };
    },
    componentWillMount: function () {
        // the component has this.proprs.notebook if
        // initialised in components.notebooks.list
        if (this.state.notebook) {
        } else {
            // otherwise get notebook from query params
            this.getNotebook();
        }
    },
    // getUserFromNotebook: function (notebook) {
    //     return Array.find(this.state.users, function (user) {
    //         return user.id === notebook.user;
    //     });
    // },
    getNotebook: function () {
        if (this.isMounted()) {
            this.setState({loading: true});
        } else {
            this.state.loading = true;
        }

        // this.props.params.NotebookId comes from the router app.jsx
        Actions.getNotebook(this.props.params.notebookId)
        .then(function (data) {
            this.setState({
                loading: false,
                notebook: data
            });
        }.bind(this));
    },
    render: function () {
        if (this.state.loading) { return <Loader />; }
        var notebook = this.state.notebook;
 
        return this.props.mode === 'summary' ? (
            // SUMMARY / LIST VIEW
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
        ) : (
            // FULL Notebook VIEW
            <div className="notebook-view-full">

                <div className="notebook-view-container">
                    <h2>
                        <div className="notebook-metadata">
                            <strong>{notebook.title}</strong>
                            <em>{Moment(notebook.date, 'x').format(dateFormat)}</em> 
                        </div> 
                    </h2>
                    <section className="notebook-body" dangerouslySetInnerHTML={{__html: notebook.paragraphs}}>
                    </section>
                </div>
            </div>

        );
    }
});
 
