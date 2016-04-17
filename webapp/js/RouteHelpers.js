import React from 'react';
import Router from 'react-router';
import AuthStore from 'appRoot/stores/authStore';

var LoginRequired = React.createClass({
    statics: {
        willTransitionTo: function (transition, params, query, callback) {
            console.log('LoginRequired: ');
            console.log(!AuthStore.loggedIn());
            if(!AuthStore.loggedIn())   {
                // go over to login page
                transition.redirect('/login', null, { redirect: transition.path });
            }
            callback();
        }
    },
    render () {
        return (
            <Router.RouteHandler/>
        );
    }
});

export {LoginRequired};