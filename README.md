# node-komodo-rpc

[![Circle CI](https://circleci.com/gh/gcharang/node-komodo-rpc.svg?style=shield)](https://circleci.com/gh/gcharang/node-komodo-rpc) 


nodejs json-rpc for komodo

## Instructions:

1. `require()` it
2. call `.init()` with host, port, username, password as args
3. call `.call()` with the method, param and callback (the callback takes (err, result))

* optional: call `.setTimeout()` with the number of milliseconds to wait if 500 isn't enough

## Example:

```
var komodo_rpc = require('node-komodo-rpc')

komodo_rpc.init('host', port, 'rpc_username', rpc_pass)
komodo_rpc.call('getbalance', [], function (err, res) {
  if (err) {
    let errMsg = "Error when calling komodo RPC: " + err;
    console.log(errMsg);
    throw new Error(errMsg);
  } else if (res.error) {
    let errMsg = "Error received by komodo RPC: " + res.error.message + " (" + res.error.code + ")";
    console.log(errMsg);
    throw new Error(errMsg);
  } else {
    console.log(JSON.stringify(res.result))
  }
})
```

## Defaults:

* host; localhost
* port: 8332
* rpc_username: bitcoinrpc
* rpc_password: foo
* connection timeout: 500 ms

.
