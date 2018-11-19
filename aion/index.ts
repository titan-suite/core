import axios from 'axios'
// import solc from 'solc'
import * as utils from 'web3-utils'

import { TransactionReceipt } from 'ethereum-types'
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export interface Deploy {
  bytecode: string
  from: string
  gas?: number
  gasPrice?: number
  contractArguments?: string
}
export interface TxParameters {
  from: string
  to?: string
  gas?: number
  gasPrice?: number
  value?: number
  data: string
  nonce?: number
}
export interface CallParameters {
  from: string
  to: string
  gas?: number
  gasPrice?: number
  value?: number
  data?: string
}
export default class Aion {
  // public static compile = async (input: string): Promise<any> => {
  //   // TODO https://github.com/ethereum/solc-js/pull/205
  //   // const output = solc.compile(input, 1)
  //   // return output
  // }

  public static sha3 = async (input: any) => {
    return utils.soliditySha3(input)
  }

  public static fromWei = async (input: string | number) => {
    return utils.fromWei(input)
  }
  public static toWei = async (input: string | number) => {
    return utils.toWei(input)
  }

  public static toHex = async (input: any): Promise<string> => {
    return utils.toHex(input)
  }

  public static hexToNumber = async (input: any): Promise<number> => {
    return utils.hexToNumber(input)
  }

  public static padLeft = async (
    target: string,
    characterAmount: number,
    sign?: string
  ): Promise<string> => {
    return utils.padLeft(target, characterAmount, sign)
  }

  public nodeAddress: string
  constructor(nodeAddress: string) {
    this.nodeAddress = nodeAddress
  }

  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_compileSolidity',
      params: [contract],
      id: 1
    })
    return result
  }
  getAccounts = async (): Promise<string[]> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_accounts',
      params: [],
      id: 1
    })
    return result
  }

  getBalance = async (address: string): Promise<number> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1
    })
    return +Aion.fromWei(result)
  }

  unlock = async (address: string, password: string): Promise<boolean> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'personal_unlockAccount',
      params: [address, password],
      id: 1
    })
    return result
  }

  deploy = async ({
    bytecode,
    from,
    gas,
    gasPrice,
    contractArguments
  }: Deploy) => {
    let args = []
    if (contractArguments) {
      for (const arg of contractArguments.split(',')) {
        const hash = await Aion.sha3(arg)
        const parsedHash = hash.substring(2, 10)
        args.push(parsedHash)
      }
    }
    const data = bytecode.concat(args.join(''))
    const txHash = await this.sendTransaction({
      from,
      data,
      gas,
      gasPrice
    })
    const txReceipt = await this.getReceiptWhenMined(txHash)
    return { txHash, txReceipt }
  }

  sendTransaction = async (params: TxParameters): Promise<string> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [params],
      id: 1
    })
    return result
  }

  getReceiptWhenMined = async (txHash: string): Promise<TransactionReceipt> => {
    while (true) {
      try {
        console.log('checking...')
        let receipt: TransactionReceipt = await this.getTxReceipt(txHash)
        if (receipt && receipt.contractAddress) {
          return receipt
        }
        await sleep(3000)
      } catch (e) {
        throw e
      }
    }
  }

  getTxReceipt = async (txHash: string): Promise<TransactionReceipt> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1
    })
    return result
  }

  estimateGas = async ({
    bytecode,
    from,
    gas,
    gasPrice
  }: Deploy): Promise<any> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_estimateGas',
      params: [
        {
          from,
          data: bytecode,
          gas,
          gasPrice
        }
      ],
      id: 1
    })
    return Aion.hexToNumber(result)
  }

  call = async (params: CallParameters): Promise<any> => {
    const {
      data: { result }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [params, 'latest'],
      id: 1
    })
    return result
  }
}
