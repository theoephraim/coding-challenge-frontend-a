try{ Typekit.load(); } catch(e){}

$(document).ready(function(){
	
	$('input.city-select').typeahead([{
		remote: {
			url: 'http://www.busbud.com/en/complete/locations/%QUERY',
			dataType: 'jsonp',
			filter: filterCityData
		}
	  }
	]);
	
});

function filterCityData( cities ){
	for (var i=0; i<cities.length; i++){
		cities[i].value = cities[i].label;
		cities[i].tokens = cities[i].norm.split(',');
	}
	return cities;
}