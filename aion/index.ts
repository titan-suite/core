import axios from 'axios'

export interface Deploy {
  code: string
  mainAccount: string
  gas: number
  gasPrice: number
  contractArguments?: string
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
    const {
      data: { result: txHash }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
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
    const {
      data: { result: txReceipt }
    } = await axios.post(this.nodeAddress, {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1
    })
  }

  estimateGas = async ({ code, mainAccount, gas, gasPrice }: Deploy) => {
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
