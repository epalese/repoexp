The report experience
=====================

## Test the app

### Installation
* Clone the repository
* Move into repoexp/webapp and run "npm install"  
* Move into repoexp/data-engine
* Create a virtualenv
* Run "pip install -r requirements.txt"
* Download spark from http://www.apache.org/dyn/closer.lua/spark/spark-1.6.1/spark-1.6.1-bin-hadoop2.4.tgz
* Uncompress the tgz and move the Spark directory in repoexp/data-engine/.
* Rename the directory spark-1.6.1-bin-hadoop2.4 in spark-1.6.1  
* At the end you need to have repoexp/data-engine/spark-1.6.1 

!!! You need to have a JDK installed to use Spark  

### Run
* while in repoexp/webapp run "npm start"
* while in repoexp/webapp run "./start_jsonserver.sh"
* move in repoexp/data-engine, remember to activate the virutalenv previously created and run "python ws_server.py"  

Now visit localhost:8080  

Ciao!  

## Install node and npm

### Manual
Download https://nodejs.org/dist/v5.8.0/node-v5.8.0-darwin-x64.tar.gz  
```bash
cd ~/dev
tar xvzf ~/Downloads/node-v5.8.0-darwin-x64.tar.gz
nano ~/.bash_profile adding:
export PATH=$PATH:/Users/fix/dev/node-v5.8.0-darwin-x64.tar.gz/bin
source ~/.bash_profile
```

### Package
Download node.js from https://nodejs.org/en/  
Node.js was installed at:  
  
   /usr/local/bin/node  
  
npm was installed at:  
  
   /usr/local/bin/npm  
  
Make sure that /usr/local/bin is in your $PATH.  
Check:  
```bash
(repoxp)Red:webapp fix$ echo $PATH 
/Users/fix/dev/python/virtualenv/repoxp/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/usr/local/git/bin:/opt/apache-maven-3.3.3/bin:/Users/fix/Dev/Scala/sbt/bin:/Users/fix/dev/node-v5.0.0-darwin-x64/bin
```

If not edit ~/.bash_profile adding:  
export PATH=$PATH:/usr/local/bin/  

Check installation:
```bash
(repoxp)Red:dev fix$ node -v
v5.8.0
(repoxp)Red:dev fix$ npm -v
3.7.3
```

### Create the project

#### Node, packages and config files
```bash
~ fix$ mkdir repoxp
~ fix$ cd repoxp
repoxp fix$ mkdir webapp
repoxp fix$ cd webapp

webapp fix$ npm init

webapp fix$ npm install --save react react-dom react-addons-update  
webapp fix$ npm install --save react-router history  
webapp fix$ npm install --save reflux reflux-promise
webapp fix$ npm install --save superagent  
webapp fix$ npm install --save classnames  
webapp fix$ npm install --save quill  
webapp fix$ npm install --save moment  
```

Now it is webpack time:
```bash
webapp fix$ npm install --save webpack  
```

I want to install webpack-dev-server locally to avoid global dependencies:  
```bash
webapp fix$ npm install --save webpack-dev-server
```

```bash
webapp fix$ npm install --save babel babel-core babel-polyfill babel-loader babel-preset-es2015 babel-preset-react react-hot-loader
```

```bash
webapp fix$ npm install --save less less-loader style-loader css-loader autoprefixer-loader
```

Edit package.json adding:
```javascript
...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "webpack-dev-server --progress --colors --watch"
  },
...
```

It is time to create the weback.config.js (check the source file).  

We need to create web_modules/reflux-wrap-loader-index.js:  
```javascript
module.exports = function (source) {
	this.cacheable && this.cacheable();
	var newSource;

	if (/reflux-core.*index.js$/.test(this.resourcePath)) {
		newSource = ";import RefluxPromise from 'reflux-promise';\n";
		newSource += source;
		newSource += ";\nReflux.use(RefluxPromise(Promise));";
	}
	return newSource || source;
};

``` 

> Since the Reflux project split out promises into a separate package, it's necessary to call Reflux.use on the reflux-promise package. There's not a great place to do this in the application modules, since every module would have to do it to be sure it was done without worrying about execution order. So, instead it's done here in a loader by wrapping the Reflux module and adding the invocation for the import and the use method. The loader matches on the reflux-core file and frames it with the invocation text to include the promise interface. This loader will be run before the Babel transformation, so we can use the ES6 import syntax without generating a build error. The loader will run on every file so you must be sure to return the original source if you want the loader to do nothing to the file. The cacheable() invocation instructs Webpack that, after the transformation, the result for the reflux-core file can be cached indefinitely.

#### Scaffolding
```bash
cd webapp
mkdir -p db css/{components,vendor,views} js/{components,mixins,stores,vendor,views}
mkdir -p {css,js}/{components,views}/{users,posts} js/vendor/polyfills
```

Create webapp/index.html  
> The index.html file is merely a shell to include the application as bundled by Webpack.

Create js/app.jsx  

### Development stuff

We are going to use a mock dev server for our REST interface:  
```bash
webapp fix$ npm install --save json-server
```

Start the mock server with:
```bash
webapp fix$ node ./node_modules/json-server/bin/index.js ./db/db.json 
```

### Useful links  
[Beginner’s guide to Webpack](https://medium.com/@dabit3/beginner-s-guide-to-webpack-b1f1a3638460#.9xaaj270d)  
[Developing with Webpack](http://survivejs.com/webpack_react/developing_with_webpack/)  
[Babel sublime](https://github.com/babel/babel-sublime)  

Research material:  
https://facebook.github.io/react/docs/update.html  
https://facebook.github.io/react/docs/jsx-spread.html  
