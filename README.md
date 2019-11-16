# komodo-rpc-js

json-rpc for Komodo and Smart Chains, with Promises support

- Supports on-the-fly RPC methods using [Proxies](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy); all the RPC methods supported by a daemon (including the Antara API) are available
- Supports multiple instances (different daemons) in the same application
- Works in browser and Nodejs; For the Nodejs version with datadir/conf detection support, [click here](https://www.npmjs.com/package/node-komodo-rpc)
- Very small codebase
- Uses [axios](https://github.com/axios/axios) behind the scenes

## Instructions

1. `require()` the module; it imports a class
2. launch a `new` instance of the class with a config object as the argument; the config object must contain the credentials directly
3. call `.config` with the new instance object to access its config
4. call `.rpc()` with the new instance object to access the RPC interface

## Usage

```js
const SmartChain = require("node-komodo-rpc");

const config = {
  rpchost: "localhost",
  rpcport: 7771,
  rpcuser: "user316977",
  rpcpassword: "pass47aac855ee750dab0128962d29e85920cbb8ad730d0e0307"
};

const komodo = new SmartChain({ config });

console.log(komodo.config); // Prints the config being used by the komodo instance

const komodoRPC = komodo.rpc();

komodoRPC
  .getinfo()
  .then(info => {
    console.log(info);
  })
  .catch(error => {
    console.log(error);
    throw new Error(error);
  });

komodoRPC
  .listunspent(6, 9999999, [
    "RPS3xTZCzr6aQfoMw5Bu1rpQBF6iVCWsyu",
    "RBtNBJjWKVKPFG4To5Yce9TWWmc2AenzfZ"
  ])
  .then(outs => {
    console.log(outs);
  })
  .catch(error => console.log(error));
```

Descriptions of the properties

- `HOSTNAME` the address at which the RPC server (blockchain daemon) is listening for connections
- `PORT` is the port at which the RPC server (blockchain daemon) is listening for connections
- `USERNAME` is the username allowed to send RPC requests to the blockchain daemon
- `PASSWORD` is the password to authenticate the RPC requests to the blockchain daemon

## Defaults

If the `creds` object is missing the keys: `rpchost` or `rpcport`, the default values used are `localhost` and `7771` respectively
