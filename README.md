# vehicle-ledger 🚗

IS4302 Project

### Installation commands

## In "is4302-vehicle-registry" root folder:

- Run `npm install`

## In "is4302-vehicle-registry/client" folder:

- Run `npm install`
> If got dependencies error: Run `npm install --legacy-peer-deps`


### Execution commands

## In "is4302-vehicle-registry" root folder:

1. Run `ganache-cli -l 80000000 --allowUnlimitedContractSize`
2. Run `truffle compile` then `truffle migrate`
> If got changes, best to run `truffle migrate --reset`

## Metamask:

1. Create or select the Localhost 8545 to connect with ganache-cli (If already exists)
2. Under "My Accounts" 🡆 "Import Account" 🡆 copy & paste a private key in the ganache-cli output 🡆 click "Import" (ETH balance should be shown)
> E.g. (0) 0x9537f1fd09df6ede35d9ec029fe135eedd2a2dd6421f84cbbfa4b504e01e05b3

## In "is4302-vehicle-registry/client" folder:

1. Run `npm start`
2. There might be a Metamask popup that requires signing the message
