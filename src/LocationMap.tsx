import { Document, Image, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import * as L from 'leaflet';
import { icon, LatLngExpression, Map } from 'leaflet';
import iconImage from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet/dist/leaflet.css";
import React, { MutableRefObject } from "react";
import { FeatureGroup, MapContainer, Marker, TileLayer } from 'react-leaflet';


const LeafletImage = require("leaflet-image");
const DefaultIcon = icon({
    iconUrl: iconImage,
    shadowUrl: iconShadow,
    iconSize: [20, 30],
    iconAnchor: [10, 30]
});

type LocationProps = {positions? : LatLngExpression[]}

export const mapKey = "sPsOlbxOfFmSvUCwsMZagvwlUqAVEj5i";

export default class LocationMap extends React.Component<LocationProps> {
    map?: Map;
    groupRef :MutableRefObject<L.FeatureGroup | null>;

    constructor(props : LocationProps){
        super(props);
        this.groupRef = React.createRef()

    }

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

    componentDidMount(){
        this.map?.setView((this.props.positions ?? [[0,0]])[0], 13)
    }


    componentDidUpdate(prevProps: LocationProps) {
        if(this?.props?.positions && this.props != prevProps){
            let newBounds = (new L.FeatureGroup(this.props.positions?.map(pos => new L.Marker(pos)))).getBounds();
            this.map?.fitBounds(newBounds, {padding: [10,10]});
        }
    }


    useEffect(){
        
    }

    myMap() {
        return (
            <MapContainer whenCreated={map => { this.map = map }} style={{ height: "512px", width: "512px" }} center={(this.props?.positions?? [[0,0]])[0]} maxZoom ={15} zoom={13}>
                <FeatureGroup ref={this.groupRef}>
                    {(this.props?.positions ?? []).map(position => 
                        <Marker icon={DefaultIcon} position={position}></Marker>
                    )}
                </FeatureGroup>
                <TileLayer
                    maxZoom={22}
                    attribution='<a href="https://tomtom.com" target="_blank">&copy;  1992 - 2021 TomTom.</a> '
                    subdomains='abcd'
                    url={`https://{s}.api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=${mapKey}`}
                />
            </MapContainer>
        )
    }


    generateImage(mapInstance: Map): Promise<string> {
        console.log("Creating image")
        return new Promise((resolve, reject) => {
            console.log("A")
            LeafletImage(mapInstance, async (_err: any, canvas: { toDataURL: () => string; }) => {
                console.log("B");
                console.log(canvas.toDataURL())
                resolve(canvas.toDataURL());
            });
        })
    }

    async generatePdf(mapInstance?: Map) {
        if (!mapInstance)
            return;
        console.log("Generating pdf")
        return this.generateImage(mapInstance).then(src => {
            console.log("generated image")
            console.log(src);
            return Promise.resolve(
                <Document>
                    <Page size="A4" style={this.styles.page}>
                        <View style={this.styles.section}>
                            <Text>Section #1</Text>
                        </View>
                        <View style={this.styles.section}>
                            <Text>Section #2</Text>
                        </View>
                        <Image src={src}></Image>
                    </Page>
                    <Page size="A4" style={this.styles.page}>
                        <View style={this.styles.section}>
                            <Text>Section #1</Text>
                        </View>
                        <View style={this.styles.section}>
                            <Text>Section #2</Text>
                        </View>
                    </Page>
                </Document>
            )
        })

    }

    async downloadPdf(mapInstance: Map) {
        let mapPdf = await this.generatePdf(mapInstance);
        pdf(mapPdf).toBlob().then(blob => {
            saveAs(blob, "out.pdf")
        })
    }

    render() {
        return this.myMap()

    }

}