import { ImageOverlay, LatLng, LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as _ from 'lodash';
import React, { createRef, MutableRefObject, RefObject } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import 'reflect-metadata';
import LocationMap, { mapKey } from './LocationMap';
import {  ObjectForm } from './ObjectForm';
import { extraSpace, options, placeHolder, validate } from './ValidationDecorator';
import { pdf, Document, Image, Text, View, StyleSheet, Page } from '@react-pdf/renderer'
import { create } from 'lodash';
import { saveAs } from 'file-saver'


type calculated = ((o: FormSchema) => string)

class FormSchema {
  @extraSpace
  Address = ""
  proximity: calculated = (o => (o.location && o.comparedTo) ? `${(o.location.distanceTo(o.comparedTo) / 1609.34).toFixed(1)} miles` : "")

  location?: LatLng
  comparedTo?: LatLng

  @validate(str => `$${str}`)
  salesPrice: number = 0;

  dataSource: string = ""

  siteSize: string = ""

  @options(["Closed", "Active", "Pending"])
  status = ""


  @options([
    "Water",
    "Wood",
    "Park",
    "Golf Course",
    "City/Skyline",
    "Mountain",
    "Residential",
    "City Street",
    "Industrial",
    "Power Lines",
    "Limited Sight",
    "Other"])
  view = "";


  floorHeight = 0;

  @validate(str => str.substr(0,4))
  yearBuilt = 0;
  age : calculated = o => {
    let currentYear = new Date().getFullYear();
    if(o.yearBuilt >= 1000 && o.yearBuilt <= currentYear)
      return `${currentYear - o.yearBuilt} years`;
    else
      return "";
  }

  @options([
    "Complete disaster",
    "Original but needs work",
    "Original but well kept",
    "Some updates/renovation",
    "Substantial remodel",
    "Rebuilt as new or new construction"
  ])
  condition = "";

  @options(_.times(12, i => `${i}` ))
  bedrooms = "";
  @options(_.times(12, i => `${i}` ))
  halfBaths = "";
  @options(_.times(12, i => `${i}` ))
  fullBaths = "";
  livingAreaUnderAir = 0;

  @options([
    "Yes",
    "No",
    "Partial",
  ])
  basement = "";

  @placeHolder("Garage/Carport")
  @options([
    "No Car Storage",
    "Attached Garage",
    "Detached Garage",
    "Built-in Garage",
    "Carport",
    "Driveway",
  ])
  garage = "";

  @options([
    "Pool",
    "Patio",
    "Porch",
    "Deck",
  ])
  @placeHolder("Pool/Patio/Porch/Deck")
  pool = "";

  @extraSpace
  extraInfo = "";
}

type AppState = {};




export const styleSheet = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4'
  },
  column: {
    width: "120pt",
    flexDirection: 'column',
    fontSize: 10,
    display: 'flex',
    alignItems: 'flex-start',
    border: '1px solid #000',
  },
  row: {
    height: "20pt",
    flexDirection: 'row',
    width: "100%",
    fontSize: 10,
    display: 'flex',
    alignItems: 'flex-start',
    border: '1px solid #000',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
})

export default class App extends React.Component<{}, AppState> {



  async geocode(address: string) {
    return fetch(encodeURI(`https://api.tomtom.com/search/2/geocode/${address}.json?key=${mapKey}`))
      .then(response => response.json())
      .then(response => response?.results ?? [{}])
      .then(results => results[0]?.position).then(
        (position?: { lat: number, lon: number }) => {
          if (position) {
            return new LatLng(position.lat, position.lon)
          }
        }
      )
  }

  getComps() {
    return this.comparableRefs.map(ref => ref?.current?.state?.location).filter(c => c) as LatLng[];
  }

  getPoints() {
    let subjectLocaton = this.subjectRef?.current?.state?.location;
    return subjectLocaton ? this.getComps().concat([subjectLocaton]) : this.getComps();
  }

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.geocode = this.geocode.bind(this);

    this.savePdf = this.savePdf.bind(this);
  }

  savePdf() {
    console.log("Saving pdf")
    console.log(this.mapRef?.current)
    let mapImage = this.mapRef?.current?.generateImage().then(src => <Image source={src}></Image>) ?? new Promise((resolve, reject) => { resolve(<Text>Couldn't generate map</Text>) })


    mapImage.then(image => {

      let pdfDoc = (<Document>
        <Page size="A4" style={styleSheet.page}>
            <View style={{flexDirection:"row"}}>
              <View style={styleSheet.column}>
                <View style={styleSheet.row}></View>
                {this.subjectRef?.current?.exportPdfLabels() ?? <View></View>}
              </View>
              <View style={styleSheet.column}>
              <View style={styleSheet.row}><Text>Subject</Text></View>
                {this.subjectRef?.current?.exportAsPdf() ?? <View></View>}
              </View>
              {this.comparableRefs.map((c, i) =>
                <View style={styleSheet.column} key={i}>
                  <View style={styleSheet.row}><Text>Comparable {i + 1}</Text></View>
                  {c.current?.exportAsPdf() ?? <View></View>}
                </View>
              )}
            </View>
          <View>
              {image}
            </View>
        </Page>

      </Document>)
      console.log(pdfDoc.toString())
      pdf(pdfDoc).toBlob().then(blob => {
        saveAs(blob, "out.pdf")
      })

    });





  }

  subjectRef = createRef<ObjectForm<FormSchema>>();
  comparableRefs = _.times(3, () => createRef<ObjectForm<FormSchema>>());
  mapRef  = createRef<LocationMap>()



  render() {
    console.log("Refs:", this.subjectRef, this.comparableRefs, this.mapRef, this.subjectRef)
    return (
      <div className="App">
        <div>
          <Container fluid>
            <Row>

              <Col className="p-0" xl="2">
                <Button className="w-100" disabled>Attribute</Button>
                <ObjectForm defaultValues={new FormSchema()} justLabels></ObjectForm>
              </Col>
              <Col className="p-0" >
                <Button className="w-100" disabled> Location </Button>
                <ObjectForm ref={this.subjectRef} defaultValues={new FormSchema()} onLoseFocus={
                  {
                    Address: ((address, form) => {
                      this.geocode(address).then(p => {
                        form.setState({location : p })
                        this.comparableRefs.forEach(ref => {
                          ref.current?.setState({ comparedTo: p })
                        })
                        this.forceUpdate();
                      })
                    })
                  }
                }>

                </ObjectForm>
              </Col>

              {this.comparableRefs.map((c, i) => (
                <Col key={i} className="p-0">
                  <Button className="w-100" disabled>Comparable {i + 1}</Button>
                  <ObjectForm ref={c} defaultValues={new FormSchema()} onLoseFocus={{
                    Address: ((address, form) => {
                      this.geocode(address).then(p => {
                        if (p != form.state.location) {
                          form.setState({ location: p })
                          this.forceUpdate()
                        }
                      })
                    })
                  }}></ObjectForm>
                </Col>
              ))}
            </Row>
          </Container>
          <Button onClick={this.savePdf}>Download</Button>
          <Container className="justify-content-center">
            {this.getPoints().length ? <LocationMap ref={this.mapRef} positions={this.getPoints()}></LocationMap> : ""}
          </Container>
        </div>
      </div>
    );
  }

}

