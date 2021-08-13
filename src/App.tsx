import React, { createRef } from 'react';
import { PDFDownloadLink, Image, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { LatLngExpression, DivIcon, Map, icon, Marker as LMarker } from 'leaflet';
import { saveAs } from 'file-saver';
import "leaflet/dist/leaflet.css"
import iconImage from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const LeafletImage = require("leaflet-image");
const DefaultIcon = icon({
  iconUrl: iconImage,
  shadowUrl: iconShadow,
  iconSize: [20, 30],
  iconAnchor: [0, 0]
});

export default class App extends React.Component<{}, { src: string }> {

  constructor(props: {} | Readonly<{}>) {
    super(props);
    LMarker.prototype.options.icon = DefaultIcon;
    this.generatePdf = this.generatePdf.bind(this);
  }

  map?: Map;

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





  position: LatLngExpression = [51.505, -0.09];
  myMap() {
    return (
      <MapContainer whenCreated={map => { this.map = map }} style={{ height: "512px", width: "512px" }} center={this.position} zoom={13}>
        <Marker icon={DefaultIcon} position={this.position}></Marker>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    )
  }


  async generatePdf(mapInstance?: Map) {
    return await 
    new Promise((resolve, reject) => (LeafletImage(mapInstance, async (_err: any, canvas: { toDataURL: () => string; }) => {
      let src = canvas.toDataURL();
      resolve(pdf(
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
    ))})));
  
  }



  render() {
      return(
      <div className = "App" >
        <div>
          {this.myMap()}
        </div>
        <button onClick={() => this.generatePdf(this.map)}>Click me!</button>
      </div>
    );
  }

}

