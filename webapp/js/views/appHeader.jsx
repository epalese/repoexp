import React          from 'react';
import Reflux         from 'reflux';
import { Link, hashHistory } from 'react-router';
import Actions        from 'appRoot/actions';
 
export default React.createClass({
    // logOut: function() {
    //     hashHistory.push('/');
    // },
    render: function () {
    return (
      <header className="app-header">
        <Link to="/"><h1>The Report Experience</h1></Link>
        <section className="account-ctrl">
          <Link to="notebooks">Notebooks</Link>
        </section>
      </header> 
    );
    }
});

// <a onClick={this.logOut}>Log Out</a>