import axios from 'axios'

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const rpcPost = async (
  nodeAddress: string,
  method: string,
  params: any[] = [],
  id: number = 1
) => {
  return axios
    .post(nodeAddress, {
      jsonrpc: '2.0',
      method,
      params,
      id
    })
    .then(({ data: { result } }) => result)
    .catch(err => console.error(err))
}
