import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

class Blocks extends Component {
	state = { display: false };

	toggleDisplay = () => {
		this.setState({ display: !this.state.display });
	}

	// computed property
	get display() {
		const { data } = this.props.block; 
		const stringData = JSON.stringify(data);
		const dataDisplay = stringData.length > 40 ? `${stringData.substring(0, 20)}...` : stringData;
		if(this.state.display) {
			return(
				<div>
					{ data.map(transaction => <div key={transaction.id}><hr /><Transaction transaction={transaction} /></div>) }
					<br />
					<Button bsStyle="default" bsSize="small" onClick={this.toggleDisplay}>Less</Button>
				</div>
			);
		}
		return (
			<div>
				<div>Data: {dataDisplay}</div>
				<br />
				<Button bsStyle="default" bsSize="small" onClick={this.toggleDisplay}>More</Button>
			</div>
		);
	}

	render() {
		const { timestamp, hash } = this.props.block; 
		const hashDisplay = `${hash.substring(0, 40)}...`;
		return(
			<div className="Block">
				<div>Hash: {hashDisplay}</div>
				<div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
				{this.display}
			</div>
		);
	}
}

export default Blocks;