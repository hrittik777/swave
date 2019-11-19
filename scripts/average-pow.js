const Blockchain = require("./blockchain");

const blockchain = new Blockchain();
let prevTimestamp, nextTimestamp, timeDiff, average;
const times = [];

blockchain.addBlock({ data: 'genesis' });

for(let i = 0; i < 1000; i++) {
	prevTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
	
	blockchain.addBlock({ data: `block ${i}` });
	nextTimestamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
	
	timeDiff = nextTimestamp - prevTimestamp;
	times.push(timeDiff);
	average = times.reduce((total, time) => total + time)/times.length;

	console.log(
		`Time to mine block: ${timeDiff}ms. 
		Difficulty: ${blockchain.chain[blockchain.chain.length - 1].difficulty}. 
		Average time: ${average}ms.`
	);
}
