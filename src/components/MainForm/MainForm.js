//js
import React, { Component } from 'react';
import {FaRegStopCircle, FaTrash, FaSearchLocation, FaSearchPlus, FaDownload, FaSave} from 'react-icons/fa'
import { download,  geocode_adres, geocode_ar, geocode_osm, geocode_ant } from '../sharedUtils';
import papa from 'papaparse';
import { Loader } from '../Loader/Loader';
//css
import './MainForm.css';

class MainForm extends Component {
    constructor(props) {
      super(props);
      this.file = '';
      this.state = {buzzy: false, geocoder: 'geoloc', crs: 'EPSG:4326'}
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
        this.setState({buzzy: true });
        let rows = this.props.rows;
        let huisnr = document.getElementById('huisnr').value;
        let straat = document.getElementById('straatnaam').value;
        let pc = document.getElementById('pc').value;
        let gemeente = document.getElementById('gemeente').value;
        let geocoder = this.state.geocoder;
        let crs = this.state.crs;
        let idx_range = Array(rows.length).keys()

        for await (const idx of idx_range) {
          if (!rows[idx].selected && !all) { continue }

          let row = rows[idx].data
          let loc = null;
         
          if(geocoder === 'ar'){ 
              loc = await geocode_ar(row[straat], row[huisnr], row[pc], row[gemeente], crs);
          } 
          else if (geocoder === 'osm') {
              loc = await geocode_osm(row[straat], row[huisnr], row[pc], row[gemeente], crs);
          }
          else if (geocoder  === 'ant'){
              loc = await geocode_ant(row[straat], row[huisnr], row[pc], row[gemeente], crs);
          }
          else {
              loc = await geocode_adres(row[straat], row[huisnr], row[pc], row[gemeente], crs);
          }
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
      this.props.onHandleNewFile([], [], 'Geen file ingeladen')
    }

    render() {
      return (
      <>
        <div id='fileselect'>
        <label htmlFor="input_file">Bestand om te geocoderen (max 5MB):&nbsp;</label>
        <input type="file" id="input_file" accept='.csv' name='input_file'
               disabled={this.state.buzzy} onChange={this.handleNewFile}></input>
        <select name="encoding" id="encoding" disabled={this.state.buzzy}
                onChange={this.handleNewFile} >
          <option key="enc-ascii" value="ascii">ASCII</option>
          <option key="enc-utf-8" value="utf-8">UTF-8</option>
        </select> 
        </div>

        <table id='colselect'>
        <tbody>
          <tr>
            <td><label htmlFor="straatnaam">Straatnaam:&nbsp;</label>
              <select name="straatnaam" id="straatnaam">
                <option key="straatnaam_blanc" >&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"straatnaam" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
            <td><label htmlFor="huisnr">Huisnummer:&nbsp;</label>
              <select name="huisnr" id="huisnr">
                <option key="huisnr_blanc">&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"huisnr" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
          </tr><tr> 
            <td><label htmlFor="pc">Postcode:&nbsp;</label>
              <select name="pc" id="pc" >
                <option key="pc_blanc">&lt;geen&gt;</option>
                {this.props.columns.map( (o,i) => {
                  if(i < 3) {return}
                  return <option key={"pc_" + o.id} value={o.value}>{o.value}</option>;
                })}
              </select></td>
            <td><label htmlFor="gemeente">{this.state.geocoder === 'ant' ? 'Antwerps District':'Gemeente'}:&nbsp;</label>
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

        <div id='tools'>
            <button onClick={() => this.geocode_adres(1)} disabled={this.state.buzzy} title='Alles geocoderen' > 
                <FaSearchPlus size={14} />&nbsp;Alles Geocoderen
            </button>
            <button onClick={() => this.geocode_adres(0)} disabled={this.state.buzzy} title='Selectie geocoderen' > 
                <FaSearchLocation size={14} />&nbsp;Selectie Geocoderen
            </button>
            <button onClick={() => this.props.onSave() } disabled={this.state.buzzy} title='Opslaan' > 
                <FaSave size={14} />&nbsp;
            </button>
            <button onClick={this.download_csv} disabled={this.state.buzzy} title="Downloaden als CSV" >
              <FaDownload size={14} />
            </button>
            <button onClick={this.clean} disabled={this.state.buzzy} title='Leegmaken' >
               <FaTrash size={14} />
            </button>
            <label htmlFor="geolocator">&nbsp;Geocoder:&nbsp;</label>
            <select name="geolocator" id="geolocator" onChange={this.geocoderChanged}
                    value={this.state.geocoder} disabled={this.state.buzzy} >
                <option key='geolocator1' value='ar'
                     title='Beperkt tot Vlaanderen' >Vlaams Adressenregister</option>
                <option key='geolocator2' value='osm'
                     title='Beperkt tot België' >Openstreetmap Nominatim</option>
                <option key='geolocator3' value='ant' 
                     title='Beperkt Antwerpen' >Stad Antwerpen</option>
                <option key='geolocator0' value='geoloc'
                     title='Beperkt tot Vlaanderen en Brussel' >CRAB geolocation</option>
            </select>
            <label htmlFor="crsSel">&nbsp;CRS:&nbsp;</label>
            <select name="crsSel" id="crsSel" onChange={this.crsChanged}
                    value={this.state.crs} disabled={this.state.buzzy} >
                <option key='WGS 1984 (lat/long)' value='EPSG:4326'>WGS 1984 (lat/long)</option>
                <option key='Belgisch Lambert 1972' value='EPSG:31370'>Belgisch Lambert 1972</option>
                <option key='Belgisch Lambert 2008' value='EPSG:3812'>Belgisch Lambert 2008</option>
                <option key='Webmercator' value='EPSG:3857'>Webmercator</option>
            </select>
        </div>
        <Loader buzzy={this.state.buzzy}>
          <div>
          <button onClick={() => this.setState({buzzy: false})} title='Stoppen' >
              <FaRegStopCircle size={14} style={{color:'red'}} />Stoppen
          </button><br/>
            De gegevens worden verwerkt
          </div>
        </Loader>
      </>

      );
      }
  }
  
  export {MainForm};