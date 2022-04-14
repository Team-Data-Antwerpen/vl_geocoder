//diverse tools

async function geocode_ar(straat, huisnr, pc, gemeente){
  const arURI = "https://api.basisregisters.vlaanderen.be/v1/adresmatch";
  const apiKey = 'a56b9e4e-b8a2-4481-9db4-6f1b446ac7c3'
  let result = null
  let header = { 'Content-Type': 'application/json', 'x-api-key': apiKey }

  let r = await fetch( 
       `${arURI}?straatnaam=${straat}&Gemeentenaam=${gemeente}&huisnummer=${huisnr}&Postcode=${pc}`, 
        {method: 'GET', headers: header });
  let rjs = await r.json();

  if( rjs.adresMatches && rjs.adresMatches.length > 0){
    let loc = rjs.adresMatches[0];
    let xy = loc.adresPositie ? loc.adresPositie.point.coordinates : [-1,-1]
    result = {
      x: xy[0] , y: xy[1] ,
      status: loc.identificator ? loc.identificator.id : 'niet gevonden' ,
      adres: loc.volledigAdres ? loc.volledigAdres.geografischeNaam.spelling : null
    }    
  }
  return result
}

async function geocode_adres(straat, huisnr, pc, gemeente){
  let q = `${straat != undefined? straat: ''} ${huisnr != undefined ? huisnr : ''} ${
              pc != undefined? ', '+ pc : ''} ${gemeente != undefined? gemeente : ''}`;
  const geopuntURI = "https://loc.geopunt.be/v4/Location";
  let r = await fetch( `${geopuntURI}?q=${q}`);
  let rjs = await r.json();
  let result = null;
  if(rjs.LocationResult.length > 0){
    let loc = rjs.LocationResult[0];
    result = {
      x: loc.Location.X_Lambert72, y: loc.Location.Y_Lambert72,
      status: loc.LocationType,
      adres: loc.FormattedAddress
    }
  }
  return result
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

export {download, geocode_adres, geocode_ar };