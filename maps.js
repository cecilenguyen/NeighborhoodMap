var markers = [];
var win;

// initialize map
function initMap() {
	// map constructor
	var map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 13,
	  center: {lat: 47.608013, lng: -122.335167}
	});

	var largeInfowindow = new google.maps.InfoWindow();
	// save it to global variable
	win = largeInfowindow;

	var locations = [
		{title: 'Pikes Place Market', location: {lat: 47.6101359, lng: -122.3420567}},
		{title: 'Space Needle', location: {lat: 47.620423, lng: -122.349355}},
		{title: 'Fremont Troll', location: {lat: 47.649682, lng: -122.347366}},
		{title: 'Seattle Great Wheel', location: {lat: 47.606106, lng: -122.341530}},
		{title: 'Olympic Sculpture Park', location: {lat: 47.616596, lng: -122.35531}}
	]

	for(var i = 0; i < locations.length; i++){
		// get position and title
		var position = locations[i].location;
		var title = locations[i].title;
		// create marker
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// push marker to marker array
		markers.push(marker);
		// onclick event to open infowindow for marker
		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfowindow);
		});

		// populate left column list
		$("#locationList").append('<li id=' + i + ' onclick="getInfoFromList(this.id)"><a href="#">' + locations[i].title + '</a></li>');
	}
}


function getInfoFromList(id){
	var mark = markers[id];
	populateInfoWindow(mark, win);
}

// put marker info in infowindow
function populateInfoWindow(marker, infowindow){
		if(infowindow.marker != marker){
			infowindow.marker = marker;
			infowindow.setContent('<div>' + marker.title + '</div>');
			infowindow.open(map, marker);
			// make sure marker property cleared if infowindow is closed
			infowindow.addListener('closeclick', function(){
				infowindow = null;
			});
		}

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
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
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
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
	}

