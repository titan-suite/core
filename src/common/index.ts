import * as web3Utils from 'web3-utils'

export interface Params {
  to?: string
  value?: number | string
  gas?: number | string
  gasPrice?: number | string
  data?: string
  nonce?: number
}
export interface TxParameters extends Params {
  from: string
}
export interface CallParameters extends Params {
  from?: string
}

export interface Execute {
  code: string
  abi: any[]
  from: string
  gas?: number
  gasPrice?: number
  args?: any[]
}

export default class Common {
  public nodeAddress: string
  public web3: any
  constructor(nodeAddress: string, web3: any) {
    this.nodeAddress = nodeAddress
    this.web3 = web3
  }

  getAccounts = async () => {
    return this.web3.eth.getAccounts()
  }

  getBalance = async (address: string): Promise<number> => {
    const balance = await this.web3.eth.getBalance(address)
    return web3Utils.fromWei(balance)
  }

  getBalancesWithAccounts = async (): Promise<
    Array<{ address: string; etherBalance: number }>
  > => {
    const addresses = await this.getAccounts()
    if (!addresses) {
      return []
    }
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
    return this.web3.eth.call(params)
  }

  sendTransaction = async (params: TxParameters) => {
    return this.web3.eth.sendTransaction(params)
  }

  getTxReceipt = async (txHash: string) => {
    return this.web3.eth.getTransactionReceipt(txHash)
  }

  getResponseWhenMined = async (functionCall: any) => {
    // const maxTries = 40
    // let tries = 0
    // while (tries < maxTries) {
    //   tries++
    //   try {
    //     if (process.env.NODE_ENV !== 'production') {
    //       console.log('checking...')
    //     }
    //     let receipt = await this.getTxReceipt(txHash)
    //     if (receipt) {
    //       return receipt
    //     }
    //     await sleep(2000)
    //   } catch (e) {
    //     throw e
    //   }
    // }
    // throw new Error('Request timed out')
    let txReceipt
    let txHash
    let confirmation
    const response = await functionCall
      .on('receipt', (Receipt: any) => {
        txReceipt = Receipt
      })
      .on('error', (error: any) => {
        throw error
      })
      .on('transactionHash', (TxHash: any) => {
        txHash = TxHash
        console.log({ txHash })
      })
      .on('confirmation', (confNumber: any, confReceipt: any) => {
        confirmation = { confNumber, confReceipt }
      })
    return {
      txReceipt,
      txHash,
      confirmation,
      response
    }
  }

  deploy = async ({
    code,
    abi,
    from,
    gas = 5000000,
    gasPrice = 10000000000,
    args
  }: Execute) => {
    const contract = new (this.web3.eth.Contract as any)(abi)
    return this.getResponseWhenMined(
      contract
        .deploy({
          data: code,
          arguments: args
        })
        .send({
          from,
          gas,
          gasPrice
        })
    )
  }
  getContract = (abi: any[], address: string) => {
    return new (this.web3.eth.Contract as any)(abi, address)
  }
  estimateGas = async (params: TxParameters): Promise<number> => {
    return this.web3.eth.estimateGas(params)
  }
}
