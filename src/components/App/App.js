//img
import logo from '../../img/logo.svg';
//js
import { Component } from 'react';
import papa from 'papaparse';
//css
import './App.css';

const geopuntURI = "https://loc.geopunt.be/v4/Location"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {file_name: 'Kies een csv-file', rows: [], columns: []};
    this.handleNewFile = this.handleNewFile.bind(this);
    this.processCsv =  this.processCsv.bind(this);
    this.geocode_adres =  this.geocode_adres.bind(this);
    this.onCellChange =  this.onCellChange.bind(this);
  }
 
  async geocode_adres(){
    let huisnr = document.getElementById('huisnr').value ;
    let straatnaam = document.getElementById('straatnaam').value ;
    let pc_gemeente =  document.getElementById('pc_gemeente').value ;
    let rows = this.state.rows;
    for  (let idx = 0; idx < rows.length; idx++) {
        let row = rows[idx].data
        let adres = `${row[straatnaam]}  ${row[huisnr]}, ${row[pc_gemeente]}`;
        let result = await fetch( `${geopuntURI}?q=${adres}`).then(e => e.json());
        let loc = result.LocationResult;
        console.log(`${geopuntURI}?q=${adres}`);
        if( loc.length > 0){
          let x= loc[0].Location.X_Lambert72;
          let y= loc[0].Location.Y_Lambert72;
          rows[idx].data.x = x;
          rows[idx].data.y = y;
        }
        else{
          rows[idx].data.x = -1;
          rows[idx].data.y = -1;
        }
    }
    this.setState({rows: rows })
  }

  processCsv( csv ){
    let xyCols = ["x", "y"].concat( Object.keys(csv.data[0]) );
    let cols = xyCols.map((e, i) => ({id: `head${i}`, value: e}) );

    let rows = csv.data.map((e, i) => { 
      let row = Object.assign({x: '', y: ''}, e);
      return {id: `row${i}`, data: row}
    });
    this.setState({columns: cols});
    this.setState({rows: rows })
  }
  
  handleNewFile(){
    const selectedFile = document.getElementById('input_file').files[0];
    const encoding = document.getElementById('encoding').value ;
    if( selectedFile ){
      this.setState({file_name: selectedFile.name });
      papa.parse(selectedFile, {header:true, encoding:encoding, complete: this.processCsv})
    }
  }

  onCellChange(cellId, rowI, colI){
    let cell = document.getElementById(cellId).value;
    let rows = this.state.rows; 
    rows[rowI].data[this.state.columns[colI].value] = cell;
    this.setState({rows: rows });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
        <div className='App-title-box' >
           <img src={logo} className="App-logo" alt="logo" />
           <span className='App-title'> Geocoderen</span>
        </div>
        </header>
        <div className='main-form'>
          <label htmlFor="input_file">Bestand om te geocoderen:&nbsp;</label>
          <input type="file" id="input_file" accept='.csv' name='input_file' onChange={this.handleNewFile} ></input>
          <select name="encoding" id="encoding" >
            <option key="enc-ascii" value="ascii">ASCII</option>
            <option key="enc-utf-8" value="utf-8">UTF-8</option>
          </select>
          <br/>
          <label htmlFor="straatnaam">Straatnaam:&nbsp;</label>
          <select name="straatnaam" id="straatnaam" >
            {this.state.columns.map( o => {
              return <option key={"straatnaam"+o.id}  value={o.value}>{o.value}</option>
            })}
          </select>
          <br/>
          <label htmlFor="huisnr">Huisnummer:&nbsp;</label>
          <select name="huisnr" id="huisnr" >
            {this.state.columns.map( o => {
              return <option key={"huisnr"+o.id} value={o.value}>{o.value}</option>
            })}
          </select>
          <br/>
          <label htmlFor="pc_gemeente">Postcode of Gemeente:&nbsp;</label>
          <select name="pc_gemeente" id="pc_gemeente" >
            {this.state.columns.map( o => {
              return <option key={"pc_gemeente"+o.id} value={o.value}>{o.value}</option>
            })}
          </select>
        </div>
        <button onClick={this.geocode_adres}>Geocodeer</button>
         <table id="main-table" >
         <tbody>
           <tr key='head'>
          {this.state.columns.map( o => {
						return <th  key={o.id}>{o.value}</th>
				  })}
           </tr>
          {this.state.rows.map((row, rowIdx) => {
              let values = Object.values(row.data);
              return <tr key={row.id} >  
              {values.map( (cell,cellIdx) => (
                <td key={`${row.id}-${cellIdx}`} >
                  <input onChange={() => {this.onCellChange(`cell-${row.id}-${cellIdx}`, rowIdx, cellIdx)}}
                    type="text" id={`cell-${row.id}-${cellIdx}`} value={cell}/>
                </td>
              ))} </tr>
            })}
         </tbody>
         </table>
      </div>
    );
  }
}
export default App;
