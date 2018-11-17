import { AbiDefinition } from 'ethereum-types'
import Web3 from 'aion-web3-core'
interface Deploy {
  deployedAddress: string
  abi: AbiDefinition[]
  code: string
  mainAccount: string
  gas: number
  gasPrice: number
  contractArguments: string
}
export default class Aion {
  web3: Web3
  constructor(providerUrl: string) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(providerUrl))
  }

  getAccounts = async () => this.web3.eth.getAccounts()

  getBalance = async (address: string) =>
    this.web3.utils.fromNAmp(await this.web3.eth.getBalance(address), 'nAmp')

  unlock = (address: string, password: string) =>
    this.web3.eth.personal.unlockAccount(address, password)

  deploy = async ({
    deployedAddress,
    abi,
    code,
    mainAccount,
    gas,
    gasPrice,
    contractArguments
  }: Deploy) => {
    let receipt
    let txHash
    let confirmation
    const contract = new this.web3.eth.Contract(abi, deployedAddress, {
      from: mainAccount,
      data: code,
      gas
    })
    const newContractInstance = await contract
      .deploy({
        data: code,
        arguments: [...contractArguments.split(',')]
      })
      .send({
        from: mainAccount,
        gas,
        gasPrice
      })
      .on('receipt', _receipt => {
        receipt = _receipt
      })
      .on('error', error => {
        throw error
      })
      .on('transactionHash', _txHash => {
        txHash = _txHash
      })
      .on('confirmation', (confNumber, confReceipt) => {
        confirmation = { confNumber, confReceipt }
      })
    return {
      receipt,
      txHash,
      confirmation,
      newContractInstance
    }
  }

  estimateGas = async ({
    deployedAddress,
    abi,
    code,
    mainAccount,
    gas,
    contractArguments
  }: Deploy) => {
    const contract = new this.web3.eth.Contract(abi, deployedAddress, {
      from: mainAccount,
      data: code,
      gas
    })
    const estimatedGas = await contract
      .deploy({
        data: code,
        arguments: [...contractArguments.split(',')]
      })
      .estimateGas()
    return estimatedGas
  }
}
