import { set } from 'ol/transform';
import papa from 'papaparse';

const lsTest = () => {
    var test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}
const hasStorage = lsTest()

export const getInitialRows = () => {
    if( !hasStorage) { return [] }

    let csvString = localStorage.getItem('csv');
    if (csvString){
       let csv = papa.parse(csvString, {header: true});
       let rows = csv.data.map((e, i) => ({ id: `row${i}`, selected: false, data: e }) );
       return rows
    }
    else { return [] }
}

export const saveRowState = rows => {
    try {
        let csvString = papa.unparse(rows, { delimiter: ";", })
        localStorage.setItem('csv', csvString);
    } catch (error) {
        console.error(["Cannot store csv, probably to large. ", error])
    } 
}

export const saveSettings = settings => {
    if(!settings)
    {
        let huisnr = document.getElementById('huisnr').value;
        let straat = document.getElementById('straatnaam').value;
        let pc = document.getElementById('pc').value;
        let gemeente = document.getElementById('gemeente').value;
        let geocoder = document.getElementById('geolocator').value;
        let crs = document.getElementById('crsSel').value;
        settings = {'huisnr':huisnr, 'straat': straat, 'pc': pc, 
                    'gemeente':gemeente, 'geocoder':geocoder, 'crs':crs }
    }
    localStorage.setItem('settings',  JSON.stringify(settings));
    return settings;
}

export const initSettings = () => {
    if( !hasStorage) { return {} }
    let settings = JSON.parse(localStorage.getItem('settings'));
    if(settings == null) { return {} }

    if( settings.huisnr) document.getElementById('huisnr').value = settings.huisnr ;
    if( settings.straat) document.getElementById('straatnaam').value = settings.straat;
    if( settings.pc) document.getElementById('pc').value = settings.pc;
    if( settings.gemeente) document.getElementById('gemeente').value = settings.gemeente;
    if( settings.geolocator) document.getElementById('geolocator').value = settings.geolocator;
    if( settings.crsSel) document.getElementById('crsSel').value = settings.crsSel;

    return settings;
}
