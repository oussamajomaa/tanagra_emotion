import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'
import * as L from 'leaflet'
import { GeonamesService } from '../services/geonames.service';
// import "leaflet.markercluster";

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent {


	@ViewChild("text") text: ElementRef;
	places: any = []
	map: any
	mainLayer: any
	bounds: any
	words = 0
	wordCount: any;
	cluster: any
	markers: any = []
	emotion: string
	model = "en"
	spinner = true
	loading = true
	selectedPlace = []
	pl = []
	pos = 0
	neg = 0
	neu = 0
	// url = 'http://127.0.0.1:3333'
	geonames = []
	url = "https://osmjom.site:3333"
	constructor(private http: HttpClient, public geonameService: GeonamesService) {
		// this.loading = false
		// this.http.get(`${this.url}/db`).subscribe((res: any) => {
		// 	this.geonames = res
		// 	this.loading = true
		// })
	}

	ngAfterViewInit(): void {
		this.createMap()
		this.text.nativeElement.focus()
	}

	createMap(lat = 0, lng = 0, z = 2) {

		this.map = L.map('map').setView([lat, lng], z);
		this.mainLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 1,
			maxZoom: 20,
			attribution: 'OSM'
		});
		this.mainLayer.addTo(this.map);
	}

	getCities() {
		// let cities = []
		// this.geonameService.getCities().subscribe((res: any) => {
		// 	cities = res.filter(r => r.name === 'New York')
		// 	console.log(cities);

		// })

	}

	getDb() {
		// this.http.get(`${this.url}/db`).subscribe((res: any) => {

			// console.log(res.filter(r => r.name === "Eiffel"))
			// this.geonames.map(place => {
			// 	let alternatives = place.alternatenames.split(',')
			// 	if (alternatives.find(name => name === "Damascus")) {
			// 		console.log(place);
			// 	}
			// })

			// res.map(r => console.log(r))
		// })

	}
	
	// getCoord(location:{}, places:[]){
		
	// }

	// Send text to spacy 
	sendText() {
		this.places = []
		this.pl = []
		this.geonameService.pl = []
		this.selectedPlace = []
		this.emotion = null
		this.markers.map(marker => this.map.removeLayer(marker))
		if (this.cluster) this.cluster.clearLayers()

		if (this.words <= 1000) {

			// Active spinner
			this.spinner = false
			const text = this.text.nativeElement.value
			this.http.post(`${this.url}/text`, JSON.stringify(text), { params: { model: this.model } })
				.subscribe((res: any) => {

					this.places = res
					// this.getLatLon()
					

					this.geonameService.getLatLon(res, this.model)
					this.pl = this.geonameService.pl

					this.getDb()
					
					this.neg = this.geonameService.neg
					this.neu = this.geonameService.neu
					this.pos = this.geonameService.pos

					this.spinner = true
				}
					, (error) => {
						this.spinner = true
						Swal.fire(
							{
								toast: true,
								// position: 'center', 
								showConfirmButton: true,
								// timer: 2000, 
								title: 'Max retries exceeded !',
								// text: 'Text is so large', 
								// icon: 'error', 
							});
					}
				)
		}
		else {
			Swal.fire(
				{
					toast: true,
					// position: 'center', 
					showConfirmButton: false,
					timer: 2000,
					title: 'Text is so large !',
					// text: 'Text is so large', 
					icon: 'warning',
				});
			this.text.nativeElement.focus()
		}
	}




	// clusters: L.MarkerClusterGroup

	getMarkers(emotion: string, listOfPlace: any[]) {
		// Filter places according to emotion
		let places = []

		if (emotion != "all") places = listOfPlace.filter(place => place.emotions === emotion)
		else places = listOfPlace


		this.markers = []
		this.cluster = L.markerClusterGroup()
		// Create marker for each place with icon color
		places.map(place => {
			let marker = L.marker([place.lat, place.lng],
				{
					icon: new L.Icon({
						iconUrl: `assets/${place.emotions}.png`,
						iconSize: [20, 25],
					})
				})
			marker.bindPopup(`Name: ${place.name}<br>Lat: ${place.lat}<br>Lon: ${place.lng}<br>Emotion: ${place.emotions}`)
			marker.on('mouseover', () => marker.openPopup())
			marker.on('mouseout', () => marker.closePopup())
			this.markers.push(marker)
		})
		if (listOfPlace.length === 0) this.map.setView([0, 0], 2)

		return this.markers
	}

	// Display places on the map
	displayOnMap(emotion: string) {
		// Remove old layers and cluster
		this.markers.map(marker => this.map.removeLayer(marker))
		if (this.cluster) this.cluster.clearLayers()

		// Filter places according to emotion
		let places = this.getMarkers(emotion, this.selectedPlace)

		// Add marker place to cluster
		places.map(marker => this.cluster.addLayer(marker))

		// Add cluster to map
		this.map.addLayer(this.cluster)
		this.fitOnMap()
	}


	checkLocation(e, place) {
		this.emotion = null
		if (e.target.checked) {
			this.selectedPlace.push(place)
		}
		else {
			this.selectedPlace = this.selectedPlace.filter(item => item.name !== place.name)
		}
		this.displayOnMap('all')
	}

	// Display places on the map
	displayAllOnMap(emotion: string) {
		this.emotion = emotion
		// Remove all check mark
		const checkPlaces = document.querySelectorAll(".check-place") as NodeListOf<HTMLInputElement>;
		checkPlaces.forEach(place => place.checked = false)

		const checkPositive = document.querySelectorAll(".check-Positive") as NodeListOf<HTMLInputElement>;
		const checkNegative = document.querySelectorAll(".check-Negative") as NodeListOf<HTMLInputElement>;
		const checkNeutral = document.querySelectorAll(".check-Neutral") as NodeListOf<HTMLInputElement>;

		this.selectedPlace = this.pl.filter(place => place.emotions === emotion)
		// Check input according to selected emotion
		switch (emotion) {
			case 'Positive':
				checkPositive.forEach(place => place.checked = true)
				checkNegative.forEach(place => place.checked = false)
				checkNeutral.forEach(place => place.checked = false)
				break
			case 'Negative':
				checkPositive.forEach(place => place.checked = false)
				checkNegative.forEach(place => place.checked = true)
				checkNeutral.forEach(place => place.checked = false)
				break
			case 'Neutral':
				checkPositive.forEach(place => place.checked = false)
				checkNegative.forEach(place => place.checked = false)
				checkNeutral.forEach(place => place.checked = true)
				break
			default:
				checkPlaces.forEach(place => place.checked = true)
				this.selectedPlace = this.pl
		}

		// Remove old layers and cluster
		this.markers.map(marker => this.map.removeLayer(marker))
		if (this.cluster) this.cluster.clearLayers()

		// Filter places according to emotion
		let places = this.getMarkers(emotion, this.pl)

		// Add marker place to cluster
		places.map(marker => this.cluster.addLayer(marker))

		// Add cluster to map
		this.map.addLayer(this.cluster)
		this.fitOnMap()
	}

	// Fit markers on map
	fitOnMap() {
		if (this.markers.length > 1) {
			this.bounds = L.featureGroup(this.markers);
			this.map.fitBounds(this.bounds.getBounds(), { padding: [0, 0] })
		}
		if (this.markers.length == 1) {
			this.map.setView([this.markers[0]._latlng.lat, this.markers[0]._latlng.lng], 8);
		}
	}

	// Count words
	wordCounter() {
		this.wordCount = this.text ? this.text.nativeElement.value.split(/\s+/) : 0;
		this.words = this.wordCount ? this.wordCount.length : 0;
		if (this.wordCount.length == 1 && !this.wordCount[0]) this.words = 0

	}

	// Clear text and layers and reinit map
	resetText() {
		this.places = []
		this.pl = []
		this.geonameService.pl = []
		this.words = 0
		this.spinner = true
		this.text.nativeElement.value = ""
		this.text.nativeElement.focus()
		this.markers.map(marker => this.map.removeLayer(marker))
		if (this.cluster) this.cluster.clearLayers()
		this.map.setView([0, 0], 2)
	}

	// Select language model
	handleChange(e) {
		this.model = e.target.value
	}

	// getLatLon(){

	// 	const geonames = Geonames({
	// 		username: 'myusername',
	// 		lan: this.model,
	// 		encoding: 'JSON'
	// 	  });
	// 	try{
	// 		this.places.map((place) => {				
	// 			geonames.search({ q: place.name }).then(response => {
	// 				if (!response.status) {
	// 					for (let i = 0; i < response.geonames.length; i++){
	// 						if (place.name === response.geonames[i].name){
	// 							place.lat = response.geonames[0].lat
	// 							place.lng = response.geonames[0].lng
	// 							this.pl.push(place)
	// 							this.pos = this.pl.filter(place => place.emotions === "Positive").length
	// 							this.neg = this.pl.filter(place => place.emotions === "Negative").length
	// 							this.neu = this.pl.filter(place => place.emotions === "Neutral").length	
	// 							break
	// 						}
	// 					}

	// 				}
	// 				else {
	// 					Swal.fire(
	// 						{ 
	// 							toast: true, 
	// 							// position: 'center', 
	// 							showConfirmButton: false, 
	// 							timer: 2000, 
	// 							title: response.status.message, 
	// 							// text: 'Text is so large', 
	// 							icon: 'error', 
	// 						});			
	// 					this.text.nativeElement.focus()
	// 				}
	// 			})

	// 			// if (place.lat != 0) pl.push(place)



	// 		})

	// 	}catch(err){
	// 		console.log(err);

	// 	}


	// }

	// this.places.map(place => {
	// 	this.geonames.map(location => {
	// 		let alternatives = location.alternatenames.split(',')
	// 		if (alternatives.find(alternative => alternative === place.name)){
	// 			let item = {
	// 				name:place.name,
	// 				country: location.country_code,
	// 				lat: location.latitude,
	// 				lng: location.longitude,
	// 				emotions:place.emotions
	// 			}
	// 			this.pl.push(item)
	// 			this.pos = this.pl.filter(place => place.emotions === "Positive").length
	// 			this.neg = this.pl.filter(place => place.emotions === "Negative").length
	// 			this.neu = this.pl.filter(place => place.emotions === "Neutral").length	
	// 		}
	// 	})
}

