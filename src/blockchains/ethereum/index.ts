import Common from '../../common'
const Web3 = require('web3')
export default class Ethereum extends Common {
  constructor(nodeAddress: string, isOldWeb3: boolean = false, web3?: any) {
    super(isOldWeb3, isOldWeb3 ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress)))
  }

  isMainnet = async (): Promise<boolean> => {
    return (await this.getNetworkId()) === 1
  }
}
