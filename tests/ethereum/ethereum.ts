import fs from 'fs'
import path from 'path'
import 'mocha'
import { expect } from 'chai'
import solc from 'solc'

import { nodeAddress } from '../../titanrc'
import * as web3Utils from 'web3-utils'

import Ethereum from '../../src/blockchains/ethereum'
const ethereum = new Ethereum(nodeAddress.ethereum)
const WithConstructorContract = {
  sol: fs.readFileSync(
    path.resolve(__dirname, 'contracts', 'WithConstructor.sol'),
    'utf8'
  ),
  name: ':WithConstructor'
}

describe('Test Ethereum class methods', () => {
  let accounts: string[]
  let contractInstance: any
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
    expect(wallet[0].address)
      .to.be.an('string')
      .to.have.lengthOf(42)
    expect(wallet[0].etherBalance).to.be.a('number')
  }).timeout(0)

  it('successfully compiles a contract and estimates gas', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; uint public test; function Demo(uint t) public { owner = msg.sender; test = t; } }'
    const response = await solc.compile(sol, 1)
    const code = response.contracts[':Demo'].bytecode

    const estimatedGas = await ethereum.estimateGas({
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
    const compiled = await solc.compile(WithConstructorContract.sol)
    const { interface: abi, bytecode: code } = compiled.contracts[
      WithConstructorContract.name
    ]
    const res: any = await ethereum.deploy({
      abi: JSON.parse(abi),
      code,
      from: accounts[0],
      gas: 2000000,
      args: [15, web3Utils.fromUtf8('Titan')]
    })
    contractInstance = res.response
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('expect data to equal Titan', async () => {
    let data = await contractInstance.methods
      .getData()
      .call({ from: accounts[0] })
    data = web3Utils.toUtf8(data)
    expect(data).to.equal('Titan')
  }).timeout(0)

  it('set value of num and expect add result to be 4', async () => {
    const res: any = await ethereum.getResponseWhenMined(
      contractInstance.methods.setA(2).send({ from: accounts[0], gas: 2000000 })
    )
    const num = await contractInstance.methods
      .add(2)
      .call({ from: accounts[0] })
    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
    expect(num).to.equal('4')
  }).timeout(0)
})
