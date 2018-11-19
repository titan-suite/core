// import solc from 'solc'
import * as web3Utils from 'web3-utils'
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
  public nodeAddress: string
  constructor(nodeAddress: string) {
    this.nodeAddress = nodeAddress
  }
  // public static compile = async (input: string): Promise<any> => {
  //   // TODO https://github.com/ethereum/solc-js/pull/205
  //   // const output = solc.compile(input, 1)
  //   // return output
  // }

  getAccounts = async (): Promise<string[]> => {
    return rpcPost(this.nodeAddress, 'eth_accounts')
  }

  getBalance = async (address: string): Promise<number> => {
    return rpcPost(this.nodeAddress, 'eth_getBalance', [
      address,
      'latest'
    ]).then(balance => Number(web3Utils.fromWei(balance)))
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
    return rpcPost(this.nodeAddress, 'eth_call', [params])
  }

  sendTransaction = async (params: TxParameters): Promise<string> => {
    return rpcPost(this.nodeAddress, 'eth_sendTransaction', [params])
  }

  getTxReceipt = async (txHash: string): Promise<TransactionReceipt> => {
    return rpcPost(this.nodeAddress, 'eth_getTransactionReceipt', [txHash])
  }

  getReceiptWhenMined = async (txHash: string): Promise<TransactionReceipt> => {
    const maxTries = 20
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
        const hash = web3Utils.toHex(arg)
        const parsedHash = web3Utils.padLeft(hash.substring(2), 32)
        args.push(parsedHash)
      }
    }
    const data = bytecode.concat(args.join(''))
    let txHash: string
    return this.sendTransaction({
      from,
      data,
      gas,
      gasPrice
    })
      .then(TxHash => {
        console.log({ TxHash })
        txHash = TxHash
        if (!txHash) {
          throw new Error('Transaction Failed')
        }
        return this.getReceiptWhenMined(txHash)
      })
      .then(txReceipt => {
        return { txReceipt, txHash }
      })
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
    ]).then(estimatedGas => Number(web3Utils.hexToNumber(estimatedGas)))
  }
}
