
//js
import { Header } from '../Header/Header'
import { MainForm } from '../MainForm/MainForm';
import { Modal } from '../Modal/Modal'
import { BiSelectMultiple, BiLayer, BiMap, BiLoader } from 'react-icons/bi'
import { Component } from 'react';
//css
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { file_name: '', rows: [], columns: [] , buzzy : false };
  }

  selectAll = () => {
    let rows = this.state.rows.map(row => { row.selected = !row.selected; return row });
    this.setState({ rows: rows })
  }

  onGeocode_end = async (rows) => {
    this.setState({ rows: rows, buzzy : false });
  }

  onHandle_NewFile = (cols, rows, file_name) => {
    this.setState({file_name: file_name, columns: cols, rows: rows });
  }

  onCellChange = (cellId, rowIdx, colIdx) => {
    let cell = document.getElementById(cellId).value;
    let rows = this.state.rows;
    rows[rowIdx].data[this.state.columns[colIdx].value] = cell;
    this.setState({ rows: rows });
  }

  onSelectionChange = (rowIdx, checked) => {
    let rows = this.state.rows;
    rows[rowIdx].selected = checked;
    this.setState({ rows: rows });
  }

  render() {
    return (
      <div className="App">

        <Header>Geocoderen</Header>
        <MainForm handleNewFile={this.handleNewFile} 
                  columns={this.state.columns}  rows={this.state.rows}
                  onGeocodeStart={() => this.setState({buzzy : true})}
                  onHandleNewFile={this.onHandle_NewFile}
                  onGeocodeEnd={this.onGeocode_end}  />
        {/*TABLE*/}
        <table id="main-table" style={{ visibility: this.state.columns.length > 0 ? 'visible' : 'hidden' }} >
          <tbody>
            <tr key='head'>
              <th key="checkbox" >
                <div title='Alles Selecteren' className='selBtn' onClick={this.selectAll} >
                  <BiSelectMultiple />&nbsp;Alles
                </div>
              </th>
              {this.state.columns.map(o => {
                return <th key={o.id}><div>{o.value}</div></th>
              })}
            </tr>
            {this.state.rows.map((row, rowIdx) => {
              let values = Object.values(row.data);
              return (<tr key={row.id} >
                <td key={`chk${row.id}`} >
                  <input type="checkbox" checked={row.selected}
                    onChange={e => this.onSelectionChange(rowIdx, e.target.checked)} />
                </td>

                {values.map((cell, cellIdx) => (
                  <td key={`${row.id}-${cellIdx}`} >
                    <input disabled={cellIdx < 3 ? "disabled" : ""}
                      className={row.data.x > 0 ? "found" : row.data.x == '' ? '' : "notfound"}
                      onChange={() => this.onCellChange(`cell-${row.id}-${cellIdx}`, rowIdx, cellIdx)}
                      type="text" id={`cell-${row.id}-${cellIdx}`} value={cell} />
                  </td>
                ))} </tr>)
            })}
          </tbody>
        </table>
        {/*/TABLE*/}

        <div className='buzzy-indicator' style={{ visibility: this.state.buzzy? 'visible' : 'hidden' }} > 
          <BiLoader className='icon-spin' size={70}></BiLoader><br/>
          De gegevens worden verwerkt.
        </div>
      </div> );
  }
}
export default App;
