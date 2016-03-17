import React          from 'react';
import ReactDom       from 'react-dom';
import { Router, Route, IndexRoute } from 'react-router';
import CSS            from '../css/app.less';
import AppHeader      from 'appRoot/views/appHeader';
import Login          from 'appRoot/views/login';
import PostList       from 'appRoot/views/posts/list';
import PostView       from 'appRoot/views/posts/view';
import PostEdit       from 'appRoot/views/posts/edit';
import NotebookList   from 'appRoot/views/notebooks/list';
import NotebookView   from 'appRoot/views/notebooks/view';
import NotebookEdit   from 'appRoot/views/notebooks/edit';
import UserList       from 'appRoot/views/users/list';
import UserView       from 'appRoot/views/users/view';
import UserEdit       from 'appRoot/views/users/edit';


// Components must be uppercase - regular DOM is lowercase
let AppLayout = React.createClass({
render: function () {
    console.log("app.jsx");
    return (
      <div className="app-container">
        <AppHeader />
        <main>
          {React.cloneElement(this.props.children, this.props)}
        </main>
      </div>
    );
  }
});

let routes = (
<Route path="/" component={ AppLayout }>
  <IndexRoute component={ PostList } />
    <Route 
      path="posts/:pageNum/?" 
      component={ PostList } 
      ignoreScrollBehavior 
    />
    <Route
      path="/posts/create"
      component={ PostEdit }
    />
    <Route 
      path="/posts/:postId/edit"
      component={ PostEdit } 
    />
    <Route 
      path="posts/:postId"
      component={ PostView } 
    />

    <Route
      path="notebooks/:pageNum/?" 
      component={ NotebookList } 
      ignoreScrollBehavior 
    />
    <Route
      path="/notebooks/create"
      component={ NotebookEdit }
    />
    <Route
      path="/notebooks/:notebookId/edit"
      component={ NotebookEdit } 
    />
    <Route
      path="notebooks/:postId"
      component={ NotebookView } 
    />

    <Route 
      path="/users" 
      component={ UserList } 
    />
    <Route
      path="/users/create"
      component={ UserEdit }
    />
    <Route 
      path="/users/:userId" 
      component={ UserView } 
    />
    <Route 
      path="/users/:userId/edit"
      component={ UserEdit }
    />
    <Route 
      path="/login" 
      component={ Login }
    />
    <Route path="*" component={ PostList } />
  </Route>
);

ReactDom.render(<Router>{routes}</Router>, document.getElementById('app'));