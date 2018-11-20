import * as web3Utils from 'web3-utils'
import { TransactionReceipt } from 'ethereum-types'
import { sleep, rpcPost } from '../../utils'
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
export interface Deploy {
  bytecode: string
  from: string
  gas?: number
  gasPrice?: number
  contractArguments?: string
}

export default class Common {
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
    ]).then(balance => Number(web3Utils.fromWei(balance)))
  }

  getBalancesWithAccounts = async (): Promise<
    Array<{ address: string; etherBalance: number }>
  > => {
    const addresses = await this.getAccounts()
    const accounts = []
    for (const address of addresses) {
      const etherBalance = await this.getBalance(address)
      accounts.push({
        address,
        etherBalance: Number(etherBalance)
      })
    }
    return accounts
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
    const maxTries = 40
    let tries = 0
    while (tries < maxTries) {
      tries++
      try {
        console.log('checking...')
        let receipt: TransactionReceipt = await this.getTxReceipt(txHash)
        if (receipt) {
          return receipt
        }
        await sleep(2000)
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
    let args = []
    if (contractArguments) {
      args = contractArguments
        .split(',')
        .map(arg => web3Utils.padLeft(web3Utils.toHex(arg).substring(2), 32))
    }
    const data = bytecode.concat(args.join(''))
    const txHash: string = await this.sendTransaction({
      from,
      data,
      gas,
      gasPrice
    })
    if (!txHash) {
      throw new Error('Transaction Failed')
    }
    console.log({ txHash })
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
    ]).then(estimatedGas => Number(web3Utils.hexToNumber(estimatedGas)))
  }
}
