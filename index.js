const express = require("express");
const request = require("request");
const path = require("path");
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const PubSub = require("./app/pubsub");
const TransactionPool = require("./wallet/transactionPool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transactionMiner");

const isDevelopment = process.env.ENV === 'development';

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "client/dist")));

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = isDevelopment ? `http://localhost:${DEFAULT_PORT}`: `https://swave.herokuapp.com`;

const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

app.get("/api/blocks", (req, res) => {
	res.json(blockchain.chain);
});

// ------------------------------------------------------------------
// app.get("/api/blocks/length", (req, res) => {
// 	res.json(blockchain.chain.length);
// });

// app.get("/api/blocks/:id", (req, res) => {
// 	const { id } = req.params;
// 	const { length } = blockchain.chain;
// 	const reversedBlocks = blockchain.chain.slice().reverse();

// 	let start = (id - 1) * 5;
// 	let end = id * 5;
// 	start = start < length ? start : length;
// 	end = end < length ? end : length;
// 	res.json(reversedBlocks.slice(start, end));
// });
// ------------------------------------------------------------------

app.post("/api/mine", (req, res) => {
	const { data } = req.body;
	blockchain.addBlock({ data });
	pubsub.broadcastChain();

	res.redirect("/api/blocks");
});

app.post("/api/transact", (req, res) => {
	const { amount, recipient } = req.body;

	// if there is already a transaction by a certain wallet in the transaction pool,
	// we then do not want to create a transaction, rather update that transaction itself
	let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });
	try{
		if(transaction) {
			transaction.update({ senderWallet: wallet, recipient, amount });
		} else {
			transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
		}
	} catch(err) {
		return res.status(400).json({ type: 'error', message: err.message });
	}

	transactionPool.setTransaction(transaction);
	pubsub.broadcastTransaction(transaction);
	res.json({ type: 'success', transaction });
});

app.get("/api/transaction-pool", (req,res) => {
	res.json(transactionPool.transactionMap);
});

app.get("/api/mine-transactions", (req, res) => {
	transactionMiner.mineTransactions();
	res.redirect("/api/blocks");
});

app.get("/api/wallet", (req, res) => {
	const address = wallet.publicKey;
	res.json({ address, balance: Wallet.calculateBalance({ chain: blockchain.chain, address }) });
});

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client/dist/index.html"));
});

const syncWithRootState = () => {
	request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
		if(!error && response.statusCode === 200) {
			const rootChain = JSON.parse(body);
			console.log("replacing chain to sync with", rootChain);
			blockchain.replaceChain(rootChain);
		}
	});

	request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool` }, (error, response, body) => {
		if(!error && response.statusCode === 200) {
			const rootTransactionPoolMap = JSON.parse(body);
			console.log("replacing transaction pool map to sync with", rootTransactionPoolMap);
			transactionPool.setMap(rootTransactionPoolMap);
		}
	});
};

// ------------------------------------------------------------------
// seeding backend with transactions in a development environment:
if(isDevelopment) {
	const walletOne = new Wallet();
	const walletTwo = new Wallet();

	const generateWalletTransaction = ({ wallet, recipient, amount }) => {
		const transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
		transactionPool.setTransaction(transaction);
	};

	const walletTransaction = () => generateWalletTransaction({ wallet, recipient: walletOne.publicKey, amount: 5 });
	const walletOneTransaction = () => generateWalletTransaction({ wallet: walletOne, recipient: walletTwo.publicKey, amount: 10 });
	const walletTwoTransaction = () => generateWalletTransaction({ wallet: walletTwo, recipient: wallet.publicKey, amount: 15 });

	for(let i = 0; i < 10; i++) {
		if(i % 3 === 0) { walletTransaction(); walletOneTransaction(); }
		else if(i % 3 === 1) { walletTransaction(); walletTwoTransaction(); }
		else { walletOneTransaction(); walletTwoTransaction(); }
		transactionMiner.mineTransactions();
	}
}

// ------------------------------------------------------------------
let PEER_PORT;
if(process.env.GENERATE_PEER_PORT === 'true') {
	PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
	console.log(`SWAVE server has started on port:${PORT}`);
	if(PORT !== DEFAULT_PORT) {
		syncWithRootState();
	}
});

