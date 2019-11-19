import React, { Component } from "react";
import { Link } from "react-router-dom";
import Block from "./Block"

class Blocks extends Component {
	state = { blocks: [], paginatedId: 1, blockchainLength: 0 };

	componentDidMount() {
		fetch(`${document.location.origin}/api/blocks/`)
		.then(res => res.json())
		.then(blocks => this.setState({ blocks }));
	}

	render() {
		return(
			<div>
				<div>
					<Link to="/">Go Home</Link>
				</div>
				<br />
				<h3>Blocks:</h3>
				
				<div>
					{ this.state.blocks.map(block => <div key={block.hash}><Block className="Block" key={block.hash} block={block}/></div>) }
				</div>
			</div>
		);
	}
}

export default Blocks;