'use strict'

var http = require('http');
var Agent = require('agentkeepalive');
var fs = require("fs");
var process = require("process");
var path = require('path');

module.exports.NAME = "komodo"
module.exports.HOSTNAME = 'localhost'
module.exports.PORT = 7771
module.exports.USERNAME = 'komodorpc'
module.exports.PASSWORD = 'foo'
module.exports.TIMEOUT = 500
module.exports.DATADIR =
  (process.env.APPDATA ? process.env.APPDATA + "\\Komodo\\" : false) ||
  (process.platform == "darwin" ?
    process.env.HOME + "Library/Application Support/Komodo/" :
    process.env.HOME + "/.komodo/");
module.exports.CONFFILE = path.join(module.exports.DATADIR, module.exports.NAME + ".conf")

var keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
});

module.exports.init = function init({
  creds,
  conffile,
  datadir,
  name
} = {
  name: "komodo"
}) {
  if (creds) {
    module.exports.HOSTNAME = creds.rpchost || "localhost";
    module.exports.PORT = creds.rpcport || 7771;
    module.exports.USERNAME = creds.rpcuser;
    module.exports.PASSWORD = creds.rpcpassword;
    module.exports.NAME = undefined;
    module.exports.DATADIR = undefined;
    module.exports.CONFFILE = undefined

  } else if (conffile) {
    setCreds({
      conffile
    });
  } else if (datadir) {
    setCreds({
      datadir
    });
  } else if (name) {
    setCreds({
      name
    });
  }
}

module.exports.call = function call(method, params, cb) {
  var postData = JSON.stringify({
    method: method,
    params: params,
    id: '1'
  })

  var options = {
    agent: keepaliveAgent,
    hostname: module.exports.HOSTNAME,
    port: module.exports.PORT,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    },
    auth: module.exports.USERNAME + ':' + module.exports.PASSWORD
  }

  var req = http.request(options, function A(res) {
    cb_handleRequestResponse(res, cb)
  })

  req.on('error', function response(e) {
    if (!req.__alreadyErrorCb) {
      cb(e.message)
      req.__alreadyErrorCb = true;
    }
  })

  req.setTimeout(module.exports.TIMEOUT, function cb_onTimeout(e) {
    if (!req.__alreadyErrorCb) {
      cb('Timed out')
      req.__alreadyErrorCb = true;
    }
    req.abort()
  })

  // write data to request body
  req.write(postData)
  req.end()
}

module.exports.getTimeout = function getTimeout() {
  return module.exports.TIMEOUT
}

module.exports.setTimeout = function setTimeout(timeout) {
  module.exports.TIMEOUT = timeout
}

function setCreds({
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
        name === "komodo" ? path.join(module.exports.DATADIR, "komodo.conf") : path.join(module.exports.DATADIR, name.toUpperCase(), (name.toUpperCase() + ".conf"))
      fs.accessSync(file)
      datadir = name === "komodo" ? module.exports.DATADIR : path.join(module.exports.DATADIR, name.toUpperCase())
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
  getCreds(file, datadir, name);
}

function getCreds(file, datadir, name) {
  let lines;
  try {
    lines = fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter(l => l.indexOf("=") > 0);
  } catch (error) {
    throw new Error(
      "Unable to read the conf file, please provide the credentials, host and port directly \n" + error
    );
  };

  const config = {};

  for (let line of lines) {
    const [key, ...value] = line.split("=");
    config[key] = value.join("=");
  }
  if (
    !("rpcuser" in config) ||
    !("rpcpassword" in config) ||
    (!("rpcport" in config) && name !== "komodo")
  ) {
    throw new Error(
      "Unable to find 'rpcuser' or 'rpcpassword' or 'rpcport' from the conf file"
    );
  }
  for (let key in config) {

    if (typeof config[key] !== "string") {
      throw new Error(
        "'rpcuser' or 'rpcpassword' or 'rpcport' in Komodo config file"
      );
    }
  }

  module.exports.NAME = name;
  module.exports.HOSTNAME = config.rpchost || "localhost";
  module.exports.PORT = config.rpcport || 7771;
  module.exports.USERNAME = config.rpcuser;
  module.exports.PASSWORD = config.rpcpassword;
  module.exports.DATADIR = datadir;
  module.exports.CONFFILE = file;
}

function cb_handleRequestResponse(res, cb) {
  var data = ''
  res.setEncoding('utf8')
  res.on('data', function (chunk) {
    data += chunk
  })
  res.on('end', function () {
    if (res.statusCode === 401) {
      cb(res.statusCode)
    } else {
      try {
        data = JSON.parse(data)
        cb(null, data)
      } catch (err) {
        cb(err, null)
      }
    }
  })
}