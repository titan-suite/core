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
  sol: fs.readFileSync(path.resolve(__dirname, 'contracts', 'WithConstructor.sol'), 'utf8'),
  name: 'WithConstructor',
}

describe('Test AION class methods', () => {
  let accounts: string[]
  let contractInstance: any
  let mainnetContractInstance: any
  let mainnetContractAddress: any
  let masteryContractInstance: any
  let masteryContractAddress: any
  let compiled: any
  let abi: any
  let code: any
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

  it('expect mainnet id to equal 1', async () => {
    expect(await aionMainnet.isMainnet()).to.equal(true)
  }).timeout(0)

  it('should create an account', async () => {
    const { privateKey, address } = await aionMainnet.newAccount()
    expect(privateKey)
      .to.be.an('string')
      .to.have.lengthOf(130)
    expect(address)
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)

  it('successfully compiles a contract and estimates gas', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; uint public test; function Demo(uint t) public { owner = msg.sender; test = t; } }'
    const response = await aion.compile(sol)
    const estimatedGas = await aion.estimateGas({
      data: await response['Demo'].code,
      from: accounts[0],
      gas: 2000000,
    })
    expect(estimatedGas)
      .be.a('number')
      .to.be.greaterThan(20000)
  }).timeout(0)

  it('successfully deploys the WithConstructor contract with arguments', async () => {
    compiled = await aion.compile(WithConstructorContract.sol)
    abi = compiled[WithConstructorContract.name].info.abiDefinition
    code = compiled[WithConstructorContract.name].code
    const res: any = await aion.deploy({
      abi,
      code,
      from: accounts[0],
      gas: 2000000,
      args: ['15'],
    })
    contractInstance = res.response
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(true).to.equal(true)
  }).timeout(0)

  it('gets back the value of num', async () => {
    const num = await contractInstance.methods.getNum().call({ from: accounts[0] })
    expect(num).to.equal('16')
  }).timeout(0)

  it('set value of num and expect add result to be 4', async () => {
    const res: any = await aion.executeContractFunction({ func: contractInstance.methods.setA(2), from: accounts[0] })
    const num = await contractInstance.methods.add(2).call({ from: accounts[0] })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(num).to.equal('4')
  }).timeout(0)

  it('should deploy a contract as a signed transaction to the mainnet', async () => {
    const res = await aionMainnet.deploy({
      code,
      args: ['15'],
      from: testAccount2.address,
      gasPrice: await aionMainnet.web3.eth.gasPrice,
      privateKey: testAccount2.privateKey,
    })
    mainnetContractAddress = res.txReceipt.contractAddress
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('should send a signed transaction to a contract on the mainnet', async () => {
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, mainnetContractAddress)
    const res: any = await aionMainnet.executeContractFunction({
      func: mainnetContractInstance.methods.setA(5),
      to: mainnetContractAddress,
      gas: 2000000,
      privateKey: testAccount2.privateKey,
    })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('should call a function in the contract on the mainnet', async () => {
    let address: string = mainnetContractAddress
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, address)
    const num = await mainnetContractInstance.methods.num().call({ from: testAccount1.address })
    expect(num).to.equal('5')
  }).timeout(0)

  it('should deploy a contract as a signed transaction to the testnet (mastery)', async () => {
    const res: any = await aionMastery.deploy({
      code,
      args: ['15'],
      gas: 2000000,
      from: testAccount2.address,
      gasPrice: await aionMastery.web3.eth.gasPrice,
      privateKey: testAccount2.privateKey,
    })
    masteryContractAddress = res.txReceipt.contractAddress
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(masteryContractAddress).to.not.be.null
    expect(res.txReceipt.status).to.equal(true)
  }).timeout(0)

  it('should send a signed transaction to a contract on the testnet (mastery) ', async () => {
    masteryContractInstance = new aionMastery.web3.eth.Contract(abi, masteryContractAddress)
    const res: any = await aionMastery.executeContractFunction({
      func: masteryContractInstance.methods.setA(5),
      to: masteryContractAddress,
      gas: 2000000,
      privateKey: testAccount2.privateKey,
    })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('should call a function in the contract on the testnet (mastery) ', async () => {
    masteryContractInstance = new aionMastery.web3.eth.Contract(abi, masteryContractAddress)
    const num = await masteryContractInstance.methods.num().call({ from: testAccount1.address })
    expect(num).to.equal('15')
  }).timeout(0)
})
