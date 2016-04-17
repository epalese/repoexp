import React          from 'react';
import ReactDom       from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router'
import CSS              from '../css/app.less';
import AppHeader        from 'appRoot/views/appHeader';
import Login            from 'appRoot/views/login';
import NotebookList     from 'appRoot/views/notebooks/NotebookList';
import NotebookEdit     from 'appRoot/views/notebooks/NotebookEdit';
import AuthStore        from 'appRoot/stores/authStore';

let AppLayout = React.createClass({
render: function () {
    console.log("app.jsx");
    return (
      <div className="app-container">
        <AppHeader />
        <main>
            <div>
                {this.props.children}
            </div>
        </main>
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

let routes = (
    <Route path="/" component={AppLayout}>
        <Route path="/login" component={Login} />
        <Route path="notebooks" component={NotebookList} onEnter={requireAuth} />
        <Route path="/notebooks/create" component={ NotebookEdit } onEnter={requireAuth} />
        <Route path="/notebooks/:notebookId/edit" component={ NotebookEdit } onEnter={requireAuth} />
    </Route>
);

ReactDom.render((
    <Router history={hashHistory}>
        {routes}
    </Router>
), document.getElementById('app'))