//js
import React, { Component } from 'react';
import {FaRegStopCircle, FaTrash, FaSearchPlus, FaSearchLocation, FaDownload, FaSave} from 'react-icons/fa'
import { download,  listGeocoder } from '../sharedUtils';
import papa from 'papaparse';
import { Loader } from '../Loader/Loader';
import { Button } from '@acpaas-ui/react-components';
import 'regenerator-runtime/runtime';
//css
import './MainForm.css';
import '@a-ui/core/dist/main.css';

class MainForm extends Component {
    constructor(props) {
      super(props);
      this.file = '';
      this.state = {buzzy: false, geocoder: '', geocoders: [], crs: 'EPSG:4326'}
      listGeocoder().then( geocoderList =>
        this.setState({geocoders: geocoderList , geocoder: geocoderList[0]['id'] })
      );
    }

    download_csv = () => {
        if (this.file == '') { 
          this.file = 'file.csv';
        }
        let rows = this.props.rows.map(e => e.data);
        let fname = "XY" + this.file;
        download(fname, papa.unparse(rows, { delimiter: ";", }));
      }

    handleNewFile = () => {
        const selectedFile = document.getElementById('input_file').files[0];
        const encoding = document.getElementById('encoding').value;
        if (selectedFile) {
          this.file = selectedFile.name;
          papa.parse(selectedFile, { header: true, encoding: encoding, complete: this.processCsv });
        }
      }

    processCsv = csv => {
        let xyCols = ["x", "y", "status"].concat(Object.keys(csv.data[0]));
        xyCols = [...new Set(xyCols)]; //make unique
        let cols = xyCols.map((e, i) => ({ id: `head${i}`, value: e }));
    
        let rows = csv.data.map((row, i) => {
          row =  Object.assign( { x: '', y: '', status: '' }, row);
          return { id: `row${i}`, selected: false, data: row }
        });
        this.props.onHandleNewFile(cols, rows, this.file_name)
      }

    geocode_adres = async (all) => {
        console.log(all)

        let geocoder = this.state.geocoders.find(e => e['id'] == this.state.geocoder);
        if(!geocoder){  throw 'Geocoder not found' }
        this.setState({buzzy: true });

        let rows = this.props.rows;
        let huisnr = document.getElementById('huisnr').value;
        let straat = document.getElementById('straatnaam').value;
        let pc = document.getElementById('pc').value;
        let gemeente = document.getElementById('gemeente').value;
        let crs = this.state.crs;
        let idx_range = Array(rows.length).keys()

        for await (const idx of idx_range) {
          if (!rows[idx].selected && !all) { continue }

          let row = rows[idx].data
          let loc = await geocoder['callback'](row[straat], row[huisnr], row[pc], row[gemeente], crs);

          if (loc != null) {
            rows[idx].data.status = loc.status;
            rows[idx].data.x = loc.x;
            rows[idx].data.y = loc.y;
          }
          else {
            rows[idx].data.x = -1;
            rows[idx].data.y = -1;
            rows[idx].data.status = 'Niet gevonden';
          }
          rows[idx].selected = false;
          this.props.onGeocode(idx, rows[idx]);
          if (!this.state.buzzy) {break}
        }
        this.setState({buzzy: false});
      }

    geocoderChanged =  e => {
      this.setState({geocoder: e.target.value});
    }

    crsChanged =  e => {
      this.setState({crs: e.target.value});
    }

    clean = () =>{
      this.props.onHandleNewFile([], [], 'Geen file ingeladen');
      this.props.onSave();
    }

