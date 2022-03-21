
async function geocode_adres(adres){
  const geopuntURI = "https://loc.geopunt.be/v4/Location";
  let r = await fetch( `${geopuntURI}?q=${adres}`);
  let rjs = await r.json();
  return rjs.LocationResult.length > 0 ? rjs.LocationResult[0] : null;
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

export {download, geocode_adres };