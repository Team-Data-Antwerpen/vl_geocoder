//diverse tools
import {transform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  [
    "EPSG:31370",  //lambert 1972
    "+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 "+
    "+lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl "+
    "+towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs"
  ],
  [
    "EPSG:3812",  //lambert 2008
    "+proj=lcc +lat_1=49.83333333333334 +lat_2=51.16666666666666 +lat_0=50.797815 "+
    "+lon_0=4.359215833333333 +x_0=649328 +y_0=665262 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  ],
  [ 
    "EPSG:3857",// webmercator
    "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 "+
    "+k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
  ]
]);
register(proj4);

async function geocode_ant(straat, huisnr, pc=2000, district='Antwerpen', crs='EPSG:31370'){
  if( !straat || !huisnr ){
    return {x: -1, y: -1, status: 'straat en huisnummer mogen niet leeg zijn', adres: null }
  }
  const ant_URI = `https://locationpicker-app1-p.antwerpen.be/api/v2/addresses`;
  let rjs; 
  let q = `${ant_URI}?streetname=${encodeURIComponent(straat)}&housenumber=${encodeURIComponent(huisnr)}`;

  try {
     let r = await fetch(q);
     rjs = await r.json();
  } 
  catch (error) {
      console.error(error);
      return {x: -1, y: -1, status: 'error', adres: null }
  }

  if( rjs && rjs.length > 0){
    let loc = rjs.find( e => { 
        return  parseInt(e.municipalityPost.postCode) == parseInt(pc) || 
          e.municipalityPost.antwerpDistrict.toUpperCase() == district.toUpperCase().trim() }) 
     || rjs[0];
    let xy = transform([loc.addressPosition.lambert72.x , loc.addressPosition.lambert72.y], "EPSG:31370",  crs);
    let status = `${ant_URI}/${loc.addressRegId}`;

    return {
      x: xy[0] , y: xy[1] , status: status , adres: loc.label
    }    
  }    
  else return {
    x: -1, y: -1, status: "adres niet gevonden", adres: null
  }
}

async function geocode_osm(straat, huisnr, pc, gemeente, crs='EPSG:31370'){
    const osm_URI = `https://nominatim.openstreetmap.org/search`;
    let rjs; 
    let q = `${straat != undefined? straat: ''} ${huisnr != undefined ? huisnr : ''} ${
      pc != undefined? ', '+ pc : ''} ${gemeente != undefined? gemeente : ''}`;

    try {
       let r = await fetch( 
        `${osm_URI}?q=${encodeURIComponent(q)}&countrycodes=be&format=json` );
       rjs = await r.json();
    } 
    catch (error) {
        console.error(error);
        return {x: -1, y: -1, status: 'error', adres: null }
    }

    if( rjs && rjs.length > 0){
      let loc = rjs[0];
      let xy = transform([parseFloat(loc.lon), parseFloat(loc.lat)], "EPSG:4326",  crs);
      let status = `https://www.openstreetmap.org/${loc.osm_type}/${loc.osm_id}`;

      return {
        x: xy[0] , y: xy[1] , status: status , adres: loc.display_name
      }    
    }    
    else return {
      x: -1, y: -1, status: "adres niet gevonden", adres: null
    }
  }

async function geocode_ar(straat, huisnr, pc, gemeente, crs='EPSG:31370'){
    const arURI = "https://api.basisregisters.vlaanderen.be/v1/adresmatch";
    const apiKey = 'a56b9e4e-b8a2-4481-9db4-6f1b446ac7c3'
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
      let xy = [-1,-1]
      if(loc.adresPositie){
        xy = transform(loc.adresPositie.point.coordinates, 'EPSG:31370', crs)
      }
      //let xy = loc.adresPositie ? loc.adresPositie.point.coordinates : [-1,-1]
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

async function geocode_adres(straat, huisnr, pc, gemeente, crs='EPSG:31370'){
    let q = `${straat != undefined? straat: ''} ${huisnr != undefined ? huisnr : ''} ${
                pc != undefined? ', '+ pc : ''} ${gemeente != undefined? gemeente : ''}`;
    const geopuntURI = "https://loc.geopunt.be/v4/Location";
    let r = await fetch( `${geopuntURI}?q=${encodeURIComponent(q)}`);
    let rjs = await r.json();

    if(rjs.LocationResult.length > 0){
      let loc = rjs.LocationResult[0];

      let xy = transform([loc.Location.X_Lambert72, loc.Location.Y_Lambert72], 'EPSG:31370', crs)
      
      return {
        x: xy[0] , y: xy[1] ,
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

export {download, geocode_adres, geocode_ar, geocode_osm, geocode_ant }