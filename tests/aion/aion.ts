import fs from 'fs'
import path from 'path'
import 'mocha'
import { expect } from 'chai'
import { nodeAddress } from '../../titanrc'
import Aion from '../../aion'
const aion = new Aion(nodeAddress)
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

  it('get balances for first account', async () => {
    let wallet: any = []
    for (const account of accounts) {
      const etherBalance = await aion.getBalance(account)
      wallet.push({
        account,
        etherBalance
      })
    }
    expect(wallet[0].account)
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
    const response = await Aion.sha3(signature)
    expect(response)
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)

  it('successfully compiles a contract and estimates gas', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; function Demo() public {} }'
    const response = await Aion.compile(sol)
    const bytecode = response.contracts[':Demo'].bytecode
    const estimatedGas = await aion.estimateGas({
      bytecode,
      from: accounts[0],
      gas: 2000000
    })
    expect(estimatedGas)
      .be.a('number')
      .to.equal(225982)
    expect(bytecode).to.be.an('string')
  }).timeout(0)

  it('successfully deploys the Example contract', async () => {
    const compiled = await Aion.compile(ExampleContract.sol)
    const bytecode = compiled.contracts[ExampleContract.name].bytecode
    const res = await aion.deploy({
      bytecode,
      from: accounts[0],
      gas: 2000000
    })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('successfully deploys the WithConstructor contract with arguments', async () => {
    const compiled = await Aion.compile(WithConstructorContract.sol)
    const bytecode = compiled.contracts[WithConstructorContract.name].bytecode

    const res = await aion.deploy({
      bytecode,
      from: accounts[0],
      contractArguments: '15,Titan',
      gas: 2000000
    })
    deployedContractAddress = res.txReceipt.contractAddress as string
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('gets back 20 after sending 5 to contract', async () => {
    let funcHash = await Aion.sha3('add(uint128)')
    const paddedValue = await Aion.padLeft('5', 64)
    funcHash = funcHash.substring(0, 10) + paddedValue
    let res = await aion.call({
      from: accounts[0],
      to: deployedContractAddress,
      data: funcHash
    })
    console.log(res)
    res = await Aion.hexToNumber(res)
    console.log({ deployedContractAddress, funcHash, res })
    expect(res).to.equal(20)
  }).timeout(0)
})
