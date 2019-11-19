import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";
import { Link } from "react-router-dom";
import history from "../history";

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
	state = { transactionPoolMap: {} };

	fetchTransactionPoolMap = () => {
		fetch(`${document.location.origin}/api/transaction-pool`)
		.then(res => res.json())
		.then(transactionPoolMap => this.setState({ transactionPoolMap }));
	}

	mineTransactions = () => {
		fetch(`${document.location.origin}/api/mine-transactions`)
		.then(res => {
			if(res.status === 200) {
				alert("success");
				history.push("/blocks");
			} else {
				alert("Could not mine transactions.")
			}
		});
	}

	componentDidMount() {
		this.fetchTransactionPoolMap();
		this.fetchTransactionPoolMapInterval = setInterval(() => this.fetchTransactionPoolMap(), POLL_INTERVAL_MS);
	}

	componentWillUnmount() {
		clearInterval(this.fetchTransactionPoolMapInterval);
	}
	
	render() {
		return(
			<div className="TransactionPool">
				<div><Link to="/">Go Home</Link></div>
				<h3>Transaction Pool</h3>
				{ Object.values(this.state.transactionPoolMap).map(t => <div key={t.id}><hr /><Transaction transaction={t}/></div>) }
				<hr />
				<Button bsStyle="danger" onClick={this.mineTransactions}>Mine Transactions</Button>
			</div>
		);
	}
}

export default TransactionPool;