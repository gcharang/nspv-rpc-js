# nspv-rpc-js

json-rpc for nSPV, with Promises support

- Supports on-the-fly RPC methods using [Proxies](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy); all the RPC methods supported by a nSPV binary are available
- Supports multiple instances (different daemons) in the same application
- Works in browser and Nodejs
- Very small codebase
- Uses [axios](https://github.com/axios/axios) behind the scenes

## Instructions

1. `require()` the module; it imports a class
2. launch a `new` instance of the class with a config object as the argument; the config object must contain the credentials directly
3. call `.config` with the new instance object to access its config
4. call `.rpc()` with the new instance object to access the RPC interface

## Usage

```js
const SmartChain = require("nspv-rpc-js");

const config = {
  rpchost: "localhost",
  rpcport: 7771,
};

const komodo = new SmartChain({ config });

console.log(komodo.config); // Prints the config being used by the komodo instance

const komodoRPC = komodo.rpc();

komodoRPC
  .getinfo()
  .then((info) => {
    console.log(info);
  })
  .catch((error) => {
    console.log(error);
    throw new Error(error);
  });

komodoRPC
  .listunspent("RD47yEoA4VGriqjeiLdMVKnuE7x7xqFy9r", false, 5)
  .then((outs) => {
    console.log(outs.utxos.length);
  })
  .catch((error) => console.log(error));
```

Descriptions of the properties

- `HOSTNAME` the address at which the nSPV binary is listening for connections
- `PORT` is the port at which the nSPV binary is listening for connections

## Defaults

If the `config` object is missing the keys: `rpchost` or `rpcport`, the default values used are `localhost` and `7771` respectively