    render() {
      return (
      <>
   <div id='fileselect' style={{display: 'inline-block', paddingLeft: 80}}> 
          <label className="a-input__label a-input__label--inline" 
                htmlFor="input_file">Bestand om te geocoderen (max 5MB):</label>
          <input type="file" id="input_file" accept='.csv' name='input_file'
               disabled={this.state.buzzy} onChange={this.handleNewFile}></input> 
      <span className="a-input a-input--inline a-input--s" style={{display: 'inline-block'}}>
        <span className="a-input__wrapper a-input__wrapper--inline">
          <select name="encoding" id="encoding" disabled={this.state.buzzy}
                onChange={this.handleNewFile} >
            <option key="enc-ascii" value="ascii">ASCII</option>
            <option key="enc-utf-8" value="utf-8">UTF-8</option>
          </select> 
        </span> 
      </span> 
    </div>

    <span className="a-input a-input--s">
        <table id='colselect' style={{ paddingLeft: 80}}>
        <tbody>
          <tr>
              <td>
              <label className="a-input__label" htmlFor="straatnaam">Straatnaam:</label>
              <select name="straatnaam" id="straatnaam">
                <option key="straatnaam_blanc" >&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"straatnaam" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select>
              </td>
            <td><label className="a-input__label" htmlFor="huisnr">Huisnummer:&nbsp;</label>
              <select name="huisnr" id="huisnr">
                <option key="huisnr_blanc">&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"huisnr" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
          </tr><tr> 
            <td><label className="a-input__label" htmlFor="pc">Postcode:&nbsp;</label>
              <select name="pc" id="pc" >
                <option key="pc_blanc">&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"pc_" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
            <td><label className="a-input__label" htmlFor="gemeente">{this.state.geocoder === 'ant' ? 'Antwerps District':'Gemeente'}:&nbsp;</label>
              <select name="gemeente" id="gemeente" >
                <option key="gemeente_blanc">&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"gemeente_" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
          </tr>
         </tbody>
        </table>
      </span> 

      <div id='tools'>
          <Button type="primary" size="small"  title='Alles geocoderen'
              onClick={() => this.geocode_adres(true)} disabled={this.state.buzzy} > 
              <FaSearchPlus size={16} />&nbsp;Alles Geocoderen
          </Button> 
          <Button type="primary" size="small" title='Selectie geocoderen'
                onClick={() => this.geocode_adres(false) } disabled={this.state.buzzy}  > 
              <FaSearchLocation size={16} />&nbsp;Selectie Geocoderen
          </Button>
          <Button type="primary" size="small" title='Opslaan' 
                  onClick={() => this.props.onSave() } disabled={this.state.buzzy}  > 
              <FaSave size={16} />&nbsp;
          </Button>
          <Button type="primary" size="small" title="Downloaden als CSV"
                  onClick={this.download_csv} disabled={this.state.buzzy} >
              <FaDownload size={16} />
          </Button>
          <Button type="primary" size="small" onClick={this.clean} disabled={this.state.buzzy} title='Leegmaken' >
              <FaTrash size={16} />
          </Button>

          <span className="a-input a-input--inline a-input--s" style={{display: 'inline-block'}}>   
             <label className="a-input__label a-input__label--inline" htmlFor="geolocator">&nbsp;Geocoder:</label>
              <div className="a-input__wrapper a-input__wrapper--inline">
                <select name="geolocator" id="geolocator" onChange={this.geocoderChanged}
                      value={this.state.geocoder} disabled={this.state.buzzy} >
                  {this.state.geocoders.map( (e, i) => 
                      <option key={e.id} value={e.id} title={e.title} >
                        {e.name}</option>
                  )}
                </select>
              </div>    
   
            <label className="a-input__label  a-input__label--inline" htmlFor="crsSel">&nbsp;CRS:</label>
            <div className="a-input__wrapper a-input__wrapper--inline">
            <select name="crsSel" id="crsSel" onChange={this.crsChanged}
                    value={this.state.crs} disabled={this.state.buzzy} >
                <option key='WGS 1984 (lat/long)' value='EPSG:4326'>WGS 1984 (lat/long)</option>
                <option key='Belgisch Lambert 1972' value='EPSG:31370'>Belgisch Lambert 1972</option>
                <option key='Belgisch Lambert 2008' value='EPSG:3812'>Belgisch Lambert 2008</option>
                <option key='Webmercator' value='EPSG:3857'>Webmercator</option>
                </select>
              </div>    
          </span>
        </div>

        <Loader buzzy={this.state.buzzy}>
          <div>
          <Button onClick={() => this.setState({buzzy: false})} title='Stoppen' >
              <FaRegStopCircle size={16} style={{color:'red'}} />&nbsp;Stoppen
          </Button><br/>
            De gegevens worden verwerkt
          </div>
        </Loader>
      </>

      );
      }
  }
  
  export {MainForm};
