App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function () {
      console.log("App initialized...");
      return App.initWeb3();
    },

    initWeb3: function () {
      if (typeof web3 !== 'undefined') {
          // If a web3 instance is already provided by Meta Mask.
          App.web3Provider = web3.currentProvider;
          web3 = new Web3(web3.currentProvider)
      } else {
          // Specify default instance if no web3 instance is provided
          App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
          web3 = new Web3(App.web3Provider);
      }

      return App.initContracts();
    },

    initContracts: function () {
        $.getJSON("BoundlessTokenSale.json", function (boundlessTokenSale) {
            App.contracts.BoundlessTokenSale = TruffleContract(boundlessTokenSale);
            App.contracts.BoundlessTokenSale.setProvider(App.web3Provider);
            App.contracts.BoundlessTokenSale.deployed().then(function (boundlessTokenSale) {
                console.log("Boundless Token Sale Address is: ", boundlessTokenSale.address);
            });
        }).done(function () {
            $.getJSON("BoundlessToken.json", function (boundlessToken) {
                App.contracts.BoundlessToken = TruffleContract(boundlessToken);
                App.contracts.BoundlessToken.setProvider(App.web3Provider);
                App.contracts.BoundlessToken.deployed().then(function (boundlessToken) {
                    console.log("Boundless Token Address is: ", boundlessToken.address);
                });
                return App.render();
            });
        });
    },

    render: function () {
        // Load account data
        if (web3.currentProvider.enable) {
            // For Meta Mask
            web3.currentProvider.enable().then(function(acc) {
                App.account = acc[0];
                $("#accountAddress").html("Your Account: " + App.account);
            });
        } else {
            App.account = web3.eth.accounts[0];
            $("#accountAddress").html("Your Account: " + App.account);
        }
    }
};

$(function () {
   $(window).load(function () {
       App.init();
   })
});