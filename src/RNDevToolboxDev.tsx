/* eslint no-unused-vars:0 */
/**
 *
 */
import React from 'react'
import { isError } from './utils/is-error'
import { PERSISTENCE_KEY, style } from './constants'
import { warn } from './utils/console'
import { RNTipsModal } from './RNTipsModal'
import { RNDevToolboxState, RNDevToolboxProps, RNDevToolboxBase } from './RNDevToolboxBase'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { RNDevToolboxContext } from './RNDevToolboxContext'
import memoizeOne from 'memoize-one'
import { Action, Indicator } from './types'

const emptyIndicators: Array<Indicator> = []
const emptyActions: Action[] = []

type localState = { defaultActions: Array<Action> }
type State = localState & RNDevToolboxState
type LocalProps = {}
type Props = RNDevToolboxProps<LocalProps>

export class RNDevToolboxDev extends RNDevToolboxBase<LocalProps, localState> {
  constructor (props: Props) {
    super(props)
    // theses lines are mandatory as rn 57 does not support
    // class properties yet
    this.toggle = this.toggle.bind(this)
    this.debug = this.debug.bind(this)
    this.close = this.close.bind(this)
    this.open = this.open.bind(this)
    this._toggleTipsModalVisible = this._toggleTipsModalVisible.bind(this)
    this.state = {
      opened: false,
      debug: 'Ready',
      tipsModalVisible: false,
      actions: [],
      indicators: [
        // ['__DEV__', __DEV__ ? 'true' : 'false'],
        // ['NODE_ENV', process.env.NODE_ENV || '']
      ],
      defaultActions: [{
        name: 'Tips',
        task: () => this._toggleTipsModalVisible()
      }]
    }
  }

  static getDerivedStateFromProps (nextProps: Props, nextState: State) {
    // compute actions based on props actions
    const actions = RNDevToolboxDev.computeActions(nextProps.actions, nextState.defaultActions)

    if (actions === nextState.actions) return null

    // update actions
    return { actions }
  }

  computeIndicators = memoizeOne((indicators: Indicator[] = emptyIndicators) => [...this.state.indicators, ...indicators])
  static computeActions = memoizeOne((actions: Action[] = emptyActions, defaultActions: Array<Action>) => [...defaultActions, ...actions])

  componentDidMount () {
    super.componentDidMount()
    this._restore()
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    this._persist(prevState)
  }

  /**
   * {@inheritDoc}
   */
  registerAction (action: Action | Array<Action>): void {
    this.setState(state => ({
      actions: state.actions.concat(Array.isArray(action) ? action : [action])
    }))
  }

  /**
   * {@inheritDoc}
   */
  processAction (name: string): void {
    const actionOver = () => this.debug(`Action ${name} done!`)
    this.state.actions.forEach(action => {
      if (action.name === name) {
        this.debug(`Process action ${name}`)
        const done = action.task()
        // nothing
        if (done === undefined) {
          return actionOver()
        }
        // promise
        if (typeof done.then === 'function') {
          return done.then(actionOver)
        }

        // we don't know
        return actionOver()
      }
    })
  }

  _persist (prevState: State) {
    // should we persist ?
    if (this.state.opened !== prevState.opened) {
      if (this.props.persistenceProvider) {
        this.props.persistenceProvider
          .setItem(PERSISTENCE_KEY, JSON.stringify({
            opened: this.state.opened
          }))
          .catch(warn)
      }
    }
  }

  _restore () {
    if (this.props.persistenceProvider) {
      this.props.persistenceProvider
        .getItem(PERSISTENCE_KEY)
        .then(data => {
          if (data) {
            this.setState(JSON.parse(data))
          }
        })
        .catch(warn)
    }
  }

  _toggleTipsModalVisible () {
    this.setState(state => ({ tipsModalVisible: !state.tipsModalVisible }))
  }

  _formatIndicator (indicator: Indicator) {
    const [key, value = undefined, color = undefined] = Array.isArray(indicator) ? indicator : [indicator]

    return !Array.isArray(indicator)
      ? (
        <Text>{key}</Text>
      )
      : (
        <Text>
          <Text>{key}: </Text>
          <Text style={{ color }}>
            {value}
          </Text>
        </Text>
      )
  }

  render () {
    const { opened } = this.state
    const indicators = this.computeIndicators(this.props.indicators)

    const Debug = (
      <Text style={{ color: isError(this.state.debug) ? style.colors.colorError : style.colors.colorValid }}>
        {this.state.debug && isError(this.state.debug) ? this.state.debug.toString() : this.state.debug}
      </Text>
    )

    const Toolbox = (
      <View style={styles.toolboxContainer}>
        {Debug}
        <View style={styles.indicatorsContainer}>
          {indicators.map((indicator, i) => (
            <View key={i} style={styles.indicatorContainer}>
              <Text>{this._formatIndicator(indicator)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actionButtonsContainer}>
          {this.state.actions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionButton}
              onPress={() => this.processAction(action.name)}
            >
              <Text style={styles.actionButtonText}>{action.label || action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )

    return (
      <RNDevToolboxContext.Provider value={this}>
        <View style={styles.masterContainer}>
          <RNTipsModal visible={this.state.tipsModalVisible} onRequestClose={this._toggleTipsModalVisible} />
          <View style={styles.container}>
            {opened && Toolbox}
            {this.props.children}
            <TouchableOpacity style={styles.triggerButton} onPress={this.toggle}>
              <Text style={{ color: 'white' }}>{opened ? '-' : '+'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNDevToolboxContext.Provider>
    )
  }
}

const styles = StyleSheet.create({
  masterContainer: {
    // not sure if I should use flexGrow or flex
    flexGrow: 1
  },
  container: {
    flex: 1
  },
  triggerButton: {
    backgroundColor: style.colors.bgDark,
    height: 20,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 5,
    right: 5
  },
  toolboxContainer: {
    backgroundColor: style.colors.bgLight,
    borderBottomColor: '#828282d6',
    borderBottomWidth: 1,
    padding: 5
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  indicatorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -1,
    marginBottom: 2
  },
  indicatorContainer: {
    backgroundColor: '#dcdcdcd6',
    padding: 2,
    margin: 1
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -1
  },
  actionButton: {
    backgroundColor: style.colors.bgDark,
    paddingLeft: 2,
    paddingRight: 2,
    margin: 1
  },
  actionButtonText: {
    color: 'white'
  }
})
