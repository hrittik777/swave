// setting default values for testing in development environment
const STARTING_BALANCE = 1000;
const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;

const GENESIS_DATA = {
	timestamp: 1,
	lastHash: '********',
	hash: '########',
	difficulty: INITIAL_DIFFICULTY,
	nonce: 0, 
	data: []
};

const REWARD_INPUT = { address: 'authorized-reward' };
const MINER_REWARD = 20;

module.exports = { 
	MINE_RATE, 
	STARTING_BALANCE, 
	GENESIS_DATA, 
	REWARD_INPUT,
	MINER_REWARD
};