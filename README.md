# rn-dev-toolbox

[![Build Status](https://travis-ci.org/mbret/rn-dev-toolbox.svg?branch=master)](https://travis-ci.org/mbret/rn-dev-toolbox)
[![Coverage Status](https://coveralls.io/repos/github/mbret/rn-dev-toolbox/badge.svg?branch=master)](https://coveralls.io/github/mbret/rn-dev-toolbox?branch=master)
[![npm downloads](https://img.shields.io/npm/dt/rn-dev-toolbox.svg)](https://www.npmjs.com/package/rn-dev-toolbox)
[![npm version](https://img.shields.io/npm/v/rn-dev-toolbox.svg)](https://www.npmjs.com/package/rn-dev-toolbox) 

<p align="center">
  <img src="https://raw.githubusercontent.com/mbret/rn-dev-toolbox/master/resources/demo.gif">
</p>

Free your code from ugly logs and code during your debug process and give happiness to your tester team. This package
will let you create automated task and display information to help you during development.

For example you could add actions that navigate to specific view with pre-filled data (sign in, sign up, ..) or an action
that clear your cache, storage, auth, etc. Use it to have quick and easy way to help you test and debug your app. You can
do pretty much anything you want.

## Installation
**This package does not have a bundle yet, it only provides source code which means that you need to support `flow` and es6 modules.**
```
npm install rn-dev-toolbox
```
You can't install this module as a devDependendies as it's present in your code.


## Getting started
### Basic setup
Most of the time you will want to wrap your entire app inside RNDevToolbox so the
toolbox will appears on the top of the screen (check the gif). You may as well use the component anywhere you want
and wrap only some portions of your code, it's up to you.

`app/Root.js`
````javascript
import React, { Component } from 'react'
import { Text } from 'react-native'
import { RNDevToolbox } from 'rn-dev-toolbox'

class Root extends Component<{}, {}> {
  render () {
    return (
      <RNDevToolbox>
        <Text>My Awesome app</Text>
      </RNDevToolbox>
    )
  }
}
````
The component does not have any required props but you probably want to display some info relative to
your app or create some task for your team. Here is an example with some indicators and actions:

`app/Root.js`
````javascript
import React, { Component } from 'react'
import { Text, AsyncStorage } from 'react-native'
import { RNDevToolbox } from 'rn-dev-toolbox'

class Root extends Component<{
  username: ?string
}, {}> {
  render () {
    return (
      <RNDevToolbox
        indicators={[
          'Hey hi!',
          ['Auth status:', username, username ? 'green' : 'red']
        ]}
        actions={[
          {
            name: 'Clear storage',
            task: () => AsyncStorage.clear()
          }
        ]}
      >
        <Text>My Awesome app</Text>
      </RNDevToolbox>
    )
  }
}
````
This example print a simple indicator to say 'hi' and your app auth status. You can create dynamic status to track anything you want.
We also added an action to clear the storage of your app. This is just an example you can create any task you want.

### Props
Property | Type | Required | Default | Description
--- | --- | --- | --- | ---
onRef | `(ref: RNDevToolboxInterface) => void` | No | - | Retrieve the component instance
indicators | [`Array<Indicator>`](https://github.com/mbret/rn-dev-toolbox/blob/master/src/types.js) | No | [] | Declare a list of indicators
enable | `boolean` | No | false | Force the devtool (useful if you want to have it on production)
actions | [`Array<Action>`](https://github.com/mbret/rn-dev-toolbox/blob/master/src/types.js) | No | [] | Declare a list of actions
persistenceProvider | [`PersistenceProvider`](https://github.com/mbret/rn-dev-toolbox/blob/master/src/types.js) | No | memory | Use another provider to persist the devtool state. The default memory will not save the visibily when you reload your app for example. You can use [`AsyncStorage`](https://facebook.github.io/react-native/docs/asyncstorage.html) for more conveniance.

### Note about production
When using production environment the component will switch to production state as well. There will be nothing displayed and
the component will not process anything. Therefore there are no performance impact. You can check the production implementation 
here [RNDevToolboxProd.js](https://github.com/mbret/rn-dev-toolbox/blob/master/src/RNDevToolboxProd.js). `RNDevToolboxProd` implement all the method from the RNDevToolboxInterface but will do nothing so your code does not break and you don't have to check for 
production env by yourself.

## API
### Accessing your devtool instance
In order to access the api of the toolbox you need to use `onRef` props. Once you have the instance you have the ability
to register indicators and actions dynamically, toggle the visibility, trigger actions, ...

`app/Root.js`
````javascript
import React, { Component } from 'react'
import { Text, AsyncStorage } from 'react-native'
import { RNDevToolbox } from 'rn-dev-toolbox'
import type { RNDevToolboxInterface } from 'rn-dev-toolbox'

class Root extends Component<{}, {
  rnDevToolbox: RNDevToolboxInterface
}> {
  rnDevToolbox = null

  componentDidMount () {
    this.rnDevToolbox.processAction('clearStorage')
  }

  render () {
    return (
      <RNDevToolbox
        onRef={ref => {this.rnDevToolbox = ref}}
        actions={[
          {
            label: 'Clear storage',
            name: 'clearStorage',
            task: () => AsyncStorage.clear()
          },
        ]}
      >
        <Text>My Awesome app</Text>
      </RNDevToolbox>
    )
  }
}
````
Here we retrieve the instance and manually trigger an action. We use a name in camelCase for more
conveniance and a label to still have a nice name on screen.

This process to retrieve the instance is only needed for your root component. If you want to
access the instance somewhere else you can use the Higher-Order Components `with-rn-dev-toolbox`.

`app/Footer.js`
````javascript
import React, { Component } from 'react'
import { Text } from 'react-native'
import { withRNDevToolbox } from 'rn-dev-toolbox'
import type { RNDevToolboxInterface } from 'rn-dev-toolbox'

class Footer extends Component<{
  rnDevToolbox: RNDevToolboxInterface
}, {}> {
  componentDidMount () {
    this.props.rnDevToolbox.processAction('clearStorage')
  }

  render() {
    return (
      <Text>I am a footer</Text>
    )
  }
}

export withRNDevToolbox(Footer)
````
**You can't use the hoc on your root component as the context is not initialized yet**

### API Documentation

#### `open() / close() / toggle()`

Open, close or toggle the toolbox visibility

#### `debug(info: any)`

Print any information to the toolbox


#### `registerAction(action: Action | Array<Action>): void`
Register an action or an array of action.

#### `processAction(name: string): void`
Execute one of your actions

## Contribution
You are welcome to contribute to this package. Feel free to open issue or feature request. 

## Licence
MIT

---

This package is currently used at [Versusmind](https://www.versusmind.eu/).
