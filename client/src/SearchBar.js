import React from 'react';
import AsyncSelect from 'react-select/async';
import './SearchBar.css';


class SearchBar extends React.Component {
  	constructor(props){
  		super(props);
  		this.state = {
  			selectedOption: null
  		}
  		this.fetchOptions = this.fetchOptions.bind(this);
  		this.handleChange = this.handleChange.bind(this);
  	}



	async fetchOptions(query) {
		const newOptions = await fetch(`http://localhost:8000/search/autocomplete?q=${query}`)
		.then(res => res.text())
		.then(res => JSON.parse(res))
		.then(res => res.cityNames);
		const formattedOptions = newOptions.map(option => {
			return {
				value: option, 
				label: option
			}
		});
		return formattedOptions;
	}


	async handleChange(query){
		this.setState({selectedOption: query});
	}

  	render(){
  		const { selectedOption } = this.state;

  	  	return (
  		    <AsyncSelect
	         	className="search"
		        value={selectedOption}
		        onInputChange={this.handleChange}
		        onChange={this.handleChange}
		        loadOptions={this.fetchOptions}
		    />
		);
  	}
  	
}
  

export default SearchBar;
