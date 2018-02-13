# eth-utils/parity

These utilities are "glue" scripts to ease working with smart contracts with the Parity Ethereum client.

Script | Description
--- | ---
deploy.js | Deploys a given contract and ABI to the blockchain using a given account to sign the transaction. It expects to connect to a Parity client, and will automatically add the newly deployed contract to Parity's address book. |
deleteAll.js | Deletes all contracts from the local Parity node's address book. Useful if you're deploying contracts frequently for testing, and don't want to clutter the address book. |
