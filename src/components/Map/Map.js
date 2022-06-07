import React, { Component } from "react";
import {initMap, viewer, marker} from './initMap';

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
               props.onMapClick( e.coordinate );
            }
          })
    }

    componentDidMount() {
       let target = document.getElementById("olmap");
       this.state.map.setTarget(target);
       viewer.setCenter( this.props.center );
       marker.setElement( document.getElementById('marker') );
       marker.setPosition( this.props.center );
     }

     componentDidUpdate(){
        marker.setPosition( this.props.center );
     }

    render() { 
        return (
              <div id="olmap" style={{width:"100%", height:"400px"}}   >
                  <div id="marker" title="Marker"></div>
              </div>
            )
    }
}

export {Map}; 