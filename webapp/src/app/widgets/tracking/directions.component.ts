import {AfterViewInit, Directive, ElementRef, OnDestroy, Renderer, ViewChild} from '@angular/core';
import {Message} from "../../shared/sdk/models/Message";
import {GoogleMapsAPIWrapper} from "@agm/core";
import {TrackingComponent} from "./tracking.component";

declare let google: any;

@Directive({
  selector: 'agm-directions'
})
export class DirectionsComponent implements AfterViewInit, OnDestroy {

  constructor(private trackingComponent: TrackingComponent, private _googleMapsAPIWrapper: GoogleMapsAPIWrapper) {
  }

  ngAfterViewInit() {
    this.buildDirections();
  }

  public buildDirections(){
    console.log("--------------------------------");
    console.log(this.trackingComponent.directionsDisplayStore);
    for(let i in this.trackingComponent.directionsDisplayStore) {
      this.trackingComponent.directionsDisplayStore[i].setMap(null);
    }
    this.trackingComponent.directionsDisplayStore = [];
    console.log("--------------------------------");


    let allLocalizedMessages: Message[] = this.trackingComponent.allLocalizedMessages;
    let messages: Message[] = [];
    let startCoord = allLocalizedMessages[0].geoloc[0];
    let endCoord = allLocalizedMessages[allLocalizedMessages.length - 1].geoloc[0];

    let routes = Math.floor(allLocalizedMessages.length / 23);
    console.log("routes", routes);
    for(let i=0; i<routes; i++){
      let waypoints = [];
      let color = '#'+Math.floor(Math.random()*16777215).toString(16);
      messages = allLocalizedMessages.slice(i*23,(i+1)*23);
      console.log("i*23", i*23);
      console.log("(i+1)*23-1", (i+1)*23);

      console.log("messagesCount", messages.length);
      console.log(messages);

      messages.forEach(message => {
        let coord = message.geoloc[0];
        let latLng = new google.maps.LatLng(coord.lat, coord.lng);
        waypoints.push({location: latLng, stopover:true});
      });

      console.log(waypoints);

      if(waypoints.length<=23){

        this._googleMapsAPIWrapper.getNativeMap().then((map) => {
          let directionsService = new google.maps.DirectionsService;
          let directionsDisplay = new google.maps.DirectionsRenderer;
          directionsDisplay.setMap(map);
          this.trackingComponent.directionsDisplayStore.push(directionsDisplay);
          directionsDisplay.setOptions({
            polylineOptions: {
              strokeWeight: 5,
              strokeOpacity: 0.7,
              strokeColor: '#08d7d4'
            },
            markerOptions: {
              visible: false
            }
          });
          directionsService.route({
            origin: {lat: startCoord.lat, lng: startCoord.lng},
            destination: {lat: endCoord.lat, lng: endCoord.lng},
            waypoints: waypoints,
            optimizeWaypoints: false,
            avoidHighways: false,
            travelMode: 'DRIVING'
          }, function (response, status) {
            if (status === 'OK') {
              console.log(response);
              directionsDisplay.setDirections(response);
            } else {
              console.log(status);
              /*window.alert('Directions request failed due to ' + status);*/
            }
          });
        }, err => {
          console.log('error', err);
        });

      }

    }
  }

  ngOnDestroy(){
    for(let i in this.trackingComponent.directionsDisplayStore) {
      this.trackingComponent.directionsDisplayStore[i].setMap(null);
    }
    this.trackingComponent.directionsDisplayStore = [];
  }

  private getcomputeDistance(latLngA: any, latLngB: any) {
    return (google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB) / 1000).toFixed(2);
  }
}
