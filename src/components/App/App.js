//img
import logo from '../../img/logo.svg';
//js
import { Component } from 'react';
import { download, geocode_adres } from './tools'
import papa from 'papaparse';
//css
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {file_name: '', rows: [], columns: []};
    this.handleNewFile = this.handleNewFile.bind(this);
    this.processCsv =  this.processCsv.bind(this);
    this.geocode_adres = this.geocode_adres.bind(this);
    this.onCellChange = this.onCellChange.bind(this);
    this.download_csv = this.download_csv.bind(this);
  }
 
  async geocode_adres(){
    let huisnr = document.getElementById('huisnr').value ;
    let straat = document.getElementById('straatnaam').value ;
    let pc =  document.getElementById('pc_gemeente').value ;
    let rows = this.state.rows;
    for  (let idx = 0; idx < rows.length; idx++) {
        let row = rows[idx].data
        let adres = `${straat !='_'? row[straat]:''} ${huisnr !='_'? row[huisnr]:''} ${pc !='_'? ', '+ row[pc]:''}`;
        let loc = await geocode_adres(adres);
        if( loc != null){
          let x= loc.Location.X_Lambert72;
          let y= loc.Location.Y_Lambert72;
          rows[idx].data.status = loc.LocationType;
          rows[idx].data.x = x;
          rows[idx].data.y = y;
        }
        else{
          rows[idx].data.x = -1;
          rows[idx].data.y = -1;
          rows[idx].data.status = 'Niet gevonden';
        }
    }
    this.setState({rows: rows })
  }

  download_csv(){
    if(this.state.file_name == ''){return}
    let rows =  this.state.rows.map(e => e.data);
    let fname = "XY"+ this.state.file_name;
    download( fname, papa.unparse( rows , {delimiter: ";",}) );
  }

  processCsv( csv ){
    let xyCols = ["x", "y", "status"].concat( Object.keys(csv.data[0]) );
    let cols = xyCols.map((e, i) => ({id: `head${i}`, value: e}) );

    let rows = csv.data.map((e, i) => { 
      let row = Object.assign({ x: '', y: '', status: ''}, e);
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
          <option key="straatnaam_blanc" value='_'>&lt;geen&gt;</option>
            {this.state.columns.map( o => {
              return <option key={"straatnaam"+o.id}  value={o.value}>{o.value}</option>
            })}
          </select>
          <br/>
          <label htmlFor="huisnr">Huisnummer:&nbsp;</label>
          <select name="huisnr" id="huisnr" >
          <option key="huisnr_blanc" value='_'>&lt;geen&gt;</option>
            {this.state.columns.map( o => {
              return <option key={"huisnr"+o.id} value={o.value}>{o.value}</option>
            })}
          </select>
          <br/>
          <label htmlFor="pc_gemeente">Postcode of Gemeente:&nbsp;</label>
          <select name="pc_gemeente" id="pc_gemeente" >
          <option key="pc_gemeente_blanc" value='_'>&lt;geen&gt;</option>
            {this.state.columns.map( o => {
              return <option key={"pc_gemeente"+o.id} value={o.value}>{o.value}</option>
            })}
          </select>
        </div>
        <button onClick={this.geocode_adres}>Geocodeer</button>
        <button onClick={this.download_csv}>Download </button>
         <table id="main-table" >
         <tbody>
           <tr key='head'>
             <th  key="checkbox"></th>
          {this.state.columns.map( o => {
						return <th  key={o.id}><div>{o.value}</div></th>
				  })}
           </tr>
          {this.state.rows.map((row, rowIdx) => {
              let values = Object.values(row.data);
              return (<tr key={row.id} >  
              <td><input type="checkbox" /></td>
              {values.map( (cell,cellIdx) => (
                <td key={`${row.id}-${cellIdx}`} >
                  <input  disabled = {cellIdx < 3 ? "disabled" : ""}
                   className={ row.data.x > 0 ? "found" : row.data.x == '' ? '': "notfound" }
                   onChange={() => {this.onCellChange(`cell-${row.id}-${cellIdx}`, rowIdx, cellIdx)}}
                   type="text" id={`cell-${row.id}-${cellIdx}`} value={cell}/>
                </td>
              ))} </tr>)
            })}
         </tbody>
         </table>
      </div>
    );
  }
}
export default App;
