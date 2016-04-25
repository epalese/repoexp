import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router'
import CSS from '../css/app.less';
import AppHeader from 'appRoot/views/appHeader';
import AuthStore from 'appRoot/stores/AuthStore';
import Login from 'appRoot/views/login';
import NotebookList from 'appRoot/views/notebooks/NotebookList';
import NotebookEdit from 'appRoot/views/notebooks/NotebookEdit';
import Editor from 'appRoot/views/editor/Editor';

import injectTapEventPlugin from 'react-tap-event-plugin';    // needed for material ui

console.log("[app] Starting...");
injectTapEventPlugin();

console.error = (function() {
    var error = console.error

    return function(exception) {
        if ((exception + '').indexOf('Warning: A component is `contentEditable`') != 0) {
            error.apply(console, arguments)
        }
    }
})();

let AppLayout = React.createClass({
render: function () {
    return (
      <div >
        <AppHeader/>
        <div style={{'marginTop': '100px'}}>
            {this.props.children}
        </div>
      </div>
    );
  }
});

function requireAuth(nextState, replace) {
  if (!AuthStore.loggedIn()) {
    replace({
      pathname: '/login',
      state: { nextPathname: nextState.location.pathname }
    })
  }
};

// let routes = (
//     <Route path="/" component={AppLayout}>
//         <Route path="/login" component={Login} />
//         <Route path="/editor/" component={ MyEditor } />
//         <Route path="/notebooks" component={NotebookList} onEnter={requireAuth} />
//         <Route path="/notebooks/create" component={ NotebookEdit } onEnter={requireAuth} />
//         <Route path="/notebooks/:notebookId/edit" component={ NotebookEdit } onEnter={requireAuth} />
//     </Route>
// );

let routes = (
    <Route path="/" component={AppLayout}>
        <Route path="/login" component={Login} />
        <Route path="/notebooks" component={ NotebookList } onEnter={requireAuth} />
        <Route path="/notebooks/create" component={ NotebookEdit } onEnter={requireAuth} />
        <Route path="/notebooks/:notebookId/edit" component={ Editor } onEnter={requireAuth} />
    </Route>
);

ReactDom.render((
    <Router history={hashHistory}>
        {routes}
    </Router>
), document.getElementById('app'))