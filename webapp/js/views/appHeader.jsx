import React          from 'react';
import Reflux         from 'reflux';
import { Link, hashHistory } from 'react-router';
import Actions        from 'appRoot/actions';
import AuthStore    from 'appRoot/stores/authStore';
 
export default React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  login: function() {
    this.context.router.replace('/login');
  },

  logout: function() {
    Actions.logout();
    this.context.router.replace('/login');
  },

  render: function () {
    var loggedIn = AuthStore.loggedIn();
    return (
      <header className="app-header">
        <Link to="/"><h1>The Report Experience</h1></Link>
        
          {loggedIn && (
            <section className="account-ctrl">
              <Link to="notebooks">Notebooks</Link>
              <a onClick={this.logout}>Log Out</a>
            </section>
          )}
          {!loggedIn && (
            <section className="account-ctrl">
              <a onClick={this.login}>Log In</a>
            </section>
          )}
      </header> 
    );
  }
});

// 