import Aion from '../aion'
import { expect } from 'chai'
import 'mocha'
import { nodeAddress } from '../titanrc'
const aion = new Aion(nodeAddress)

describe('Get accounts , balances, unlocks the first account', () => {
  let accounts: string[]
  it('get all accounts', async () => {
    accounts = await aion.getAccounts()
    console.log(accounts)
    expect(accounts)
      .to.be.an('array')
      .to.have.length.above(0)
    expect(accounts[0])
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)

  it('get balances for first account', async () => {
    const wallet = await Promise.all(
      [accounts[0]].map(async (account: any) => {
        return {
          account,
          balance: await aion.getBalance(account)
        }
      })
    )
    console.log(wallet)
    expect(wallet[0].account)
      .to.be.an('string')
      .to.have.lengthOf(66)
  }).timeout(0)
  it('successfully unlocks the first', async () => {
    const response = await aion.unlock(accounts[0], 'PLAT4life')
    console.log(response)
    expect(response).to.be.true
  }).timeout(0)
})
