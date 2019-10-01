# node-komodo-rpc

[![Circle CI](https://circleci.com/gh/gcharang/node-komodo-rpc.svg?style=shield)](https://circleci.com/gh/gcharang/node-komodo-rpc)

nodejs json-rpc for Komodo and Smart Chains.

## Instructions

1. `require()` it
2. call `.init()` with a JS object containing the credentials or a way to get the credentials as an argument to initiate a RPC connection.
   - datadir Ex: `{ datadir: "/home/username/.komodo/LABS" }`
   - name Ex: `{ name: "Rick" }`
   - conffile Ex: `{ conffile: "/home/username/.komodo/MORTY/MORTY.conf" }`
3. call `.call()` with the method, params and callback (the callback takes (err, result))

- optional: call `.setTimeout()` with the number of milliseconds to wait for a response from the blockchain daemon if `500` isn't enough

## Examples

Passing the credentials directly

```js
const rpc = require("node-komodo-rpc");

let creds = {
  rpchost: "localhost",
  rpcport: 7771,
  rpcuser: "user3141556977",
  rpcpassword:
    "pass47aac855ee75ce21a96476641556b90dab0128962d29e85920cbb8ad730d0e0307"
};

rpc.init({
  creds
});
rpc.call("getinfo", [], function(err, res) {
  if (err) {
    let errMsg = "Error when calling komodo RPC: " + err;
    console.log(errMsg);
    throw new Error(errMsg);
  } else if (res.error) {
    let errMsg =
      "Error received by komodo RPC: " +
      res.error.message +
      " (" +
      res.error.code +
      ")";
    console.log(errMsg);
    throw new Error(errMsg);
  } else {
    console.log(JSON.stringify(res.result));
  }
});
```

Passing the data directory's path

```js
rpc.init({
  datadir: "/home/username/.komodo/LABS"
});
```

Passing the Name

```js
rpc.init({
  name: "Rick"
});
```

Passing the Conf file's path

```js
rpc.init({
  conffile: "/home/username/.komodo/MORTY/MORTY.conf"
});
```

Calling the `init` function with no arguments is equivalent to passing the argument `{name: "komodo"}`

```js
rpc.init();
```

To see the values being used currently

```js
console.log(rpc.NAME);
console.log(rpc.HOSTNAME);
console.log(rpc.PORT);
console.log(rpc.USERNAME);
console.log(rpc.PASSWORD);
console.log(rpc.DATADIR);
console.log(rpc.CONFFILE);
console.log(rpc.TIMEOUT);
```

Descriptions of the exported values

- `NAME` is the name of the Blockchain; more accurately, it is the name of the conf file
- `HOSTNAME` the address at which the RPC server (blockchain daemon) is listening for connections
- `PORT` is the port at which the RPC server (blockchain daemon) is listening for connections
- `USERNAME` is the username allowed to send RPC requests to the blockchain daemon
- `PASSWORD` is the password to authenticate the RPC requests to the blockchain daemon
- `DATADIR` is the data directory being used by the blockchain daemon; more accurately, this is the directory containing the conf file
- `CONFFILE` is the file containing the configuration settings of the blockchain daemon
- `TIMEOUT` is the amount of time (in milli seconds) to wait for a response from the blockchain daemon

## Defaults

The defaults before the `.init()` function is called:

- rpchost: "localhost"
- rpcport: 7771
- rpcuser: "komodorpc"
- rpcpassword: "foo"
- name: "komodo"
- datadir: UNIX: "/home/username/.komodo/" or MacOS: "/home/username/Library/Application Support/Komodo" or Windows: "%appdata%\\Komodo"
- conffile: UNIX: "/home/username/.komodo/komodo.conf" or MacOS: "/home/username/Library/Application\ Support/Komodo/komodo.conf" or Windows: "%appdata%\\Komodo\\komodo.conf"
- connection timeout: 500 ms

### creds

If the `creds` object is missing the keys: `rpchost` or `rpcport`, their default values are used: `localhost` and `7771` respectively. When the `creds` object is passed, `NAME`, `DATADIR` and `CONFFILE` are set to be `undefined`
