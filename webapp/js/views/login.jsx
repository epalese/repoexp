import React        from 'react';
import update           from 'react-addons-update';
import Reflux       from 'reflux';
import Router, { browserHistory } from 'react-router';
import Actions      from 'appRoot/actions';
import AuthStore    from 'appRoot/stores/AuthStore';

import Paper from 'material-ui/lib/paper';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';


export default React.createClass({
  mixins: [
    Reflux.ListenerMixin
  ],
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      loggedIn: false,
      username: undefined,
      password: undefined
    }
  },

  componentWillMount () {
    var loggedIn = AuthStore.loggedIn();
    console.log("login.componentWillMount loggedIn = " + loggedIn);
    if(loggedIn) {
        this.context.router.replace('/')
    }
  },

  componentDidMount () {
    this.listenTo(AuthStore, this.onAuthChange);
  },

  onAuthChange(auth) {
    console.log("login.onAuthChange = " + auth);
    this.setState(auth);

    if(this.state.loggedIn) {
      const { location } = this.props
      if (location.state && location.state.nextPathname) {
        this.context.router.replace(location.state.nextPathname)
      } else {
        this.context.router.replace('/notebooks')
      }
    }
    else {
      return this.setState({ loggedIn: false });
    }
  },

  onUsernameChange: function(e) {
    this.setState(
      update(this.state, {
        username: { $set: e.target.value }
      })
    );
  },

  onPasswordChange: function(e) {
    this.setState(
      update(this.state, {
        password: { $set: e.target.value }
      })
    );
  },

  handleSubmit(event) {
    event.preventDefault()

    const username = this.state.username
    const password = this.state.password
    console.log(`login: ${username} and ${password}`);
    Actions.login(username, password);
    // , (loggedIn) => {
    //   if (!loggedIn)
    //     return this.setState({ error: true })

    //   const { location } = this.props

    //   if (location.state && location.state.nextPathname) {
    //     this.context.router.replace(location.state.nextPathname)
    //   } else {
    //     this.context.router.replace('/')
    //   }
    // })
  },

  render() {
    const paperStyle = {
      width: '30%',
      'marginLeft': 'auto',
      'marginRight': 'auto',
      'marginTop': '100px'
    };

    const textFieldStyle = {
      width: '50%',
      'marginLeft': 'auto',
      'marginRight': 'auto',
    };

    const buttonStyle = {
      div: {
        width: '50%',
        'marginLeft': 'auto',
        'marginRight': 'auto'
      },
      button: {
        marginTop: 30,
        marginBottom: 30,
        'marginLeft': 'auto',
        'marginRight': 'auto'
      }
    };

    return (
      <Paper style={paperStyle}  rounded={false}>
        <Toolbar>
          <ToolbarTitle text="Login" />
        </Toolbar>
          <div style={textFieldStyle}>
            <TextField
              fullWidth={true}
              ref="email"
              hintText="type 'user'"
              floatingLabelText="Username"
              onChange={this.onUsernameChange}
            />
          </div>
          <div style={textFieldStyle}>
            <TextField
              fullWidth={true}
              ref="pass"
              hintText=""
              floatingLabelText="Password"
              onChange={this.onPasswordChange}
            />
          </div>
          <div style={buttonStyle.div}>
            <RaisedButton
              label="Login"
              fullWidth={true}
              onMouseUp={this.handleSubmit}
              style={buttonStyle.button}
            />
          </div>
        
      </Paper>
    )
  }
});
// <form onSubmit={this.handleSubmit}>
// <label><input ref="email" placeholder="email" defaultValue="user" /></label>
// <label><input ref="pass" placeholder="password" /></label> (hint: user)<br />
// </form>