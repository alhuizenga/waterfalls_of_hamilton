# waterfalls_of_hamilton
An interactive map of waterfalls in the Hamilton, Ontario region. A Javascript application built for the Udacity Neighborhood Map Project. Uses Knockout for UI interactivity, and Bootstrap Drawer by [Caroline Amaba](https://github.com/clineamb) for off-canvas styled navigation. Responsive and designed for mobile. All waterfall data including lat/long was scraped from the Wikipedia API.

## Files
* index.html
* app.js (Main application file)
* waterfalls.js (An array of waterfall objects scraped from Wikipedia)
* style.css (App-specific styles)

## Running the app

1. Copy the index.html file into the root directory of your web server.
1. Copy the style.css file into the root/css folder.
1. Copy the app.js and waterfalls.js files into the root/js folder
1. Copy the required library js files into the root/js/libs folder (Or, edit the script tags at the bottom of index.html to point to online locations of the libraries). These include:
    * knockout-3.4.2.js
    * jquery-3.2.0.min.js
    * bootstrap.min.js
    * drawer.min.js

## Libraries I used:
* [Knockout 3.4.2](http://knockoutjs.com/)
* [jQuery 3.2.0](https://jquery.org/)
* [Bootstrap 3.3.7](http://getbootstrap.com/)
* [Bootstrap Drawer](http://carolineamaba.com/bootstrap-drawer/)
* [Glyphicons](http://glyphicons.com/)

## APIs I used:
* [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/)
* [Flickr API](https://www.flickr.com/services/api/)
* [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
