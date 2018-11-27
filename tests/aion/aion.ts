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
      'pragma solidity ^0.4.9 contract Demo { address owner uint public test function Demo(uint t) public { owner = msg.sender test = t } }'
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

  it('should deploy a signed transaction to the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const code = compiled[WithConstructorContract.name].code
    const args = ['15']
    const data = code + aionMainnet.convertParams(args, 32)

    const gasPrice = await aionMainnet.web3.eth.gasPrice
    const rawTx = {
      from: testAccount2.address,
      data,
      gas: 2000000,
      gasPrice
    }

    await aionMainnet.web3.eth.accounts
      .signTransaction(rawTx, testAccount2.privateKey)
      .then(async (signed: any) => {
        console.log(signed)
        expect(signed.messageHash).to.not.equal('')
        await aionMainnet.web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .on('transactionHash', (hash: string) => {
            expect(hash).to.have.lengthOf(66)
          })
          .on('receipt', (receipt: any) => {
            expect(receipt.status).to.equal(true)
          })
          .on('confirmation', (confirmationNumber: number, receipt: any) => {
            mainnetContractAddress = receipt.contractAddress
            console.log(mainnetContractAddress)
            expect(mainnetContractAddress).to.not.be.null
          })
          .on('error', console.error)
      })
  }).timeout(0)

  it('should deploy a signed transaction to the testnet (mastery)', async () => {
    const compiled = await aionMastery.compile(WithConstructorContract.sol)
    const code = compiled[WithConstructorContract.name].code
    const args = ['15']
    const data = code + aionMastery.convertParams(args, 32)

    const gasPrice = await aionMastery.web3.eth.gasPrice
    const rawTx = {
      from: testAccount2.address,
      data,
      gas: 2000000,
      gasPrice
    }

    await aionMastery.web3.eth.accounts
      .signTransaction(rawTx, testAccount2.privateKey)
      .then(async (signed: any) => {
        expect(signed.messageHash).to.not.equal('')
        await aionMastery.web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .on('transactionHash', (hash: string) => {
            expect(hash).to.have.lengthOf(66)
          })
          .on('receipt', (receipt: any) => {
            expect(receipt.status).to.equal(true)
          })
          .on('confirmation', (confirmationNumber: number, receipt: any) => {
            expect(receipt.contractAddress).to.not.be.null
          })
          .on('error', console.error)
      })
  }).timeout(0)

  it('should send a signed transaction to a contract on the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    let address: string = mainnetContractAddress
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, address)
    const data = await mainnetContractInstance.methods.setA(5).encodeABI()
    const estimate = await mainnetContractInstance.methods
      .setA(5)
      .estimateGas()
    // console.log(estimate)
    const { gasLimit } = await aionMainnet.web3.eth.getBlock('latest')
    // console.log(gasLimit)
    const gasPrice = await aionMainnet.web3.eth.gasPrice
    const rawTx = {
      to: address,
      data,
      gas: 2000000
      // gasPrice
    }

    await aionMainnet.web3.eth.accounts
      .signTransaction(rawTx, testAccount2.privateKey)
      .then(async (signed: any) => {
        expect(signed.messageHash).to.not.equal('')
        await aionMainnet.web3.eth
          .sendSignedTransaction(signed.rawTransaction)
          .on('transactionHash', (hash: string) => {
            console.log(hash)
            expect(hash).to.have.lengthOf(66)
          })
          .on('receipt', (receipt: any) => {
            console.log(receipt)
            expect(receipt.status).to.equal(true)
          })
          .on('confirmation', (confirmationNumber: number, receipt: any) => {
            expect(receipt.contractAddress).to.not.be.null
          })
          .on('error', console.error)
      })
  }).timeout(0)

  it('should call a function in the contract on the mainnet', async () => {
    const compiled = await aionMainnet.compile(WithConstructorContract.sol)
    const abi: any = compiled[WithConstructorContract.name].info.abiDefinition
    let address: string = mainnetContractAddress
    mainnetContractInstance = new aionMainnet.web3.eth.Contract(abi, address)

    const val = await mainnetContractInstance.methods
      .num()
      .call({ from: testAccount1.address })
    console.log(val)
    expect(val).to.not.equal(0)
  }).timeout(0)
})
