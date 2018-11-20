import fs from 'fs'
import path from 'path'
import 'mocha'
import { expect } from 'chai'
import solc from 'solc'

import { nodeAddress } from '../../titanrc'
import * as web3Utils from 'web3-utils'

import Ethereum from '../../src/blockchains/ethereum'
const ethereum = new Ethereum(nodeAddress.ethereum)
const ExampleContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'Example.sol'),
    'utf8'
  ),
  name: ':Example'
}
const WithConstructorContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'WithConstructor.sol'),
    'utf8'
  ),
  name: ':WithConstructor'
}

describe('Test Ethereum class methods', () => {
  let accounts: string[]
  let deployedContractAddress: string
  it('get all accounts', async () => {
    accounts = await ethereum.getAccounts()
    expect(accounts)
      .to.be.an('array')
      .to.have.length.above(0)
    expect(accounts[0])
      .to.be.an('string')
      .to.have.lengthOf(42)
  }).timeout(0)

  it('get balances for first account', async () => {
    let wallet = await ethereum.getBalancesWithAccounts()
    expect(wallet[0].account)
      .to.be.an('string')
      .to.have.lengthOf(42)
    expect(wallet[0].etherBalance).to.be.a('number')
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
      'pragma solidity ^0.4.9; contract Demo { address owner; function Demo() public {} }'
    const response = await solc.compile(sol, 1)
    const bytecode = response.contracts[':Demo'].bytecode
    const estimatedGas = await ethereum.estimateGas({
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
    const compiled = await solc.compile(ExampleContract.sol)
    const bytecode = compiled.contracts[ExampleContract.name].bytecode
    const res = await ethereum.deploy({
      bytecode,
      from: accounts[0],
      gas: 2000000
    })
    if (res) {
      expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    } else {
      throw new Error('Failed to deploy')
    }
  }).timeout(0)

  it('successfully deploys the WithConstructor contract with arguments', async () => {
    const compiled = await solc.compile(WithConstructorContract.sol)
    const bytecode = compiled.contracts[WithConstructorContract.name].bytecode

    const res = await ethereum.deploy({
      bytecode,
      from: accounts[0],
      contractArguments: '15,Titan',
      gas: 2000000
    })
    if (res) {
      deployedContractAddress = res.txReceipt.contractAddress as string
      expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    } else {
      throw new Error('Failed to deploy')
    }
  }).timeout(0)

  it('gets back 20 after sending 5 to contract', async () => {
    let funcHash = await web3Utils.soliditySha3('add(uint128)')
    const paddedValue = await web3Utils.padLeft('5', 64)
    funcHash = funcHash.substring(0, 10) + paddedValue
    let res = await ethereum.call({
      from: accounts[0],
      to: deployedContractAddress,
      data: funcHash
    })
    console.log(res)
    res = await web3Utils.fromWei(res) // TODO
    console.log({ deployedContractAddress, funcHash, res })
    expect(res).to.equal(20)
  }).timeout(0)
})
