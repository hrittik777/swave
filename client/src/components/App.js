import React, { Component } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

class App extends Component {
	state = { wallet: {} };
	
	componentDidMount() {
		fetch(`${document.location.origin}/api/wallet`)
		.then(res => res.json())
		.then(wallet => this.setState({ wallet }));
	}

	render() {
		const { address, balance } = this.state.wallet;
		return(
			<div className="App">
				<img className="logo" src={logo}></img>
				<div>
					<h1>SWAVE</h1>
					<h2>A Modern Blockchain-Based Cryptocurrency in JavaScript</h2>
				</div>
				<div className="Wallet">
					<div><h4 style={{fontWeight: "bold"}}>Address: </h4><h4>{address}</h4></div>
					<div><h4 style={{fontWeight: "bold"}}>Balance: </h4><h4>{balance}</h4></div>
				</div>
				<div>
					<Link to="/transact">Conduct Transaction</Link>
				</div>
				<div>
					<Link to="/blocks">View Blocks</Link>
				</div>
				<div>
					<Link to="/transaction-pool">Transaction Pool</Link>
				</div>
			</div>
		);
	}
}

export default App;