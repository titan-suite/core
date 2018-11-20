// import solc from 'solc'
import { rpcPost } from '../../../utils'
import Common from '../../common'
export interface Deploy {
  bytecode: string
  from: string
  gas?: number
  gasPrice?: number
  contractArguments?: string
}
export default class Aion extends Common {
  constructor(nodeAddress: string) {
    super(nodeAddress)
  }
  // public static compile = async (input: string): Promise<any> => {
  //   // TODO https://github.com/ethereum/solc-js/pull/205
  //   // const output = solc.compile(input, 1)
  //   // return output
  // }
  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    return rpcPost(this.nodeAddress, 'eth_compileSolidity', [contract])
  }

  unlock = async (address: string, password: string): Promise<boolean> => {
    return rpcPost(this.nodeAddress, 'personal_unlockAccount', [
      address,
      password
    ])
  }
}
