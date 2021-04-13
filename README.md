# vehicle-ledger 🚗

## IS4302 Project Group 11

### Team members:
- Arcillas Brian Joshua Pelaez (A0167854N)
- Woo Keng Thong (A0167991L)
- Justin Eng Wei Jie (A0167946L)
- Gnanapoongkothai Annamalai (A0225284E)
- Chen Yizhao (A0168759E)

### Installation commands

#### In "is4302-vehicle-registry/client" folder:

- Run `npm install`
  > If got dependencies error: Run `npm install --legacy-peer-deps`
- If you do not have ganache-cli and truffle, run `npm install -g ganache-cli` and `npm install -g truffle`

### Execution commands

#### In "is4302-vehicle-registry" root folder:

1. Run `npm run start:blockchain`
2. Run `npm run migrate`

<!-- 1. Run `ganache-cli -l 80000000 --allowUnlimitedContractSize` -->
<!-- 2. Run `truffle compile` then `truffle migrate` -->

> If got changes, best to run `truffle migrate --reset`

#### Metamask:

1. Create or select the Localhost 8545 to connect with ganache-cli (If already exists)
2. Under "My Accounts" 🡆 "Import Account" 🡆 copy & paste a private key in the ganache-cli output 🡆 click "Import" (ETH balance should be shown)
   > E.g. (0) 0x9537f1fd09df6ede35d9ec029fe135eedd2a2dd6421f84cbbfa4b504e01e05b3

#### In root folder:

1. Run `npm run start:frontend`
2. There might be a Metamask popup that requires signing the message

> Citation link: Frontend template: https://flatlogic.com/templates/react-material-admin
