import React          from 'react';
import ReactDom       from 'react-dom';
import { Router, Route, Link, hashHistory } from 'react-router'
import CSS            from '../css/app.less';
import AppHeader      from 'appRoot/views/appHeader';
import NotebookList   from 'appRoot/views/notebooks/list';
import NotebookEdit   from 'appRoot/views/notebooks/edit';


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

// <h1>App</h1>
// <ul>
//   <li><Link to="/notebooks">Notebooks</Link></li>
// </ul>

// ReactDom.render((
//   <Router history={browserHistory}>
//     <Route path="/" component={AppLayout}>
//       <Route path="notebooks" component={NotebookList} />
//       <Route path="inbox" component={Inbox}>
//         <Route path="messages/:id" component={Message} />
//       </Route>
//     </Route>
//   </Router>
// ), document.getElementById('app'))

let routes = (
    <Route path="/" component={AppLayout}>
        <Route path="notebooks" component={NotebookList} />
        <Route path="/notebooks/create" component={ NotebookEdit } />
        <Route path="/notebooks/:notebookId/edit" component={ NotebookEdit } />
    </Route>
);

ReactDom.render((
    <Router history={hashHistory}>
        {routes}
    </Router>
), document.getElementById('app'))