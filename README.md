# Core
A small Web3 wrapper for Dapps

   ```sh
    // with yarn
    yarn add @titan-suite/core
    // with npm
    npm install @titan-suite/core
   ```
 
Checkout [Available methods](https://github.com/titan-suite/core/blob/master/dist/src/common/index.d.ts)

[Aion specefic methods](https://github.com/titan-suite/core/blob/master/dist/src/blockchains/aion/index.d.ts)

[Ethereum specefic methods](https://github.com/titan-suite/core/blob/master/dist/src/blockchains/ethereum/index.d.ts)

Example Usage:
```js
  import { Aion } from '@titan-suite/core'
  
  //instantiate
  const aion = new Aion("provider url")
  
  // get Accounts
  const accounts = await aion.getAccounts()
  
  // get TxReceipt
  const receipt = await aion.getTxReceipt("txhash")
```
  [View More](https://github.com/titan-suite/core/blob/367c50edaebb34864ac5975eebd3265ac1651a6b/tests/aion/aion.ts#L46)
