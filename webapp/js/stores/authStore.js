import Reflux from 'reflux';
import Actions from 'appRoot/actions';

var renderTimeout = 250; // set a timeout to simulate async response time
var auths = {
    "user:user": {
        "jwt": "DOESNTMATTER.eyJleHAiOi0xLCJpZCI6IjEiLCJuYW1lIjoiR29vbGV5IiwiZW1haWwiOiJnb29sZXlAcHJlYWN0LmNvbSJ9.DOESNTMATTER"
    },
    "awesome@preact.com:asdfasdf": {
        "jwt": "DOESNTMATTER.eyJleHAiOi0xLCJpZCI6IjIiLCJuYW1lIjoiSGFybGFuIExld2lzIiwiZW1haWwiOiJoYXJsYW5AcHJlYWN0LmNvbSJ9.DOESNTMATTER"
    }
}

export default Reflux.createStore({
    listenables: Actions,

    init: function() {
        console.log("authStore init");
        this.jwt = localStorage.getItem('jwt');
        this.claims = this.parseJwt();
        this.error = false;
        this.loading = false;
    },
    getState: function() {
        return {
            loading: this.loading,
            error: this.error,
            user: this.userFromClaims(),
            loggedIn: this.loggedIn()
        };
    },
    userFromClaims: function()  {
        // will want to do some cleanup of the claims
        // because they're designed to be very small field names for xfer size
        return this.claims;
    },
    loggedIn: function() {
        // helper
        return this.claims !== null;
    },
    changed: function() {
        this.trigger(this.getState());
    },
    onLogin (email, password) {
        console.log(`authStore.onLogin: ${email}, ${password}`);
        this.loading = true;
        this.changed();

        // fake API simulation
        setTimeout(function() {
            // var auths = require('./AuthStore.sampleData.json');
            Actions.login.completed(auths[`${email}:${password}`]);
        }, renderTimeout);
    },
    onLoginCompleted (authResponse) {
        if(authResponse){
          this.jwt = authResponse.jwt;
          this.claims = this.parseJwt();
          this.error = false;

          localStorage.setItem('jwt', this.jwt);
        } else {
            this.error = 'Username or password invalid.';
        }

        this.loading = false;
        this.changed();
    },
    onLogout () {
        // clear it all
        this.jwt = null;
        this.claims = null;
        this.error = false;
        this.loading = false;
        localStorage.removeItem('jwt');
    },
    parseJwt () {
        if(this.jwt === null){ return null; }
        return JSON.parse(atob(this.jwt.split('.')[1]));
    }
});