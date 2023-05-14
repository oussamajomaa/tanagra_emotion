# Add bootstrap

ng add @ng-bootstrap/ng-bootstrap

## Install leaflet

npm install leaflet
npm install @types/leaflet
npm install @asymmetrik/ngx-leaflet

** Import the leaflet stylesheet 
in your angular.json import:
"styles": [
               .....
              "./node_modules/leaflet/dist/leaflet.css"
            ],

## markercluster
npm install leaflet.markercluster
npm install @asymmetrik/ngx-leaflet-markercluster
npm install @types/leaflet.markercluster

in your app.module.ts, add: 
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster'; 

** Import the leaflet.markercluster stylesheet 
in your angular.json import:
"styles": [
               .....
              "node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css"
            ],




## npm i sweetalert2