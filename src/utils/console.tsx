/**
 *
 */
import myPackage from '../../package.json'

let deprecationsSeen: any = {}

const consoleWarn = (...args: any[]) => {
  if (typeof console === 'object' && typeof console.warn === 'function') {
    console.warn(...args)
  }
}

export const deprecate = (msg: any) => {
  if (!deprecationsSeen[msg]) {
    deprecationsSeen[msg] = true
    consoleWarn(`${myPackage.name} | DEPRECATION: ${msg}`)
  }
}

export const warn = (msg: string) => {
  consoleWarn(`${myPackage.name} | WARNING: ${msg}`)
}