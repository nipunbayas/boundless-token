# Boundless Token
Contains source code for Boundless Token.

ICO is available at https://nipunbayas.github.io/boundless-token/

### Commands to test on Truffle Console

- ```BoundlessToken.deployed().then(function(instance) { tokenInstance = instance; });```

- ```tokenInstance.name()```

- ```tokenInstance.symbol()```

- ```web3.eth.getAccounts(function(err, res) { accounts = res; });```

- ```admin = accounts[0];```

- ```tokenInstance.balanceOf(admin).then(function(bal) { balance = bal; });```

- ```balance.toNumber();```

- ```receiver = accounts[1];```

- ```tokenInstance.transfer(receiver, 1, { from: admin });```

- ```tokenInstance.approve(accounts[1], 100, { from: admin });```

- ```tokenInstance.allowance(accounts[0], accounts[1]);```

- ```fromAccount = accounts[2]; toAccount = accounts[3]; spendingAccount = accounts[4];```

- ```tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });```

- ```tokenInstance.approve(spendingAccount, 10, { from: fromAccount });```

- ```tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });```

- ```tokenInstance.allowance(fromAccount, spendingAccount);```

### For running Geth

- ```geth --rinkeby -- rpc --rpcapi="personal,eth,network,w3,net" --ipcpath="\\.\pipe\geth.ipc"```

- ```geth attach ipc:\\.\pipe\geth.ipc``` , then ```eth.syncing```
