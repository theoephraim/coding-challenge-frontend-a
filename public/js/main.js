try{ Typekit.load(); } catch(e){}

$(document).ready(function(){
	$('input.city-select').typeahead([{
		minLength: 2,
		remote: {
			url: 'http://www.busbud.com/en/complete/locations/%QUERY',
			dataType: 'jsonp',
			filter: filterCityData
		}
	  }
	]).on('typeahead:selected typeahead:autocompleted', function( e, city_selected ){
		// only autocomplete selections are valid. Copy the value into a hidden input
		$( '#' + $(this).attr('name') + '_norm' ).val( city_selected.norm );
		$(this).parents('label').removeClass('error').addClass('good');
		checkSearchFormComplete();
	}).on('change', function(e){
		// if the user manually edits the input text, clear the hidden input
		$( '#' + $(this).attr('name') + '_norm' ).val( '' );
	}).on('typeahead:closed', function(e){
		// show input error if they close the autocomplete without selecting
		if ( $(this).val() == '' ) {
			$(this).parents('label').removeClass('good');
			return;
		}
		if ( $( '#' + $(this).attr('name') + '_norm' ).val() == '' ){
			$(this).parents('label').addClass('error').removeClass('good');
		}
	})

	$('.search-form form').submit(function(e){
		if ( $('#from_norm').val() == '' ){
			$('#city-from').addClass('error');
			$('.error-container .empty-from').show();
		} else if ( $('#city-from').hasClass('error') ) {
			$('.error-container .invalid-from').show();
		}
		if ( $('#to_norm').val() == '' ){
			$('#city-to').addClass('error');
			$('.error-container .empty-to').show();
		} else {
			$('.error-container .invalid-to').show();
		}
		if ( $(this).find('label.error').size() > 0 ){
			$('.error-container').fadeIn();
			e.preventDefault();
			return false;
		}
	})
});

function filterCityData( cities ){
	for (var i=0; i<cities.length; i++){
		cities[i].value = cities[i].label;
		cities[i].tokens = cities[i].norm.split(',');
	}
	return cities;
}
function checkSearchFormComplete(){
	if ( $('.search-form label.error').size() == 0 ){
		$('.error-container').fadeOut();
	}
}