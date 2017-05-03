window.onload = loadScript;


function loadScript() { // Load the Google Maps API and initialize the app
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyADOgxff4kL41ShMt3w5oxgJ5YarPM6xTM&v=3&callback=init';
  document.body.appendChild(script);
};


function init() { // Run the app and pass in the array of waterfalls from waterfalls.js
	app(waterfalls);
};


function app(waterfalls) {

	// The Knockout viewModel
    viewModel = function(waterfall) { 
		waterfallsKO = ko.observableArray(waterfalls); // An observable array of all waterfalls
        query = ko.observable(''); // An observable for the text input
		query.subscribe(filterwaterfalls); // Pass the text input to the filterWaterfall function
        currentWaterfall = { // Display in the waterfall details drawer
        	isVisible: ko.observable(false),
        	name: ko.observable(),
        	watercourse: ko.observable(),
        	type: ko.observable(),
        	height: ko.observable(),
        	width: ko.observable(),
        	img: ko.observable(),
        	description: ko.observable()
        };
    	errorMsgs = ko.observableArray(); // Errors from third-party APIs
    };

	map = new google.maps.Map(document.getElementById('map'), { // The map
	  center: {lat: 43.279638, lng: -79.725971},
	  zoom: 10,
	  fullscreenControl: false,
	  mapTypeControl: false
	});	

    var largeInfowindow = new google.maps.InfoWindow(); // The information window

	var markers = []; //An array to hold the waterfall markers

	for (var a = 0; a < waterfalls.length; a++) { // For each waterfall in waterfalls.js
		var position = waterfalls[a].position; // Grab the position
		var title = waterfalls[a].name // Grab the name
		var marker = new google.maps.Marker({ // Create a marker
			map: map,
			title: title,
			position: position,
			animation: google.maps.Animation.DROP,
			id: a
		});
		markers.push(marker); // Add the marker to the array
		marker.addListener('click', function() { // When users click the marker
            populateInfoWindow(this, largeInfowindow); // Open the information window
            map.panTo(this.getPosition()); // Pan the map over to the marker
			openCurrentWaterfall(this.title); // Populate the waterfall drawer
			$('#waterfall-drawer').drawer('hide'); // Hide the waterfall drawer if it's open
		});
	};

	// Bound to items in the waterfall list
	pickFromList = function(waterfall) {
		marker = markers.find(checkName); // Find the corresponding marker
		function checkName(marker) {
		    if (marker.title == waterfall.name) {
		    	return marker;
		    }
		}
		populateInfoWindow(marker, largeInfowindow); // Populate and open the infowindow
		openCurrentWaterfall(waterfall.name); // Add waterfall details to the waterfall-drawer
	};

	// Add waterfall details to the waterfall-drawer
	openCurrentWaterfall = function(name) {		
		waterfall = waterfalls.find(checkName); // Find the waterfall object
		function checkName(waterfall) {
		    if (name == waterfall.name) {
		    	return waterfall;
		    }
		}
		// Populate the observable properties of the currentWaterfall object
		currentWaterfall.name(waterfall.name).type(waterfall.type).watercourse(waterfall.watercourse).width(waterfall.width).height(waterfall.height);
		getWikipedia(waterfall); // Get description from Wikipedia
		getFlickr(waterfall); // Get image from Flickr
	};

	// Get waterfall description from Wikipedia
	getWikipedia = function(waterfall) {
	    var wikiURL = "https://en.wikipedia.org/w/api.php"
		var wikiSummaryURL = wikiURL +
						    "?action=query" + 
						    "&titles=" + waterfall.name + 
						    "&prop=extracts" +
						    "&exintro=explaintext" +
						    "&exsentences=2" +
						    "&format=json" +
						    "&callback=wikiCallback";
	    var wikiRequestTimeout = setTimeout(function(){
		    var errorMsg = {error: "Uh oh, can't connect to Wikipedia!"};
		    errorMsgs.push(errorMsg);
	    }, 8000);
	    $.ajax( {
	        url: wikiSummaryURL,
	        dataType: 'jsonp',
	        type: 'POST',
	        headers: { 'Api-User-Agent': 'Example/1.0' },
	        success: function(data) {
				pageIDs = Object.keys(data.query.pages);
				pageid = pageIDs[0];
				wikiExtract = data.query.pages[pageid].extract;
	            currentWaterfall.description(wikiExtract);
		        }
	    }).done(function(){
	        clearTimeout(wikiRequestTimeout);
	    });
	}

	// Get waterfall image from Flickr
	getFlickr = function(waterfall) {
		var flickrURL = "https://api.flickr.com/services/rest/";
		var apiKey = "baa1d3fe4512918b315ed5ac5c71219f";
		flickrSearchURL = flickrURL + 
				    "?method=flickr.photos.search" +
				    "&api_key=" + apiKey +
 			        "&tags=" + waterfall.name + // Search for images tagged with the waterfall name
			        "&format=json" +
			        "&content_type=1" +
			        "&per_page=1" + // Only return one image
				    "&nojsoncallback=1";
	    var flickrTimeout = setTimeout(function(){
		    var errorMsg = {error: "Uh oh, can't connect to Flickr!"};
		    errorMsgs.push(errorMsg);
	    }, 8000);
	    $.ajax( { // Search Flickr for images tagged with the waterfall name
	        url: flickrSearchURL,
	        type: 'GET',
	        dataType: 'json',
	        success: function(data) { // If successful, slice the photo_id from the response
				photoId = data.photos.photo[0].id;
				flickrSizeURL = flickrURL + 
							    "?method=flickr.photos.getSizes" +
							    "&api_key=" + apiKey +
			 			        "&photo_id=" + photoId +
						        "&format=json" +
							    "&nojsoncallback=1";
	            $.ajax( { // Get an array of images with that photo_id
					url: flickrSizeURL,
					type: 'GET',
					dataType: 'json',
					success: function(data) {
						imgUrl = data.sizes.size[4].source; // Grab the fourth image
						currentWaterfall.img(imgUrl); // And add it to the currentWaterfall object
					}
	            }).done(function(){
			        clearTimeout(flickrTimeout);
			    });
	        }
	    }).done(function(){
	        clearTimeout(flickrTimeout);
	    });
	}

	// Open an infowindow and add the waterfall name
	populateInfoWindow = function(marker, infowindow) {			
		if (infowindow.marker != marker) {  // Check to make sure the infowindow is not already opened on this marker
			infowindow.marker = marker;
			windowContent = ('<div class="infoWindow">' +
						     '<a href="#waterfall-drawer" ' + // Waterfall name is a link that populates waterfall drawer
						     'data-toggle="drawer" aria-expanded="false" ' +
						     'onClick="openCurrentWaterfall(&quot;' + marker.title + '&quot;);">' +
						     marker.title +
						     '</a></div>'); 
			infowindow.setContent(windowContent); // Populate the infowindow
			infowindow.open(map, marker); // Open the infowindow
			infowindow.addListener('closeclick',function(){ // Make sure the marker property is cleared if the infowindow is closed
				infowindow.setMarker = null;
			});
		}
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(4);
        }
	}

	// Filter list and markers based on text input
	filterwaterfalls = function(value) { // Take text input value as parameter
		largeInfowindow.close(); // Close info window if it's open
		for (var m = 0; m < markers.length; m++) { // Hide all markers
			markers[m].setVisible(false);
		}
	    waterfallsKO([]); //Remove all waterfalls from the observable array
		for (var x = 0; x < waterfalls.length; x++) { // For each waterfall in waterfalls.js
			if(waterfalls[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) { // If the input value matches the waterfall name
				waterfallsKO.push(waterfalls[x]); // Add the waterfall back into the observable array
				markers[x].setVisible(true); // And show the corresponding marker
			}
		}
	}

	ko.applyBindings(viewModel); // Bind the viewModel to the page

	// Catch any errors from third party APIs and add messages to error observable array
    $(document).ajaxError(function(e, xhr, opt){
	    var errorMsg = {error: 'Uh oh, ' + opt.url.split('/')[2] + ' responded with an error'};
	    errorMsgs.push(errorMsg);
	    console.log("Error requesting " + opt.url + ": " + xhr.status + " " + xhr.statusText)
    });
}
