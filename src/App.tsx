import { LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css";
import * as _ from 'lodash';
import React, { createRef } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import 'reflect-metadata';
import LocationMap, { mapKey } from './LocationMap';
import { ObjectForm } from './ObjectForm';
import { extraSpace, options, placeHolder, validate } from './ValidationDecorator';


type calculated = ((o: FormSchema) => string)

class FormSchema {
  @extraSpace
  Address = ""
  proximity : calculated = (o =>  `Located at ${o.location ?? ""}`)
  
  location? : LatLngExpression

  @validate(str => `$${str}`)
  salesPrice : number = 0;


  @options(["Closed", "Active", "Pending"])
  status = ""

  floorHeight = 0;

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

  @options([
    "Complete disaster",
    "Original but needs work",
    "Original but well kept",
    "Some updates/renovation",
    "Substantial remodel",
    "Rebuilt as new or new construction"
  ])
  condition = "";

  bedrooms = 0;
  halfBaths = 0;
  fullBaths = 0;
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




export default class App extends React.Component<{}, AppState> {



  async geocode(address: string){
      return fetch(encodeURI(`https://api.tomtom.com/search/2/geocode/${address}.json?key=${mapKey}`))
      .then(response => response.json())
      .then(response => response?.results ?? [{}])
      .then(results => results[0]?.position).then(
        (position?  :  {lat : number, lon: number}) => {
          if(position){
            let locationExpression = [position.lat, position.lon] as LatLngExpression
            return locationExpression
          }
        }
      )
  }

  getComps(){
    return this.comparableRefs.map(ref => ref?.current?.state?.location).filter(c => c) as LatLngExpression[];
  }

  constructor(props: {} | Readonly<{}>){
    super(props);
    this.geocode = this.geocode.bind(this);
  }


  comparableRefs = _.times(3, () => createRef<ObjectForm<FormSchema>>());


  render() {
    return (
      <div className="App">
        <div>
          count: {this.comparableRefs.length}
          <Container fluid>
          <Row>
            {this.comparableRefs.map(c => (
              <Col className="p-0" xs="12" lg="4">
                <Button className="w-100" disabled>Comparable 1</Button>
                <ObjectForm ref={c} defaultValues = {new FormSchema()} onLoseFocus = {{Address: ((address, form) => {
                  this.geocode(address).then(p => {
                    if(p != form.state.location){
                      form.setState({location: p})
                      this.forceUpdate()
                    }
                  })
                })}}></ObjectForm>
              </Col>
            ))}
          </Row>
          </Container>
          <Container className="justify-content-center">
            {this.getComps().length ? <LocationMap positions = {this.getComps()}></LocationMap> : ""}
          </Container>
        </div>
      </div>
    );
  }

}

