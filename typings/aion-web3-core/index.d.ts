import * as t from './types.d'
declare module 'aion-web3-core' {
  class Web3 {
    static providers: t.Providers
    static givenProvider: t.Provider
    static modules: {
      Eth: new (provider: t.Provider) => t.Eth;
      Net: new (provider: t.Provider) => t.Net;
      Personal: new (provider: t.Provider) => t.Personal;
      Shh: new (provider: t.Provider) => t.Shh;
      Bzz: new (provider: t.Provider) => t.Bzz;
    }
    version: string
    BatchRequest: new () => t.BatchRequest
    bzz: t.Bzz
    currentProvider: t.Provider
    eth: t.Eth
    ssh: t.Shh
    givenProvidr: t.Provider
    providers: t.Provider
    utils: t.Utils
    constructor(provider: t.Provider);
    extend(methods: any): any
    setProvider(provider: t.Provider): void
  }
  // @ts-ignore: Unreachable code error
  export = Web3
}
