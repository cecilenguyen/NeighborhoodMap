// global variables
var map;

function AppViewModel() {

	var self = this;

	// put marker info in infowindow
	this.populateInfoWindow = function(marker, infowindow){
			
			if(infowindow.marker != marker){
				infowindow.marker = marker;
				infowindow.setContent('<div>' + marker.title + '</div>');
				infowindow.open(map, marker);
				// make sure marker property cleared if infowindow is closed
				infowindow.addListener('closeclick', function(){
					infowindow = null;
				});
			}

			
			// foursquare api
            clientID = "PVY15A1THVOBNAJETF2AZDRFGIY5YJKARWIAU2YWOIS2UQWH";
            clientSecret = "XPETPWZCF0P45QLZOYUBOY5W55SPP1JYSJSEL00YKK0PTON2";
            var url = 'https://api.foursquare.com/v2/venues/' + marker.venue + '?client_id='+ clientID +'&client_secret=' + clientSecret + '&v=20171204'
			$.getJSON(url , function(data) {
			  var res = data.response.venue;
			  var name = res.name;
			  var address = res.location.address;
			  var city = res.location.city;
			  var state = res.location.state;
			  var zipcode = res.location.postalCode;

			  foursquare = '<div><p><b>' + name + '</b></p>' +
			  '<p>Address: ' + address + '</p>' +
			  '<p>' + city + ', ' + state + '</p>' +
			  '<p>' + zipcode + '</p></div>'

			  // Use streetview service to get the closest streetview image within
	          // 50 meters of the markers position
	          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
			})
			  .fail(function() {
			    alert( "Could not get venue information from Foursquare. Please refresh and try again." );
			  });

			// street view
			var streetViewService = new google.maps.StreetViewService();
	          var radius = 50;
	          // In case the status is OK, which means the pano was found, compute the
	          // position of the streetview image, then calculate the heading, then get a
	          // panorama from that and set the options
	          function getStreetView(data, status) {
	            if (status == google.maps.StreetViewStatus.OK) {
	              var nearStreetViewLocation = data.location.latLng;
	              var heading = google.maps.geometry.spherical.computeHeading(
	                nearStreetViewLocation, marker.position);
	                infowindow.setContent(foursquare + '</div><div id="pano"></div>');
	                var panoramaOptions = {
	                  position: nearStreetViewLocation,
	                  pov: {
	                    heading: heading,
	                    pitch: 30
	                  }
	                };
	              var panorama = new google.maps.StreetViewPanorama(
	                document.getElementById('pano'), panoramaOptions);
	            } else {
	              infowindow.setContent('<div>' + marker.title + '</div>' +
	                '<div>No Street View Found</div>');
	            }
	          }
	         
	          // Open the infowindow on the correct marker.
	          infowindow.open(map, marker);
		}


	// initialize map
	this.markers = [];
	this.initMap = function() {

		// map constructor
		map = new google.maps.Map(document.getElementById('map'), {
		  zoom: 13,
		  center: {lat: 47.608013, lng: -122.335167}
		});

		this.largeInfowindow = new google.maps.InfoWindow();

		var locations = [
			{title: 'Pike Place Market', location: {lat: 47.6101359, lng: -122.3420567}, venue: '427ea800f964a520b1211fe3'},
			{title: 'Space Needle', location: {lat: 47.620423, lng: -122.349355}, venue: '416dc180f964a5209b1d1fe3'},
			{title: 'Fremont Troll', location: {lat: 47.649682, lng: -122.347366}, venue: '49de874bf964a5206c601fe3'},
			{title: 'Seattle Great Wheel', location: {lat: 47.606106, lng: -122.341530}, venue: '4fbfa89ee4b0fddeca5b5cef'},
			{title: 'Olympic Sculpture Park', location: {lat: 47.616596, lng: -122.35531}, venue: '45b348a3f964a520a9411fe3'}
		]

		for(var i = 0; i < locations.length; i++){
			// get position and title
			var position = locations[i].location;
			var title = locations[i].title;
			var venue = locations[i].venue;
			// create marker
			var marker = new google.maps.Marker({
				map: map,
				position: position,
				title: title,
				venue: venue,
				animation: google.maps.Animation.DROP,
				id: i
			});
			// push marker to marker array
			this.markers.push(marker);
			// onclick event to open infowindow for marker
			marker.addListener('click', self.openMarker);

		}
	}

	// open marker details from left panel list
	this.openMarker = function() {
		self.populateInfoWindow(this, self.largeInfowindow);
		this.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout((function() {
        	this.setAnimation(null);
    	}).bind(this), 800);
	}

	// initialize map
	this.initMap();


	// filter list of places and hide markers
	this.searched = ko.observable("");

	this.filter = ko.computed(function() {
		this.largeInfowindow.close();
		var filtered = [];
	    for (i = 0; i < this.markers.length; i++) {

	        if (this.markers[i].title.toUpperCase().indexOf(this.searched().toUpperCase()) > -1) {
	            this.markers[i].setVisible(true);
	            filtered.push(this.markers[i]);
	        } else {
	            this.markers[i].setVisible(false);
	        }
	    }
		return filtered;    
	}, this);


}

function startApp() {
    ko.applyBindings(new AppViewModel());
}