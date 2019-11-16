'use strict'

const axios = require("axios");

/*
https://stackoverflow.com/a/38815760/9551761
- detecting browser vs node
*/

const isBrowser = typeof window !== 'undefined' &&
  ({}).toString.call(window) === '[object Window]';

const isNode = typeof global !== "undefined" &&
  ({}).toString.call(global) === '[object global]';


if (isNode) {
  const fs = require("fs");
  const process = require("process");
  const path = require('path');

  let config = {};
  config.NAME = "komodo";
  config.HOSTNAME = "localhost";
  config.PORT = 7771;
  config.USERNAME = "komodorpc";
  config.PASSWORD = "foo";
  config.DATADIR =
    (process.env.APPDATA ? process.env.APPDATA + "\\Komodo\\" : false) ||
    (process.platform == "darwin" ?
      process.env.HOME + "Library/Application Support/Komodo/" :
      process.env.HOME + "/.komodo/");
  config.CONFFILE = path.join(config.DATADIR, config.NAME + ".conf");

  class SmartChain {
    constructor({
      creds,
      conffile,
      datadir,
      name
    } = {
      name: "komodo"
    }) {
      this.config = {};

      if (creds) {
        if (typeof creds !== "object") {
          throw new Error("Expected 'creds' to be an object");
        }
        this.config.HOSTNAME = creds.rpchost || "localhost";
        this.config.PORT = creds.rpcport || 7771;
        this.config.USERNAME = creds.rpcuser;
        this.config.PASSWORD = creds.rpcpassword;
        this.config.NAME = undefined;
        this.config.DATADIR = undefined;
        this.config.CONFFILE = undefined;
      } else if (conffile) {
        if (typeof conffile !== "string") {
          throw new Error("Expected 'conffile' to be an object");
        }
        this._setCreds({
          conffile
        });
      } else if (datadir) {
        if (typeof datadir !== "string") {
          throw new Error("Expected 'datadir' to be an object");
        }
        this._setCreds({
          datadir
        });
      } else if (name) {
        if (typeof name !== "string") {
          throw new Error("Expected 'name' to be an object");
        }
        this._setCreds({
          name
        });
      }
    }
    _setCreds({
      datadir,
      name,
      conffile
    }) {
      let file;
      let filename;
      let filenames;

      if (datadir) {
        datadir = path.normalize(datadir)
        try {
          filenames = fs.readdirSync(datadir);
          filenames.forEach(function (filename) {
            if (fs.statSync(path.join(datadir, filename)).isFile() && filename.endsWith(".conf")) {
              file = path.join(datadir, filename);
              name = filename.split('.')[0].toLowerCase()
            } else {
              file = file ? file : ""
            }
          })
          fs.accessSync(file)
        } catch (error) {
          throw new Error(
            "Unable to find the conf file, please provide the credentials, host and port directly \n" + error
          );
        }
      } else if (name) {
        try {
          name = name.toLowerCase()
          file =
            name === "komodo" ? path.join(config.DATADIR, "komodo.conf") : path.join(config.DATADIR, name.toUpperCase(), (name.toUpperCase() + ".conf"))
          fs.accessSync(file)
          datadir = name === "komodo" ? config.DATADIR : path.join(config.DATADIR, name.toUpperCase())
        } catch (error) {
          throw new Error(
            "Unable to find the conf file, please provide the credentials, host and port directly \n" + error
          );
        }
      } else if (conffile) {
        file = path.normalize(conffile)
        try {
          fs.accessSync(file)
          let pathArray;
          let charArray;
          let index;
          pathArray = file.split(path.sep)
          filename = pathArray[pathArray.length - 1]
          name = filename.split('.')[0].toLowerCase()
          charArray = file.split("").reverse()
          index = charArray.indexOf(path.sep)
          datadir = charArray.slice(index, charArray.length).reverse().join("")
        } catch (error) {
          throw new Error(
            "Unable to find the conf file, please provide the credentials, host and port directly \n" + error
          );
        }
      }
      this._getCreds(file, datadir, name);
    }

    _getCreds(file, datadir, name) {
      let lines;
      try {
        lines = fs
          .readFileSync(file, "utf8")
          .split("\n")
          .filter(l => l.indexOf("=") > 0);
      } catch (error) {
        throw new Error(
          "Unable to read the conf file, please provide the credentials, host and port directly \n" +
          error
        );
      }

      const _conf = {};

      for (let line of lines) {
        const [key, ...value] = line.split("=");
        _conf[key] = value.join("=");
      }
      if (
        !("rpcuser" in _conf) ||
        !("rpcpassword" in _conf) ||
        (!("rpcport" in _conf) && name !== "komodo")
      ) {
        throw new Error(
          "Unable to find 'rpcuser' or 'rpcpassword' or 'rpcport' from the conf file"
        );
      }
      for (let key in _conf) {
        if (typeof _conf[key] !== "string") {
          throw new Error(
            "'rpcuser' or 'rpcpassword' or 'rpcport' in Komodo config file"
          );
        }
      }
      this.config.NAME = name;
      this.config.HOSTNAME = _conf.rpchost || "localhost";
      this.config.PORT = _conf.rpcport || 7771;
      this.config.USERNAME = _conf.rpcuser;
      this.config.PASSWORD = _conf.rpcpassword;
      this.config.DATADIR = datadir;
      this.config.CONFFILE = file;
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
} else if (isBrowser) {
  let config = {};
  class SmartChain {
    constructor({
      creds
    } = {
      rpchost: "localhost",
      rpcport: 7771,
      rpcuser: "komodorpc",
      rpcpassword: "foo"
    }) {
      this.config = {};

      if (creds) {
        if (typeof creds !== "object") {
          throw new Error("Expected 'creds' to be an object");
        }
        this.config.HOSTNAME = creds.rpchost || "localhost";
        this.config.PORT = creds.rpcport || 7771;
        this.config.USERNAME = creds.rpcuser;
        this.config.PASSWORD = creds.rpcpassword;

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

} else {
  let platformWarning = "This module only supports browser and node"
  class SmartChain {
    constructor({
      creds,
      conffile,
      datadir,
      name
    }) {

      this.config = {};
      this.config.NAME = platformWarning
      this.config.HOSTNAME = platformWarning
      this.config.PORT = platformWarning
      this.config.USERNAME = platformWarning
      this.config.PASSWORD = platformWarning
      this.config.DATADIR = platformWarning
      this.config.CONFFILE = platformWarning
    }
    rpc() {
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
            return platformWarning;
          };
        }
      });
    }

  }
  module.exports = SmartChain;
}