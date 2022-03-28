
import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';

import {ScaleLine} from 'ol/control';
import TileLayer from 'ol/layer/Tile';

import WMTS from 'ol/source/WMTS';
import OSM from 'ol/source/OSM'
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {getTopLeft, getWidth} from 'ol/extent';
import {get as getProjection, transform} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';

const webMercator = getProjection('EPSG:3857');
const webmercatorExtent = webMercator.getExtent();
const size = getWidth(webmercatorExtent) / 256;
const resolutions = new Array(21);
const matrixIds = new Array(21);
for (let z = 0; z < 21; ++z) {
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
proj4.defs("EPSG:31370","+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 "+
    "+lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl "+
    "+towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs");
register(proj4);

//initial background
const grb =  new WMTS({
    url: 'https://tile.informatievlaanderen.be/ws/raadpleegdiensten/wmts',
    attributions: ["Informatie Vlaanderen"],
    layer: 'grb_bsk_grijs',
    matrixSet: 'GoogleMapsVL',
    format: 'image/png',
    projection: webMercator,
    tileGrid: new WMTSTileGrid({
      origin: getTopLeft(webmercatorExtent),
      resolutions: resolutions,
      matrixIds: matrixIds,
    }),
    style: '',
    wrapX: true,
    });

const osm = new OSM()

const background = new TileLayer({
        source: osm
      });

//initial View 
const viewer = new View({
        center: [464468, 6612547],
        zoom: 9, maxZoom: 21, minZoom: 7,
        extent: [206631, 6296658, 748135, 6805302]
    });

const initMap = () => {
    let map = new Map({
        layers: [background],
        view: viewer
    });
    map.addControl(new ScaleLine());
    map.addOverlay(marker);

    return map;
}

const merc2lb72 = (coord) => transform(coord, 'EPSG:3857', 'EPSG:31370');
const lb72toMerc = (coord) => transform(coord,'EPSG:31370', 'EPSG:3857');

const marker = new Overlay({
    position: undefined,
    positioning: 'center-center',
    stopEvent: false,
});
  
export {initMap, background, viewer, merc2lb72, lb72toMerc, marker};