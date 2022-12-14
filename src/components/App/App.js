//js
import { Header } from '../Header/Header';
import { MainForm } from '../MainForm/MainForm';
import { Modal } from '../Modal/Modal';
import { Table } from '../Table/Table';
import { LocationWidget } from '../Map/Map';
import React, { Component } from 'react';
import {transform} from 'ol/proj';
import {getInitialRows, saveRowState, saveSettings, initSettings} from '../persistent';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);

    let initialRows = getInitialRows();
    let initialCols = [];
    if (initialRows.length > 0){
      let initialKeys = Object.keys( initialRows[0].data );
      initialCols = initialKeys.map((e, i) => ({ id: `head${i}`, value: e }))
    }
    this.state = {
       modelShown: false, file_name: '', rows: initialRows, columns: initialCols,
       selected: null, xy: [490488,6649695]
    };
    
  }

  componentDidMount () {
    initSettings();
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

  onSave = () => {
    let rows = this.state.rows.map(e => e.data);  
    saveRowState(rows);
    saveSettings();
    console.log('save')
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
    let crs = document.getElementById('crsSel').value;
    let rows = this.state.rows;
    let x = parseFloat( rows[rowIdx].data.x);
    let y = parseFloat( rows[rowIdx].data.y);
    if( !isNaN(x) && !isNaN(y)  ){
      let xy = transform([x,y], crs, 'EPSG:4326');
      this.setState({xy: xy})
    }
    this.setState({ modelShown: true, selected: rowIdx })
  }

  onModelClosed = ok => {
    if (ok) {
      let crs = document.getElementById('crsSel').value;
      let xy = transform(this.state.xy, 'EPSG:4326', crs);
      console.log(this.state.xy +','+ xy)
      let rows = this.state.rows;
      let rowIdx = this.state.selected;
      rows[rowIdx].data.x = xy[0];
      rows[rowIdx].data.y = xy[1];
      rows[rowIdx].data.status = 'manueel';
      this.setState({ rows: rows });
    }
    this.setState({ modelShown: false, selected: null })
  }

  render() {
    return (
      <div className="App">

        <Modal visible={this.state.modelShown} onClose={this.onModelClosed} >
              <LocationWidget onLocationSelect={
                              r => this.setState({ xy: [r.position.wgs84.lng , r.position.wgs84.lat ] }) }
                              locationLayers={[]} initialLocation={[51.22673,4.40397]} className="map-widget" />
        </Modal> 

        <Header>Geocoderen</Header>
        <MainForm columns={this.state.columns} rows={this.state.rows}
                  onHandleNewFile={this.onHandle_NewFile}
                  onGeocode={this.onGeocode} onSave={this.onSave} />

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
