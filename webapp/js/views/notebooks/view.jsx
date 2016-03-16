"use strict";

import React      from 'react';
import Reflux     from 'reflux';
import { Link }   from 'react-router';
import ClassNames from 'classnames';
import Moment     from 'moment';
import Actions    from 'appRoot/actions';
import NotebookStore  from 'appRoot/stores/notebooks';
import UserStore  from 'appRoot/stores/users';
import Session    from 'appRoot/stores/sessionContext';
import Loader     from 'appRoot/components/loader';

let dateFormat    = 'MM/DD/YYYY HH:mm:ss';
 
export default React.createClass({
    mixins: [
        Reflux.connect(Session, 'session'),
        Reflux.connect(UserStore, 'users')
    ],
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
    getUserFromNotebook: function (notebook) {
        return Array.find(this.state.users, function (user) {
            return user.id === notebook.user;
        });
    },
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
        var notebook = this.state.notebook
        ,   user = this.getUserFromNotebook(notebook)
        ,   name = user.firstName && user.lastName ? 
                user.firstName + ' ' + user.lastName : 
                user.firstName ?
                user.firstName : 
                user.username
        ;
 
        return this.props.mode === 'summary' ? (
            // SUMMARY / LIST VIEW
            <li className="notebook-view-summary">
                <aside>
                    <img className="profile-img small" src={user.profileImageData} />
                    <div className="notebook-metadata">
                        <strong>{notebook.name}</strong>
                        <span className="user-name">{name}</span>
                        <em>{Moment(notebook.date, 'x').format(dateFormat)}</em> 
                    </div>
                </aside>
                &nbsp;
                <Link to={`/notebooks/${notebook.id}`}>Open</Link> 
                {
                    user.id === this.state.session.id ? (
                        <div>
                            <Link to={`/notebooks/${notebook.id}/edit`}>
                                <button>edit notebook</button>
                            </Link>
                        </div>
                    ) : ''
                }
            </li> 
        ) : (
            // FULL Notebook VIEW
            <div className="notebook-view-full">

                <div className="notebook-view-container">
                    <h2>
                        <img className="profile-img" src={user.profileImageData} />
                        <div className="notebook-metadata">
                            <strong>{notebook.title}</strong>
                            <span className="user-name">{name}</span>
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
 
