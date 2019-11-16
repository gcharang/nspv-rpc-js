'use strict'

const axios = require("axios");

class SmartChain {
  constructor({
    config
  }) {
    this.config = {};

    if (config) {
      if (typeof config !== "object") {
        throw new Error("Expected 'config' to be an object");
      }
      this.config.HOSTNAME = config.rpchost || "localhost";
      this.config.PORT = config.rpcport || 7771;
      this.config.USERNAME = config.rpcuser;
      this.config.PASSWORD = config.rpcpassword;

    } else {
      this.config.HOSTNAME = "localhost";
      this.config.PORT = 7771;
      this.config.USERNAME = rpcuser;
      this.config.PASSWORD = rpcpassword;
    }
  }
  rpc() {
    let thisConfig = this.config;
    return new Proxy({}, {
      set(target, method, handler) {
        target[method] = handler; // allow overwriting of methods for testing
      },

      has() {
        return true; // for sinon spies/stubs testing
      },

      get(target, method) {
        if (typeof target[method] === "function") return target[method];

        return async (...params) => {
          const requestData = {
            jsonrpc: "2.0",
            method,
            params,
            id: Date.now()
          };

          const requestConfig = {};
          requestConfig.auth = {
            username: thisConfig.USERNAME,
            password: thisConfig.PASSWORD
          };
          const url = "http://" + thisConfig.HOSTNAME + ":" + thisConfig.PORT;
          const {
            data
          } = await axios.post(url, requestData, requestConfig);

          if (data.error)
            throw new Error(`${data.error.code}: ${data.error.message}`);

          return data.result;
        };
      }
    });
  }
}
module.exports = SmartChain;