//diverse tools
import {transform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 "+
    "+lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl "+
    "+towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs");
register(proj4);


async function geocode_osm(straat, huisnr, pc, gemeente){
    const osm_URI = `https://nominatim.openstreetmap.org/search`;
    let rjs; 
    let q = `${straat != undefined? straat: ''} ${huisnr != undefined ? huisnr : ''} ${
      pc != undefined? ', '+ pc : ''} ${gemeente != undefined? gemeente : ''}`;

    try {
       let r = await fetch( 
        `${osm_URI}?q=${encodeURIComponent(q)}&countrycodes=be&format=json` );
      console.log(`${osm_URI}?q=${q}&countrycodes=be&format=json`)
       rjs = await r.json();
    } 
    catch (error) {
        return {x: -1, y: -1, status: 'error', adres: null }
    }

    if( rjs && rjs.length > 0){
      let loc = rjs[0];
      let xy = transform([parseFloat(loc.lon), parseFloat(loc.lat)], "EPSG:4326", "EPSG:31370");
      let status = `https://www.openstreetmap.org/${loc.osm_type}/${loc.osm_id}`;

      return {
        x: xy[0] , y: xy[1] , status: status , adres: loc.display_name
      }    
    }    
    else return {
      x: -1, y: -1, status: "adres niet gevonden", adres: null
    }
  }

async function geocode_ar(straat, huisnr, pc, gemeente){
    const arURI = "https://api.basisregisters.vlaanderen.be/v1/adresmatch";
    const apiKey = 'a56b9e4e-b8a2-4481-9db4-6f1b446ac7c3'
    let result = null
    let header = { 'Content-Type': 'application/json', 'x-api-key': apiKey }

    let rjs; 

    try {
        let r = await fetch( 
            `${arURI}?straatnaam=${straat?straat:''}&Gemeentenaam=${gemeente?gemeente:''}&huisnummer=${huisnr?huisnr:''}&Postcode=${pc?pc:''}`, 
              {method: 'GET', headers: header });
        rjs = await r.json();
      } 
    catch (error) {
          console.error(error);
          return {x: -1, y: -1, status: 'error', adres: null }
      }

    if( rjs.adresMatches && rjs.adresMatches.length > 0){
      let loc = rjs.adresMatches[0];
      let xy = loc.adresPositie ? loc.adresPositie.point.coordinates : [-1,-1]
      return {
        x: xy[0] , y: xy[1] ,
        status: loc.identificator ? loc.identificator.id : 'niet gevonden' ,
        adres: loc.volledigAdres ? loc.volledigAdres.geografischeNaam.spelling : null
      }    
    }
    else return {
      x: -1, y: -1, status: "adres niet gevonden", adres: null
    }
  }

async function geocode_adres(straat, huisnr, pc, gemeente){
    let q = `${straat != undefined? straat: ''} ${huisnr != undefined ? huisnr : ''} ${
                pc != undefined? ', '+ pc : ''} ${gemeente != undefined? gemeente : ''}`;
    const geopuntURI = "https://loc.geopunt.be/v4/Location";
    let r = await fetch( `${geopuntURI}?q=${encodeURIComponent(q)}`);
    let rjs = await r.json();

    if(rjs.LocationResult.length > 0){
      let loc = rjs.LocationResult[0];
      return {
        x: loc.Location.X_Lambert72, y: loc.Location.Y_Lambert72,
        status: loc.LocationType,
        adres: loc.FormattedAddress
      }
    }
    else return {
      x: -1, y: -1, status: "adres niet gevonden", adres: null
    }
  }

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

export {download, geocode_adres, geocode_ar, geocode_osm }