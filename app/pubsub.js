const PubNub = require("pubnub");

const credentials = {
	publishKey: "pub-c-50ec98a1-9b90-4a91-a4bd-a0b2173b6c74",
	subscribeKey: "sub-c-5988ce4a-0857-11ea-98aa-b207d7d0b791",
	secretKey: "sec-c-ZTU3ODA0MzMtM2U1OC00MTQzLThlZjMtMTc3MmIzMTgyMWZk"
}

const CHANNELS = {
	TEST: "TEST",
	BLOCKCHAIN: "BLOCKCHAIN",
	TRANSACTION: "TRANSACTION"
}

class PubSub {
	constructor({ blockchain, transactionPool, wallet }) {
		this.blockchain = blockchain;
		this.transactionPool = transactionPool;
		this.wallet = wallet;
		this.pubnub = new PubNub(credentials);

		this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });
		this.pubnub.addListener(this.listener());
	}

	broadcastChain() {
		this.publish({ channel: CHANNELS.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) });
	}

	broadcastTransaction(transaction) {
		this.publish({ channel: CHANNELS.TRANSACTION, message: JSON.stringify(transaction) });
	}

	subscribeToChannels() {
		this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });
	}

	listener() {
		return {
			message: messageObject => {
				const { message, channel } = messageObject;
				console.log(`Message received. Channel:${channel}. Message:${message}`);
				
				const parsedMessage = JSON.parse(message);
				switch(channel) {
					case CHANNELS.BLOCKCHAIN:
						this.blockchain.replaceChain(parsedMessage, true, () => {
							this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage });
						});
						break;
					case CHANNELS.TRANSACTION:
						if (!this.transactionPool.existingTransaction({ inputAddress: this.wallet.publicKey })) {
							this.transactionPool.setTransaction(parsedMessage);
						}
						break;
					default:
						return;
				}
			}
		}
	}

	publish({ channel, message }) {
		this.pubnub.publish({ channel, message });
	}
}

module.exports = PubSub;

