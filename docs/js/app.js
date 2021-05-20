App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

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

                App.listenForEvents();
                return App.render();
            });
        });
    },

    listenForEvents: function() {
        App.contracts.BoundlessTokenSale.deployed().then(function (instance) {
           instance.Sell({}, {
               fromBlock: 0,
               toBlock: 'latest'
           }).watch(function (error, event) {
               console.log("Event triggered...", event);
               App.render();
           });
        });
    },

    render: function () {
        if (App.loading) {
            return;
        }
        App.loading = true;

        let loader = $('#loader');
        let content = $('#content');

        loader.show();
        content.hide();

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

        // Load token sale contract
        let boundlessTokenSaleInstance;
        App.contracts.BoundlessTokenSale.deployed().then(function (instance) {
            boundlessTokenSaleInstance = instance;
            return boundlessTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            App.tokenPrice = tokenPrice.toNumber();
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether"));
            return boundlessTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable);

            let progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
            $('#progress').css('width', progressPercent + '%');

            // Load token contract
            let boundlessTokenInstance;
            App.contracts.BoundlessToken.deployed().then(function (instance) {
                boundlessTokenInstance = instance;
                return boundlessTokenInstance.balanceOf(App.account);
            }).then(function (balance) {
                $('.boundless-balance').html(balance.toNumber());

                App.loading = false;
                loader.hide();
                content.show();
            });
        });
    },

    buyTokens: function () {
        $('#content').hide();
        $('#loader').show();

        let numberOfTokens = $('#numberOfTokens').val();
        App.contracts.BoundlessTokenSale.deployed().then(function (instance) {
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens * App.tokenPrice,
                gas: 500000
            });
        }).then(function (result) {
            console.log("Tokens bought...");
            $('form').trigger('reset'); // reset number of tokens in the form
            // wait for sell event
        });
    }
};

$(function () {
   $(window).load(function () {
       App.init();
   })
});