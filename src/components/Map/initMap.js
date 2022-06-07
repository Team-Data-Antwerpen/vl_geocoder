import Map from 'ol/Map';
import View from 'ol/View';
import Overlay from 'ol/Overlay';

import {ScaleLine} from 'ol/control';
import TileLayer from 'ol/layer/Tile';

import WMTS from 'ol/source/WMTS';
import OSM from 'ol/source/OSM'
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {getTopLeft, getWidth} from 'ol/extent';
import {get as getProjection} from 'ol/proj';

const webMercator = getProjection('EPSG:3857');
const webmercatorExtent = webMercator.getExtent();
const size = getWidth(webmercatorExtent) / 256;
const resolutions = new Array(21);
const matrixIds = new Array(21);
for (let z = 0; z < 21; ++z) {
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}

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
        center: [490488,6649695],
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

const marker = new Overlay({
    position: undefined,
    positioning: 'center-center',
    stopEvent: false,
});
  
export {initMap, background, viewer, marker};