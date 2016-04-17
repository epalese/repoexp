import React          from 'react';
import Reflux         from 'reflux';
import { Link, hashHistory } from 'react-router';
import Actions        from 'appRoot/actions';
import AuthStore    from 'appRoot/stores/AuthStore';

import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import FlatButton from 'material-ui/lib/flat-button';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/lib/menus/menu-item';


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

  notebooks: function() {
    this.context.router.replace('/notebooks');
  },

  handleTitleTouchTap: function() {
    this.context.router.replace('/');
  },

  render: function() {
    const styles = {
      title: {
        cursor: 'pointer',
      },
      div: {
        position: "fixed",
        width: "100%",
        top: "0"
      },
      appbar: {
      }
    };

    var loggedIn = AuthStore.loggedIn();
    return(
      <div style={styles.div}>
      <AppBar
        style={styles.appbar}
        showMenuIconButton={false}
        title={<span style={styles.title}>The Report Experience</span>}
        onTitleTouchTap={this.handleTitleTouchTap}
        iconElementRight={
          (loggedIn && (
            <IconMenu
              iconButtonElement={
                <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                <MenuItem primaryText="Help" />
                <MenuItem onTouchTap={this.notebooks} primaryText="Notebooks" />
                <MenuItem onTouchTap={this.logout} primaryText="Sign out" />
            </IconMenu>)
          ) || 
          (!loggedIn && (
            <IconMenu
              iconButtonElement={
                <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                <MenuItem primaryText="Help" />
                <MenuItem onTouchTap={this.login} primaryText="Sign in" />
            </IconMenu>
            )
          )}
      />
      </div>
    );
  }
  // render: function () {
  //   var loggedIn = AuthStore.loggedIn();
  //   return (
  //     <header className="app-header">
  //       
        
  //         {loggedIn && (
  //           <section className="account-ctrl">
  //             <Link to="notebooks">Notebooks</Link>
  //             <a onClick={this.logout}>Log Out</a>
  //           </section>
  //         )}
  //         {!loggedIn && (
  //           <section className="account-ctrl">
  //             <a onClick={this.login}>Log In</a>
  //           </section>
  //         )}
  //     </header> 
  //   );
  // }
});
