require("babel-register")({
  ignore: /node_modules(?!\/zeppelin-solidity)/,
  presets: [
    ["env", {
      "targets" : {
        "node" : "8.0"
      }
    }]
  ],
  retainLines: true,
});
require("babel-polyfill");

module.exports = {
  networks: {
    rinkeby: {
       host: "localhost",
       port: 8545,
       network_id: "4", // Rinkeby ID 4
       from: "0xe54f011db95c9292d94b31bdff7a95b65a574789", // account from which to deploy
       gas: 7000000
    }
  }
};
