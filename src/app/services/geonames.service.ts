import { Injectable } from '@angular/core';
import Geonames from 'geonames.js'
import Swal from 'sweetalert2'
import { HttpClient } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class GeonamesService {
	pos = 0
	neg = 0
	neu = 0
	pl = []
	constructor(private http:HttpClient) { }

	getLatLon(places:any[], model:string){
		
		const geonames = Geonames({
			username: 'myusername',
			lan: model,
			encoding: 'JSON'
		  });
		try{
			places.map((place) => {				
				geonames.search({ q: place.name }).then(response => {
					if (!response.status) {
						for (let i = 0; i < response.geonames.length; i++){
							if (place.name === response.geonames[i].name){
								place.lat = response.geonames[i].lat
								place.lng = response.geonames[i].lng
								place.country = response.geonames[i].countryName
								
								this.pl.push(place)
								this.pos = this.pl.filter(place => place.emotions === "Positive").length
								this.neg = this.pl.filter(place => place.emotions === "Negative").length
								this.neu = this.pl.filter(place => place.emotions === "Neutral").length	
								break
							}
						}
						
					}
					else {
						Swal.fire(
							{ 
								toast: true, 
								// position: 'center', 
								showConfirmButton: false, 
								timer: 2000, 
								title: response.status.message, 
								// text: 'Text is so large', 
								icon: 'error', 
							});			
						// this.text.nativeElement.focus()
					}
				})
				
				// if (place.lat != 0) pl.push(place)
				
				
					
			})
			
		}catch(err){
			console.log(err);
			
		}
				
	}

	getCities(){
		return this.http.get('assets/cities.json')
	}
}
