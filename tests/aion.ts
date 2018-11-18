import Aion from '../aion'
import { expect } from 'chai'
import 'mocha'
import { nodeAddress } from '../titanrc'
const aion = new Aion(nodeAddress)

describe('Get accounts , balances, unlocks the first account', () => {
  let accounts: string[]

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

  it('successfully unlocks the first', async () => {
    const response = await aion.unlock(accounts[0], 'PLAT4life')

    expect(response).to.be.true
  }).timeout(0)

  it('successfully returns sha3 of input', async () => {
    const signature = 'name()'
    const response = await aion.sha3(signature)

    expect(response).to.not.equal('')
  }).timeout(0)

  it('successfully compiles a contract', async () => {
    const sol =
      'pragma solidity ^0.4.9; contract Demo { address owner; function Demo() public {} }'
    const response = await aion.compile(sol)

    expect(response).to.not.equal('')
  }).timeout(0)

  it('successfully deploys the Example contract', async () => {
    const data =
      '0x605060405260056000600050909055341561001a5760006000fd5b6040516010806101bf833981016040528080519060100190919050505b8060006000508190909055505b5061004a565b610166806100596000396000f30060506040526000356c01000000000000000000000000900463ffffffff16806343114db8146100495780634e70b1dc14610081578063526bdc12146100ab57610043565b60006000fd5b34156100555760006000fd5b61006b60048080359060100190919050506100cf565b6040518082815260100191505060405180910390f35b341561008d5760006000fd5b6100956100e5565b6040518082815260100191505060405180910390f35b34156100b75760006000fd5b6100cd60048080359060100190919050506100ee565b005b6000816000600050540190506100e0565b919050565b60006000505481565b8060006000508190909055507f72e3b8336675493a35fccc2c1483c3601f1b9ac6875c2665b93789d83da54b4d6000600050546040518082815260100191505060405180910390a15b505600a165627a7a723058202c9843ff1e4dc2906baaba3c9889e5473312ba79800bf1972708190085646a890029'
    const res = await aion.deploy({
      data,
      mainAccount: accounts[0],
      gas: 2000000
    })

    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)

  it('successfully deploys a contract with constructor arguments', async () => {
    const sol = `pragma solidity ^0.4.9;

contract WithConstructor {
    uint128 public num = 5;

    event NumChanged (uint128);

    function add(uint128 a) public returns (uint128) {
        return num + a;
    }

    function WithConstructor(uint128 a, bytes32 br) public {
        num = a;
    }

    function setA(uint128 a) public {
        num = a;
        NumChanged(num);
    }
}`
    const a = await aion.sha3(15)
    const br = await aion.sha3('Titan')
    const compiled = await aion.compile(sol)
    const code = compiled.contracts[':WithConstructor'].bytecode

    const parsedA = a.substring(2, 10)
    const parsedBr = br.substring(2, 10)

    const data = code.concat(parsedA).concat(parsedBr)
    const res = await aion.deploy({
      data,
      mainAccount: accounts[0],
      gas: 2000000
    })

    expect(res.txReceipt.transactionHash).to.equal(res.txHash)
  }).timeout(0)
})
