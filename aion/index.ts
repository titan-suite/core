import { ContractAbi, AbiDefinition, TransactionReceipt } from 'ethereum-types'

export const getAccounts = (web3: any) => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err: any, acc: string[]) => {
      if (err) {
        reject(err)
      }
      resolve(acc)
    })
  })
}
export const getBalance = (
  {
    address
  }: {
    address: string
  },
  web3: any
) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(address, (err: any, balance: number) => {
      if (err) {
        reject(err)
      }
      resolve(web3.fromWei(balance, 'ether'))
    })
  })
}

export const compile = async (
  {
    contract
  }: {
    contract: string
  },
  web3: any
): Promise<{ [key: string]: any }> => {
  return new Promise((resolve, reject) => {
    web3.eth.compile.solidity(contract, (err: any, res: any) => {
      if (err) {
        return reject(err)
      }
      if ('compile-error' in res) {
        return reject(res['compile-error'].error)
      }
      if (res) {
        return resolve(res)
      }
    })
  })
}

export const unlock = async (
  {
    mainAccount,
    mainAccountPass
  }: {
    mainAccount: string
    mainAccountPass: string
  },
  web3: any
) => {
  return new Promise((resolve, reject) => {
    web3.personal
      ? web3.personal.unlockAccount(
          mainAccount,
          mainAccountPass,
          999999,
          (err: any, isUnlocked: boolean) => {
            if (err) {
              return reject(err)
            } else if (isUnlocked && isUnlocked === true) {
              return resolve(isUnlocked)
            } else {
              return reject('unlock failed')
            }
          }
        )
      : reject('Invalid Web3')
  })
}

const Web3DeployContract = async (
  {
    abi,
    code,
    mainAccount,
    gas,
    contractArguments
  }: {
    abi: ContractAbi
    code: string
    mainAccount: string
    gas: number
    contractArguments: string | null | undefined
  },
  web3: any
): Promise<{
  abi?: ContractAbi
  address?: string
  receipt?: TransactionReceipt
}> => {
  return new Promise((resolve, reject) => {
    if (contractArguments && contractArguments.length > 0) {
      web3.eth.contract(abi).new(
        ...contractArguments.split(','),
        {
          from: mainAccount,
          data: code,
          gas
        },
        (err: any, contract: any) => {
          if (err) {
            reject(err)
          } else if (contract && contract.address) {
            resolve({
              ...contract,
              receipt: web3.eth.getTransactionReceipt(contract.transactionHash)
            })
          }
        }
      )
    } else {
      web3.eth.contract(abi).new(
        {
          from: mainAccount,
          data: code,
          gas
        },
        (err: any, contract: any) => {
          if (err) {
            reject(err)
          } else if (contract && contract.address) {
            resolve({
              ...contract,
              receipt: web3.eth.getTransactionReceipt(contract.transactionHash)
            })
          }
        }
      )
    }
  })
}

export const deploy = async (
  {
    abi,
    code,
    mainAccount,
    gas,
    contractArguments
  }: {
    abi: AbiDefinition[]
    code: string
    mainAccount: string
    gas: number
    contractArguments: string | null | undefined
  },
  web3: any
) => {
  try {
    const deployedContract = await Web3DeployContract(
      {
        abi,
        code,
        mainAccount,
        gas,
        contractArguments
      },
      web3
    )
    return deployedContract
  } catch (e) {
    throw e
  }
}
