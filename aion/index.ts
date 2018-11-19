// import solc from 'solc'
import * as utils from 'web3-utils'
import { TransactionReceipt } from 'ethereum-types'
import { sleep, rpcPost } from '../utils'
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

  public static sha3 = (input: any) => {
    return utils.soliditySha3(input)
  }

  public static fromWei = (input: string | number): number => {
    return Number(utils.fromWei(input))
  }
  public static toWei = (input: string | number) => {
    return utils.toWei(input)
  }

  public static toHex = (input: any): string => {
    return utils.toHex(input)
  }

  public static hexToNumber = (input: any): number => {
    return Number(utils.hexToNumber(input))
  }

  public static padLeft = (
    target: string,
    characterAmount: number,
    sign?: string
  ): string => {
    return utils.padLeft(target, characterAmount, sign)
  }

  public nodeAddress: string
  constructor(nodeAddress: string) {
    this.nodeAddress = nodeAddress
  }

  getAccounts = async (): Promise<string[]> => {
    return rpcPost(this.nodeAddress, 'eth_accounts')
  }

  getBalance = async (address: string): Promise<number> => {
    return rpcPost(this.nodeAddress, 'eth_getBalance', [
      address,
      'latest'
    ]).then(balance => Aion.fromWei(balance))
  }

  compile = async (contract: string): Promise<{ [key: string]: any }> => {
    return rpcPost(this.nodeAddress, 'eth_compileSolidity', [contract])
  }

  unlock = async (address: string, password: string): Promise<boolean> => {
    return rpcPost(this.nodeAddress, 'personal_unlockAccount', [
      address,
      password
    ])
  }

  call = async (params: CallParameters) => {
    return rpcPost(this.nodeAddress, 'eth_call', [params, 'latest'])
  }

  sendTransaction = async (params: TxParameters): Promise<string> => {
    return rpcPost(this.nodeAddress, 'eth_sendTransaction', [params])
  }

  getTxReceipt = async (txHash: string): Promise<TransactionReceipt> => {
    return rpcPost(this.nodeAddress, 'eth_getTransactionReceipt', [txHash])
  }

  getReceiptWhenMined = async (txHash: string): Promise<TransactionReceipt> => {
    const maxTries = 15
    let tries = 0
    while (tries < maxTries) {
      try {
        console.log('checking...')
        let receipt: TransactionReceipt = await this.getTxReceipt(txHash)
        if (receipt && receipt.contractAddress) {
          return receipt
        }
        await sleep(3000)
        tries++
      } catch (e) {
        throw e
      }
    }
    throw new Error('Request timed out')
  }

  deploy = async ({
    bytecode,
    from,
    gas,
    gasPrice,
    contractArguments
  }: Deploy): Promise<{
    txReceipt: TransactionReceipt;
    txHash: string;
  }> => {
    if (!from || from.length !== 66) {
      throw new Error('Invalid Account')
    }
    let args = []
    if (contractArguments) {
      for (const arg of contractArguments.split(',')) {
        const hash = Aion.sha3(arg)
        const parsedHash = hash.substring(2, 10)
        args.push(parsedHash)
      }
    }
    const data = bytecode.concat(args.join(''))
    let txHash: string = await this.sendTransaction({
      from,
      data,
      gas,
      gasPrice
    })
    if (!txHash) {
      throw new Error('Transaction Failed')
    }
    const txReceipt = await this.getReceiptWhenMined(txHash)
    return { txReceipt, txHash }
  }

  estimateGas = async ({
    bytecode,
    from,
    gas,
    gasPrice
  }: Deploy): Promise<number> => {
    return rpcPost(this.nodeAddress, 'eth_estimateGas', [
      {
        from,
        data: bytecode,
        gas,
        gasPrice
      }
    ]).then(estimatedGas => Aion.hexToNumber(estimatedGas))
  }
}
