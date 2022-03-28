import React, { Component } from "react";
import {initMap, merc2lb72, marker} from './initMap';
//css
import 'ol/ol.css'; 
import './Map.css';

class Map extends Component {
    constructor(props) {
        super(props);
        this.state = {map: initMap() };

        this.state.map.on('singleclick', e => {
            if(props.onMapClick){
               marker.setPosition(e.coordinate);
               let pt =  merc2lb72(e.coordinate);  
               props.onMapClick([Math.round(pt[0]),  Math.round(pt[1])]);
            }
          })
    }

    componentDidMount() {
       let target = document.getElementById("olmap");
       this.state.map.setTarget(target);
       marker.setElement( document.getElementById('marker') );
     }

    render() { 
        return (
              <div id="olmap" style={{width:"100%", height:"400px"}}   >
                  <div id="marker" title="Marker"></div>
              </div>
            )
    }
}

export default Map; 