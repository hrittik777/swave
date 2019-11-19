const Block = require("./block");
const { cryptoHash } = require("../utils");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");
const { REWARD_INPUT, MINER_REWARD } = require("../config");

class Blockchain {
	constructor() {
		this.chain = [Block.genesis()];
	}

	addBlock({ data }) {
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length - 1],
			data
		});
		this.chain.push(newBlock);
	}

	replaceChain(chain, validateTransaction, onSuccess) {
		if(chain.length <= this.chain.length) {
			console.error("The new chain must be longer.");
			return;
		};

		if(!Blockchain.isValidChain(chain)) {
			console.error("The new chain must be a valid chain.");
			return;
		};

		if(validateTransaction && !this.validTransactionData({ chain })) {
			console.error("Incoming transaction has invalid data.");
			return;
		}

		if(onSuccess) onSuccess();
		console.log("Replacing chain with", chain);
		this.chain = chain;
	}

	validTransactionData({ chain }) {
		for(let i = 1; i < chain.length; i++) {
			const block = chain[i];
			const transactionSet = new Set();
			let total = 0;
			for(let transaction of block.data) {
				if(transaction.input.address === REWARD_INPUT.address) {
					total += 1;
					if(total > 1) {
						console.error("More than one reward transaction.");
						return false;
					}
					if(Object.values(transaction.outputMap)[0] !== MINER_REWARD) {
						console.error("Invalid reward amount.");
						return false;
					}
				} else {
					if(!Transaction.validTransaction(transaction)) {
						console.error("Invalid transaction.");
						return false;
					}
					const balance = Wallet.calculateBalance({
						chain: this.chain,
						address: transaction.input.address
					});
					if(transaction.input.amount !== balance) {
						console.error("Invalid input amount.");
						return false;
					}
					if(transactionSet.has(transaction)) {
						console.error("Duplicate transaction.");
						return false;
					} else {
						transactionSet.add(transaction);
					}
				}
			}
		}
		return true;
	}

	static isValidChain(chain) {
		// remember, two objects in JS cannot be === unless they are references to te same object
		if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false; 
		
		for(let i = 1; i < chain.length; i++) {
			const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];
			
			const correctLastHash = chain[i - 1].hash;
			if(lastHash !== correctLastHash) return false;

			const correctHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
			if(hash !== correctHash) return false;

			const lastDifficulty = chain[i - 1].difficulty;
			if(Math.abs(lastDifficulty - difficulty) > 1) return false;
		}
		return true;
	}
}

module.exports = Blockchain;