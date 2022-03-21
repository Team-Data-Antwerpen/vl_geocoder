import { Component } from 'react';
import { download,  geocode_adres  } from '../sharedUtils';
import papa from 'papaparse';

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
        let rows = this.props.rows;
        let huisnr = document.getElementById('huisnr').value;
        let straat = document.getElementById('straatnaam').value;
        let pc = document.getElementById('pc_gemeente').value;
        
        for (let idx = 0; idx < rows.length; idx++) {
          if (!rows[idx].selected) { continue }
          let row = rows[idx].data
          let adres = `${straat != '_' ? row[straat] : ''} ${huisnr != '_' ? row[huisnr] : ''} ${pc != '_' ? ', ' + row[pc] : ''}`;
          let loc = await geocode_adres(adres);
          if (loc != null) {
            let x = loc.Location.X_Lambert72;
            let y = loc.Location.Y_Lambert72;
            rows[idx].data.status = loc.LocationType;
            rows[idx].data.x = x;
            rows[idx].data.y = y;
          }
          else {
            rows[idx].data.x = -1;
            rows[idx].data.y = -1;
            rows[idx].data.status = 'Niet gevonden';
          }
          rows[idx].selected = false;
        }
        this.props.onGeocode(rows);
      }
    
    render() {
      return (
        <div className='main-form'>
          <label htmlFor="input_file">Bestand om te geocoderen:&nbsp;</label>
          <input type="file" id="input_file" accept='.csv' name='input_file' onChange={this.handleNewFile}></input>
          <select name="encoding" id="encoding">
            <option key="enc-ascii" value="ascii">ASCII</option>
            <option key="enc-utf-8" value="utf-8">UTF-8</option>
          </select>
          <br />
          <label htmlFor="straatnaam">Straatnaam:&nbsp;</label>
          <select name="straatnaam" id="straatnaam">
            <option key="straatnaam_blanc" value='_'>&lt;geen&gt;</option>
            {this.props.columns.map(o => {
              return <option key={"straatnaam" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select>
          <br />
          <label htmlFor="huisnr">Huisnummer:&nbsp;</label>
          <select name="huisnr" id="huisnr">
            <option key="huisnr_blanc" value='_'>&lt;geen&gt;</option>
            {this.props.columns.map(o => {
              return <option key={"huisnr" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select>
          <br />
          <label htmlFor="pc_gemeente">Postcode of Gemeente:&nbsp;</label>
          <select name="pc_gemeente" id="pc_gemeente">
            <option key="pc_gemeente_blanc" value='_'>&lt;geen&gt;</option>
            {this.props.columns.map(o => {
              return <option key={"pc_gemeente" + o.id} value={o.value}>{o.value}</option>;
            })}
          </select>
          <center>
            <button onClick={this.geocode_adres}>Selectie Geocoderen</button>
            <button onClick={this.download_csv}>Download CSV</button>
          </center>
        </div>
      );
    }
  }
  
  export {MainForm};