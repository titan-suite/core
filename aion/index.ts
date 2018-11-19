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

  public static sha3 = async (input: any) => {
    return utils.soliditySha3(input)
  }

  public static fromWei = async (input: string | number): Promise<number> => {
    return Number(await utils.fromWei(input))
  }
  public static toWei = async (input: string | number) => {
    return utils.toWei(input)
  }

  public static toHex = async (input: any): Promise<string> => {
    return utils.toHex(input)
  }

  public static hexToNumber = async (input: any): Promise<number> => {
    return Number(await utils.hexToNumber(input))
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

  getAccounts = async (): Promise<string[]> => {
    return rpcPost(this.nodeAddress, 'eth_accounts')
  }

  getBalance = async (address: string): Promise<number> => {
    const balance = await rpcPost(this.nodeAddress, 'eth_getBalance', [
      address,
      'latest'
    ])
    return Aion.fromWei(balance)
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

  estimateGas = async ({
    bytecode,
    from,
    gas,
    gasPrice
  }: Deploy): Promise<number> => {
    const estimatedGas = await rpcPost(this.nodeAddress, 'eth_estimateGas', [
      {
        from,
        data: bytecode,
        gas,
        gasPrice
      }
    ])
    return Aion.hexToNumber(estimatedGas)
  }
}
