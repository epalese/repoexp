import React        from 'react';
import Reflux       from 'reflux';
import Router, { browserHistory } from 'react-router';
import Actions      from 'appRoot/actions';
import AuthStore    from 'appRoot/stores/authStore';

export default React.createClass({
  mixins: [
    Reflux.ListenerMixin
  ],
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      loggedIn: false
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
        this.context.router.replace('/')
      }
    }
    else {
      return this.setState({ loggedIn: false });
    }
  },

  handleSubmit(event) {
    event.preventDefault()

    const email = this.refs.email.value
    const pass = this.refs.pass.value

    Actions.login(email, pass);
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
    console.log("login: this.state.loggedIn = " + this.state.loggedIn);
    return (
      <form onSubmit={this.handleSubmit}>
        <label><input ref="email" placeholder="email" defaultValue="user" /></label>
        <label><input ref="pass" placeholder="password" /></label> (hint: user)<br />
        <button type="submit">login</button>
        {!this.state.loggedIn && (
          <p>Bad login information</p>
        )}
      </form>
    )
  }
});