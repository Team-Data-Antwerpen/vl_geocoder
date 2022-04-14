//js
import React, { Component } from 'react';
import { download,  geocode_adres, geocode_ar  } from '../sharedUtils';
import papa from 'papaparse';
//css
import './MainForm.css';

class MainForm extends Component {
    constructor(props) {
      super(props);
      this.file = ''
    }
    download_csv = () => {
        if (this.file == '') { return }
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
        let cols = xyCols.map((e, i) => ({ id: `head${i}`, value: e }));
    
        let rows = csv.data.map((e, i) => {
          let row = Object.assign({ x: '', y: '', status: '' }, e);
          return { id: `row${i}`, selected: false, data: row }
        });
        this.props.onHandleNewFile(cols, rows, this.file_name)
      }

   geocode_adres = async () => {
        this.props.onGeocodeStart();

        let rows = this.props.rows;
        let huisnr = document.getElementById('huisnr').value;
        let straat = document.getElementById('straatnaam').value;
        let pc = document.getElementById('pc').value;
        let gemeente = document.getElementById('gemeente').value;
        let geocoder = document.getElementById('geolocator').value;

        for (let idx = 0; idx < rows.length; idx++) {
          if (!rows[idx].selected) { continue }
          let row = rows[idx].data
          let loc = null;
         
          if(geocoder === 'ar'){ 
              loc = await geocode_ar(row[straat], row[huisnr], row[pc], row[gemeente]);
          } 
          else {
              loc = await geocode_adres(row[straat], row[huisnr], row[pc], row[gemeente]);
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
        }
        this.props.onGeocodeEnd(rows);
      }
    
    render() {
      return (
        <div className='main-form'>
          <label htmlFor="input_file">Bestand om te geocoderen:&nbsp;</label>
          <input type="file" id="input_file" accept='.csv' name='input_file' onChange={this.handleNewFile}></input>
          <select name="encoding" id="encoding" onChange={this.handleNewFile} >
            <option key="enc-ascii" value="ascii">ASCII</option>
            <option key="enc-utf-8" value="utf-8">UTF-8</option>
          </select> <br />
          <label htmlFor="straatnaam">Straatnaam:&nbsp;</label>
          <select name="straatnaam" id="straatnaam">
            <option key="straatnaam_blanc" >&lt;geen&gt;</option>
            {this.props.columns.map( (o,i) => {
              if(i < 3) {return}
              return <option key={"straatnaam" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select><br/>
          <label htmlFor="huisnr">Huisnummer:&nbsp;</label>
          <select name="huisnr" id="huisnr">
            <option key="huisnr_blanc">&lt;geen&gt;</option>
            {this.props.columns.map( (o,i) => {
              if(i < 3) {return}
              return <option key={"huisnr" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select><br/>
          <label htmlFor="pc">Postcode:&nbsp;</label>
          <select name="pc" id="pc">
            <option key="pc_blanc">&lt;geen&gt;</option>
            {this.props.columns.map( (o,i) => {
              if(i < 3) {return}
              return <option key={"pc_" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select><br/>
          <label htmlFor="gemeente">Gemeente:&nbsp;</label>
          <select name="gemeente" id="gemeente">
            <option key="gemeente_blanc">&lt;geen&gt;</option>
            {this.props.columns.map( (o,i) => {
              if(i < 3) {return}
              return <option key={"gemeente_" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select>
          <center>
            <button onClick={this.geocode_adres}>Selectie Geocoderen</button>
            <button onClick={this.download_csv}>Download CSV</button>
            <label htmlFor="geolocator">&nbsp;Geocoder:&nbsp;</label>
            <select name="geolocator" id="geolocator" defaultValue='geoloc'>
                <option key='geolocator0' value='geoloc'>CRAB geolocation</option>
                <option key='geolocator1' value='ar'>Adressenregister</option>
            </select>
          </center>
        </div>
      );
    }
  }
  
  export {MainForm};