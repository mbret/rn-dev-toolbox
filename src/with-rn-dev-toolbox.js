/* global $Diff */
/**
 * @flow
 *
 */
import React, { Component } from 'react'
import { RNDevToolboxContext } from './RNDevToolbox'
import hoistStatics from 'hoist-non-react-statics'
import type { ComponentType } from 'react'
import type { DevTool } from './index'

/**
 * Inject the dev tool instance into the component.
 * @see https://flow.org/en/docs/react/hoc/
 */
export function withRNDevToolbox<Props: {}> (
  BaseComponent: ComponentType<Props>
): ComponentType<$Diff<Props, { reactNativeDevToolbox: DevTool | void }>> {
  class ComponentWithRNDevToolbox extends Component<*> {
    render () {
      return (
        <RNDevToolboxContext.Consumer>
          {rnDevToolbox => {
            return (
              <BaseComponent
                {...this.props}
                reactNativeDevToolbox={rnDevToolbox}
              />
            )
          }}
        </RNDevToolboxContext.Consumer>
      )
    }
  }

  return hoistStatics(ComponentWithRNDevToolbox, BaseComponent)
}
