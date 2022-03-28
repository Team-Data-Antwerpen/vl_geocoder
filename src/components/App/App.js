//js
import { Header } from '../Header/Header'
import { MainForm } from '../MainForm/MainForm';
import { Modal } from '../Modal/Modal';
import Map from '../Map/Map';
import { BiSelectMultiple, BiLayer, BiLoader } from 'react-icons/bi'
import React, { Component } from 'react';
//css
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { modelShown: false, file_name:'', rows: [], columns: [],
                   buzzy: false, selected: null, xy:[149500,169450] };
  }

  selectAll = () => {
    let rows = this.state.rows.map(row => { row.selected = !row.selected; return row });
    this.setState({ rows: rows });
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
    let colName = this.state.columns[colIdx].value;
    rows[rowIdx].data[colName] = cell;
    this.setState({ rows: rows });
  }

  onSelectionChange = (rowIdx, checked) => {
    let rows = this.state.rows;
    rows[rowIdx].selected = checked;
    this.setState({ rows: rows });
  }

  onMapOpen = rowIdx => {
    let x = this.state.rows[rowIdx].data.x;
    let y = this.state.rows[rowIdx].data.y;
    this.setState({modelShown: true, selected: rowIdx, xy: [x,y] }) 
  }

  onModelClosed = ok => {
    if(ok){
       let xy = this.state.xy;
       let rows = this.state.rows;
       let rowIdx = this.state.selected;
       rows[rowIdx].data.x = xy[0].toFixed(2);
       rows[rowIdx].data.y = xy[1].toFixed(2);
       rows[rowIdx].data.status = 'manueel';
       this.setState({ rows: rows });
    }
    this.setState({modelShown: false , selected: null }) 
  }

  render() {
    return (
      <div className="App">
        
        <Modal visible={this.state.modelShown} onClose={this.onModelClosed} >
          <Map center={this.state.xy} visible={this.state.modelShown}
               onMapClick={pt => (this.setState({ xy: pt }))} />
        </Modal>

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
                  <BiSelectMultiple /> Alles
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
                  <div >
                    <BiLayer  title='Op kaart bewerken' className='pushBtn'
                              onClick={() => this.onMapOpen(rowIdx)} />
                    <input type="checkbox" checked={row.selected}
                      onChange={e => (this.onSelectionChange(rowIdx, e.target.checked) )} />
                  </div>   
                </td>

                {values.map((cell, cellIdx) => (
                  <td key={`${row.id}-${cellIdx}`} >
                    <input disabled={cellIdx < 3 ? "disabled" : ""}
                      className={row.data.x > 0 ? "found" : row.data.x == '' ? '' : "notfound"}
                      onChange={() => this.onCellChange(`cell-${row.id}-${cellIdx}`, rowIdx, cellIdx)}
                      type="text" id={`cell-${row.id}-${cellIdx}`} value={cell} />
                  </td>
                ))}
                </tr>)
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
