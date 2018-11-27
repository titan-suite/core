// import solc from 'solc'
const Web3 = require('aion-web3')
import Common from '../../common'

export default class Aion extends Common {
  constructor(nodeAddress: string, isOldWeb3: boolean = false, web3?: any) {
    super(
      isOldWeb3,
      isOldWeb3 ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress))
    )
  }

  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    if (this.isOldWeb3) {
      return new Promise((resolve, reject) => {
        this.web3.eth.compile.solidity(contract, (err: any, res: any) => {
          if (err) {
            return reject(err)
          }
          if ('compile-error' in res) {
            return reject(res['compile-error'].error)
          }
          if (res) {
            return resolve(res)
          }
        })
      })
    }
    return this.web3.eth.compileSolidity(contract)
  }

  unlock = async (
    address: string,
    password: string,
    duration = 100000
  ): Promise<boolean> => {
    if (this.isOldWeb3) {
      return new Promise((resolve, reject) => {
        this.web3.personal
          ? this.web3.personal.unlockAccount(
              address,
              password,
              duration,
              (err: any, isUnlocked: boolean) => {
                if (err) {
                  return reject(err)
                } else if (isUnlocked && isUnlocked === true) {
                  return resolve(isUnlocked)
                } else {
                  return reject('unlock failed')
                }
              }
            )
          : reject('Invalid Web3')
      }) as Promise<boolean>
    }
    return this.web3.eth.personal.unlockAccount(address, password, duration)
  }
}
