import { Document, Image, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import DomToImage from 'dom-to-image';
import { saveAs } from 'file-saver';
import * as L from 'leaflet';
import { icon, LatLngExpression, Map } from 'leaflet';
import iconImage from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet/dist/leaflet.css";
import React, { MutableRefObject } from "react";
import { FeatureGroup, MapContainer, Marker, TileLayer } from 'react-leaflet';


const DefaultIcon = icon({
    iconUrl: iconImage,
    shadowUrl: iconShadow,
    iconSize: [20, 30],
    iconAnchor: [10, 30]
});

type LocationProps = {positions? : L.LatLng[]}

export const mapKey = "sPsOlbxOfFmSvUCwsMZagvwlUqAVEj5i";

export default class LocationMap extends React.Component<LocationProps> {
    map?: Map;
    groupRef :MutableRefObject<L.FeatureGroup | null>;
    divRef = React.createRef<HTMLDivElement>()
    
    constructor(props : LocationProps){
        super(props);
        console.log(iconImage)
        this.groupRef = React.createRef()

    }


    createMapImage() {
        const width = 600;
        const height = 400;

        return new Promise<string>((resolve, reject) => {
            if(this.divRef.current)
                DomToImage.toPng(this.divRef.current, {width, height}).then(dataUrl => resolve(dataUrl))
            else
                reject("Couldn't find map")
        });

    };

    // Create styles
    styles = StyleSheet.create({
        page: {
            flexDirection: 'row',
            backgroundColor: '#E4E4E4'
        },
        section: {
            border: '1px solid #000',
            margin: 10,
            padding: 10,
            flexGrow: 1
        }
    });




    componentDidUpdate(prevProps: LocationProps) {
        console.log("Updating map!")
        if(this?.props?.positions && this.props != prevProps){
            let newBounds = (new L.FeatureGroup(this.props.positions?.map(pos => new L.Marker(pos)))).getBounds();
            this.map?.fitBounds(newBounds, {padding: [10,10]});
        }
    }

    componentDidMount(){
        console.log("Remounting map!")
    }


    useEffect(){
        
    }

    myMap() {
        return (
            <div ref={this.divRef}>
            <MapContainer zoomControl = {false} whenCreated={map => { this.map = map }} style={{ height: "512px", width: "512px" }} center={(this.props?.positions ?? [L.latLng(0,0)])[0]} maxZoom ={15} zoom={13}>
                <FeatureGroup ref={this.groupRef}>
                    
                    {(this.props?.positions ?? []).map((position, i) => 
                        <Marker key={i} icon={DefaultIcon} position={position}></Marker>
                    )}
                </FeatureGroup>
                <TileLayer
                    maxZoom={22}
                    attribution='<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2021 TomTom.</a> '
                    subdomains='abcd'
                    url={`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapKey}`}
                />
            </MapContainer>
            </div>
        )
    }


    generateImage(): Promise<string> {
        return this.createMapImage();
//        if(this.map)
//            this.map.options.preferCanvas = true;
//        console.log("Creating image")
//        return new Promise((resolve, reject) => {
//            console.log("A")
//            LeafletImage(this.map, async (_err: any, canvas: { toDataURL: () => string; }) => {
//                
//                resolve(canvas.toDataURL());
//            });
//        })
    }


 

    render() {
        return this.myMap()

    }

}