// import solc from 'solc'
import Common from '../../common'

export default class Ethereum extends Common {
  constructor(nodeAddress: string) {
    super(nodeAddress)
  }
  // public static compile = async (input: string): Promise<any> => {
  //   // TODO https://github.com/ethereum/solc-js/pull/205
  //   // const output = solc.compile(input, 1)
  //   // return output
  // }
  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    throw new Error('Compiler not setup for ethereum')
  }
}
