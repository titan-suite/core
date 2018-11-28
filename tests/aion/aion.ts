import fs from 'fs'
import path from 'path'
import 'mocha'
import { expect } from 'chai'

import { nodeAddress, testAccount1, testAccount2 } from '../../titanrc'

import Aion from '../../src/blockchains/aion'
const aion = new Aion(nodeAddress.aion)
const aionMainnet = new Aion(nodeAddress.aionMainnet)
const aionMastery = new Aion(nodeAddress.aionMastery)

const WithConstructorContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'WithConstructor.sol'),
    'utf8'
  ),
  name: 'WithConstructor'
}

describe('Test AION class methods', () => {
  let accounts: string[]
  let contractInstance: any
  let mainnetContractInstance: any
  let mainnetContractAddress: any
  let masteryContractInstance: any
  let masteryContractAddress: any

  it('get all accounts', async () => {
    accounts = await aion.getAccounts()
    expect(accounts)
      .to.be.an('array')
      .to.have.length.above(0)
    expect(accounts[0])
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)

  it('get balances for all account', async () => {
    const wallet = await aion.getBalancesWithAccounts()
    expect(wallet[0].address)
      .to.be.an('string')
      .to.have.lengthOf(66)
    expect(wallet[0].etherBalance).to.be.a('number')
  }).timeout(0)

  it('successfully unlocks the first account', async () => {
    const response = await aion.unlock(accounts[0], 'PLAT4life', 200000)
    expect(response).to.be.true
  }).timeout(0)

  it('successfully compiles a contract and estimates gas', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; uint public test; function Demo(uint t) public { owner = msg.sender; test = t; } }'
    const response = await aion.compile(sol)
    const code = response['Demo'].code
    const estimatedGas = await aion.estimateGas({
      data: code,
      from: accounts[0],
      gas: 2000000
    })
    expect(estimatedGas)
      .be.a('number')
      .to.be.greaterThan(20000)
    expect(code).to.be.an('string')
  }).timeout(0)

  it('successfully deploys the WithConstructor contract with arguments', async () => {
    const compiled = await aion.compile(WithConstructorContract.sol)
    const abi = compiled[WithConstructorContract.name].info.abiDefinition
    const code = compiled[WithConstructorContract.name].code
    const res: any = await aion.deploy({
      abi,
      code,
      from: accounts[0],
      gas: 2000000,
      args: ['15']
    })
    contractInstance = res.response
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(true).to.equal(true)
  }).timeout(0)

  it('gets back the value of num', async () => {
    const num = await contractInstance.methods
      .getNum()
      .call({ from: accounts[0] })
    expect(num).to.equal('16')
  }).timeout(0)

  it('set value of num and expect add result to be 4', async () => {
    const res: any = await aion.getResponseWhenMined(
      contractInstance.methods.setA(2).send({ from: accounts[0], gas: 2000000 })
    )
    const num = await contractInstance.methods
      .add(2)
      .call({ from: accounts[0] })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(num).to.equal('4')
  }).timeout(0)

  it('expect mainnet id to equal 1', async () => {
    expect(await aionMainnet.isMainnet()).to.equal(true)
  }).timeout(0)

  it('should create an account', async () => {
    const { privateKey, address } = await aionMainnet.newAccount()
    expect(privateKey).to.not.equal('')
    expect(address).to.not.equal('')
  }).timeout(0)

  it('should deploy a contract as a signed transaction to the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const code = compiled[WithConstructorContract.name].code
    const args = ['15']
    const data = code + aionMainnet.encodeArguments(args, 32)

    const gasPrice = await aionMainnet.web3.eth.gasPrice
    const rawTx = {
      from: testAccount2.address,
      data,
      gas: 2000000,
      gasPrice
    }

    const signedTx = await aionMainnet.signTransaction(
      rawTx,
      testAccount2.privateKey
    )
    const { txReceipt } = await aionMainnet.sendSignedTransaction(
      signedTx.rawTransaction
    )
    mainnetContractAddress = txReceipt!.contractAddress
    expect(mainnetContractAddress).to.not.be.null
  }).timeout(0)

  it('should send a signed transaction to a contract on the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    const address: string = mainnetContractAddress
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, address)
    const data = await mainnetContractInstance.methods.setA(5).encodeABI()
    const rawTx = {
      to: address,
      data,
      gas: 2000000
      // gasPrice
    }

    const signedTx = await aionMainnet.signTransaction(
      rawTx,
      testAccount2.privateKey
    )
    const { txReceipt } = await aionMainnet.sendSignedTransaction(
      signedTx.rawTransaction
    )
    expect(txReceipt!.logs).to.not.be.empty
  }).timeout(0)

  it('should call a function in the contract on the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    let address: string = mainnetContractAddress
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, address)

    const val = await mainnetContractInstance.methods
      .num()
      .call({ from: testAccount1.address })

    expect(val).to.not.equal(0)
  }).timeout(0)

  it('should deploy a contract as a signed transaction to the testnet (mastery)', async () => {
    const compiled = await aionMastery.compile(WithConstructorContract.sol)
    const code = compiled[WithConstructorContract.name].code
    const args = ['15']
    const data = code + aionMastery.encodeArguments(args, 32)

    const gasPrice = await aionMastery.web3.eth.gasPrice
    const rawTx = {
      from: testAccount2.address,
      data,
      gas: 2000000,
      gasPrice
    }

    const signedTx = await aionMastery.signTransaction(
      rawTx,
      testAccount2.privateKey
    )
    const { txReceipt } = await aionMastery.sendSignedTransaction(
      signedTx.rawTransaction
    )
    masteryContractAddress = txReceipt!.contractAddress
    console.log(masteryContractAddress)
    expect(masteryContractAddress).to.not.be.null
    expect(txReceipt!.status).to.equal(true)
  }).timeout(0)

  it('should send a signed transaction to a contract on the testnet (mastery) ', async () => {
    const compiled = await aionMastery.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    const address: string = masteryContractAddress
    masteryContractInstance = new aionMastery.web3.eth.Contract(abi, address)
    const data = await masteryContractInstance.methods.setA(5).encodeABI()
    const rawTx = {
      to: address,
      data,
      gas: 2000000
      // gasPrice
    }

    const signedTx = await aionMastery.signTransaction(
      rawTx,
      testAccount1.privateKey
    )
    const { txReceipt } = await aionMastery.sendSignedTransaction(
      signedTx.rawTransaction
    )
    expect(txReceipt!.logs).to.not.be.empty
  }).timeout(0)

  it('should call a function in the contract on the testnet (mastery) ', async () => {
    const compiled = await aionMastery.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    let address: string = masteryContractAddress
    masteryContractInstance = new aionMastery.web3.eth.Contract(abi, address)

    const val = await masteryContractInstance.methods
      .num()
      .call({ from: testAccount1.address })

    expect(val).to.not.equal(0)
  }).timeout(0)
})
