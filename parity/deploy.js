#!/usr/bin/env node

/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2016, 2017, The University of Sydney. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// default address to use when sending transactions, if an alternate address
// is not supplied on the command line
const DEFAULT_FROM = "0x00a329c0648769A73afAc7F9381E08FB43dBEA72";

var fs = require('fs');
var Web3 = require('web3');
var path = require('path');

if (process.argv.length < 4) {
  console.error("Usage: deploy.js Contract.abi Contract.bin [from_address]");
  process.exit(1);
}

// address from which contract creation TXn will be sent
var from_address = process.argv[4] || DEFAULT_FROM;

var abi = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
var code = fs.readFileSync(process.argv[3], 'utf8').trim();

var contractName = path.basename(process.argv[3]).split('.')[0];

if (!code.startsWith('0x')) {
  code = "0x"+code;
}

var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

web3.extend({
  property: 'parity',
  methods: [
    {
      name: 'setAccountName',
      call: 'parity_setAccountName',
      params: 2,
    },
    {
      name: 'setAccountMeta',
      call: 'parity_setAccountMeta',
      params: 2,
    },
  ],
});

var contract = new web3.eth.Contract(abi);
contract.options.data = code;

contract.deploy().send({
  from: from_address,
  gas: 999999,
}).then((newContract) => {
  // new contract successfully deployed
  let newAddr = newContract.options.address;
  console.log("Contract mined! Address: " + newAddr);

  // add new contract to parity address book
  web3.parity.setAccountName(newAddr, process.argv[3].split('.')[0]);
  web3.parity.setAccountMeta(newAddr, JSON.stringify({
    "contract": true,
    "deleted": false,
    "timestamp": Math.floor(new Date()),
    "abi": abi,
    "type": "custom",
    "description": ""
  }));

}).error((e) => {
  // error deploying contract
  console.error("ERROR - contract not mined!");
  console.error(e);
});
