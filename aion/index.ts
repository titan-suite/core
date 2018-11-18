import axios from 'axios'
import { TransactionReceipt } from 'ethereum-types'
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
export interface Deploy {
  code: string
  mainAccount: string
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
export default class Aion {
  public nodeAddress: string

  constructor(nodeAddress: string) {
    this.nodeAddress = nodeAddress
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
    return +result
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
    code,
    mainAccount,
    gas,
    gasPrice,
    contractArguments
  }: Deploy) => {
    const txHash = await this.sendTransaction({
      from: mainAccount,
      data: code,
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

  getReceiptWhenMined = async (txHash: string) => {
    return new Promise(async (resolve, reject) => {
      while (true) {
        console.log('checking...')
        let receipt: TransactionReceipt = await this.getTxReceipt(txHash)
        if (receipt && receipt.contractAddress) {
          resolve(receipt)
          break
        }
        await sleep(3000)
      }
    }) as Promise<TransactionReceipt>
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
    code,
    mainAccount,
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
          from: mainAccount,
          data: code,
          gas,
          gasPrice
        }
      ],
      id: 1
    })
    return result
  }
}
