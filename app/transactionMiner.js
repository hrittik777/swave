const Transaction = require("../wallet/transaction");

class TransactionMiner {
	constructor({ blockchain, transactionPool, wallet, pubsub }) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubsub = pubsub;
	}

	mineTransactions() {
		// get valid transactions from transaction pool
		const validTransactions = this.transactionPool.validTransactions();

		// generate miner reward and add it to the valid transactions
		validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

		// add block consisting of these transactions to blockchain
		this.blockchain.addBlock({ data: validTransactions });
		
		// broadcast the updated blockchain
		this.pubsub.broadcastChain();

		// clear transaction pool
		this.transactionPool.clear();
	}
}

module.exports = TransactionMiner;