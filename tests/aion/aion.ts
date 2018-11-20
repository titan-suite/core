import fs from 'fs'
import path from 'path'
import 'mocha'
import { expect } from 'chai'

import { nodeAddress } from '../../titanrc'
import * as web3Utils from 'web3-utils'

import Aion from '../../src/blockchains/aion'
const aion = new Aion(nodeAddress.aion)
const ExampleContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'Example.sol'),
    'utf8'
  ),
  name: 'Example'
}
const WithConstructorContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'WithConstructor.sol'),
    'utf8'
  ),
  name: 'WithConstructor'
}

describe('Test AION class methods', () => {
  let accounts: string[]
  let deployedContractAddress: string
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
    const response = await aion.unlock(accounts[0], 'PLAT4life')
    expect(response).to.be.true
  }).timeout(0)

  it('successfully returns sha3 of a input', async () => {
    const signature = 'name()'
    const response = await web3Utils.soliditySha3(signature)
    expect(response)
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)

  it('successfully compiles a contract and estimates gas', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; uint public test; function Demo(uint t) public { owner = msg.sender; test = t; } }'
    const response = await aion.compile(sol)
    const bytecode = response['Demo'].code
    const estimatedGas = await aion.estimateGas({
      bytecode,
      from: accounts[0],
      gas: 2000000
    })
    expect(estimatedGas)
      .be.a('number')
      .to.be.greaterThan(20000)
    expect(bytecode).to.be.an('string')
  }).timeout(0)

  it('successfully deploys the Example contract', async () => {
    const compiled = await aion.compile(ExampleContract.sol)
    const bytecode = compiled[ExampleContract.name].code
    const res = await aion.deploy({
      bytecode,
      from: accounts[0],
      gas: 2000000,
      parameters: ['15'],
      padLength: 32
    })
    if (res) {
      expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    } else {
      throw new Error('Failed to deploy')
    }
  }).timeout(0)

  it('successfully deploys the WithConstructor contract with arguments', async () => {
    const compiled = await aion.compile(WithConstructorContract.sol)
    const bytecode = compiled[WithConstructorContract.name].code

    const res = await aion.deploy({
      bytecode,
      from: accounts[0],
      gas: 2000000,
      parameters: ['15'],
      padLength: 32
    })
    if (res) {
      deployedContractAddress = res.txReceipt.contractAddress as string
      expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    } else {
      throw new Error('Failed to deploy')
    }
  }).timeout(0)

  it('gets back the value of num', async () => {
    let funcHash = await web3Utils.soliditySha3('getNum()')
    funcHash = funcHash.substring(0, 10)
    let res = await aion.call({
      from: accounts[0],
      to: deployedContractAddress,
      data: funcHash
    })

    res = await web3Utils.hexToNumber(res)
    expect(res).to.equal(16)
  }).timeout(0)

  it('gets back 27 after adding 12 to num', async () => {
    const funcHash = await web3Utils.soliditySha3('add(uint128)')
    const param = web3Utils.numberToHex(12).substring(2)
    const paddedParam = await web3Utils.leftPad(param, 32, '0')
    const data = funcHash.substring(0, 10) + paddedParam

    let res = await aion.call({
      from: accounts[0],
      to: deployedContractAddress,
      data
    })

    res = await web3Utils.hexToNumber(res)
    expect(res).to.equal(27)
  }).timeout(0)
})
