//js
import { Header } from '../Header/Header'
import { MainForm } from '../MainForm/MainForm';
import { Modal } from '../Modal/Modal';
import { Table } from '../Table/Table';
import { Map } from '../Map/Map';
import React, { Component } from 'react';
//css
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
       modelShown: false, file_name: '', rows: [], columns: [],
       selected: null, xy: [149500, 169450]
    };
  }

  selectAll = () => {
    let rows = this.state.rows.map(row => { row.selected = !row.selected; return row });
    this.setState({ rows: rows });
  }

  onGeocode = async (idx, row) => {
    if(row){
      let rows = this.state.rows;
      rows[idx] = row;
      this.setState({rows: rows});
    }
  }

  onHandle_NewFile = (cols, rows, file_name) => {
    this.setState({ file_name: file_name, columns: cols, rows: rows });
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
    this.setState({ modelShown: true, selected: rowIdx, xy: [x, y] })
  }

  onModelClosed = ok => {
    if (ok) {
      let xy = this.state.xy;
      let rows = this.state.rows;
      let rowIdx = this.state.selected;
      rows[rowIdx].data.x = xy[0].toFixed(2);
      rows[rowIdx].data.y = xy[1].toFixed(2);
      rows[rowIdx].data.status = 'manueel';
      this.setState({ rows: rows });
    }
    this.setState({ modelShown: false, selected: null })
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
                  columns={this.state.columns} rows={this.state.rows}
                  onHandleNewFile={this.onHandle_NewFile}
                  onGeocode={this.onGeocode} />

        <Table selectAll={this.selectAll} 
               columns={this.state.columns} 
               rows={this.state.rows} 
               onMapOpen={this.onMapOpen} 
               onSelectionChange={this.onSelectionChange} 
               onCellChange={this.onCellChange} />
      </div>
    )
  }
}
export default App;
