import * as web3Utils from 'web3-utils'
import { TransactionReceipt } from 'ethereum-types'
const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
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
  public isOldWeb3: boolean
  public web3: any
  constructor(isOldWeb3: boolean, web3: any) {
    this.isOldWeb3 = isOldWeb3
    this.web3 = web3
  }

  getAccounts = async (): Promise<string[]> => {
    if (this.isOldWeb3) {
      return new Promise(async (resolve, reject) => {
        return resolve(await this.web3.eth.accounts)
      }) as Promise<string[]>
    }
    return this.web3.eth.getAccounts()
  }

  getBalance = async (address: string): Promise<number> => {
    if (this.isOldWeb3) {
      return new Promise((resolve, reject) => {
        this.web3.eth.getBalance(address, (err: any, bal: number) => {
          if (err) {
            return reject(err)
          }
          return resolve(web3Utils.fromWei(`${bal}`))
        })
      }) as Promise<number>
    }
    const balance = await this.web3.eth.getBalance(address)
    return web3Utils.fromWei(balance, 'ether')
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

  getTxReceipt = async (txHash: string): Promise<TransactionReceipt> => {
    return this.web3.eth.getTransactionReceipt(txHash)
  }

  getResponseWhenMined = async (functionCall: any) => {
    let txReceipt: undefined | TransactionReceipt
    let txHash: undefined | string
    const response = await functionCall
      .on('receipt', (Receipt: TransactionReceipt) => {
        txReceipt = Receipt
      })
      .on('error', (error: Error) => {
        throw error
      })
      .on('transactionHash', (TxHash: string) => {
        txHash = TxHash
        console.log({ txHash })
      })
    return {
      txReceipt,
      txHash,
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
    if (this.isOldWeb3) {
      return this.InjectedDeploy({
        abi,
        code,
        from,
        gas,
        args
      }) as Promise<{
        txHash: any;
        txReceipt: any;
      }>
    }
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
  convertParams = (params: any[], length: number) => {
    let res = params.map(arg =>
      this.web3.utils.padLeft(this.web3.utils.toHex(arg).substring(2), length)
    )
    return res
  }
  // InjectedGetResponseWhenMined = async (txHash: string) => {
  //   const maxTries = 40
  //   let tries = 0
  //   while (tries < maxTries) {
  //     tries++
  //     try {
  //       if (process.env.NODE_ENV !== 'production') {
  //         console.log('checking...')
  //       }
  //       let receipt = await this.getTxReceipt(txHash)
  //       if (receipt) {
  //         return receipt
  //       }
  //       await sleep(5000)
  //     } catch (e) {
  //       throw e
  //     }
  //   }
  //   throw new Error('Request timed out')
  // }

  InjectedWeb3DeployContract = async ({
    abi,
    code,
    from,
    gas,
    args
  }: Execute) => {
    return new Promise((resolve, reject) => {
      if (args && args.length > 0) {
        this.web3.eth.contract(abi).new(
          args,
          {
            from,
            data: code,
            gas
          },
          (err: any, contract: any) => {
            if (err) {
              reject(err)
            } else if (contract && contract.address) {
              resolve({
                txHash: contract.transactionHash,
                txReceipt: this.web3.eth.getTransactionReceipt(
                  contract.transactionHash
                )
              })
            }
          }
        )
      } else {
        this.web3.eth.contract(abi).new(
          {
            from,
            data: code,
            gas
          },
          (err: any, contract: any) => {
            if (err) {
              reject(err)
            } else if (contract && contract.address) {
              resolve({
                txHash: contract.transactionHash,
                txReceipt: this.web3.eth.getTransactionReceipt(
                  contract.transactionHash
                )
              })
            }
          }
        )
      }
    })
  }

  InjectedDeploy = async ({ abi, code, from, gas, args }: Execute) => {
    try {
      const deployedContract = await this.InjectedWeb3DeployContract({
        abi,
        code,
        from,
        gas,
        args
      })
      return deployedContract
    } catch (e) {
      throw e
    }
  }
}
