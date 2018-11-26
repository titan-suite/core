// import solc from 'solc'
const Web3 = require('aion-web3')
import Common from '../../common'

export default class Aion extends Common {
  constructor(nodeAddress: string, isInjected: boolean = false, web3?: any) {
    super(
      nodeAddress,
      isInjected ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress))
    )
  }

  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    return this.web3.eth.compileSolidity(contract)
  }

  unlock = async (
    address: string,
    password: string,
    duration = 100000
  ): Promise<boolean> => {
    return this.web3.eth.personal.unlockAccount(address, password, duration)
  }
}
