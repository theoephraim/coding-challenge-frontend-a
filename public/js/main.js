try{ Typekit.load(); } catch(e){}
$(document).ready(function(){
	BusbudSearchForm.init();
});


// Singleton search form controller
var BusbudSearchForm = new function(){
	var self = this;
	var $form;
	var form_inputs = [];

	// init called on docready
	this.init = function(){
		$form = $('.search-form form');

		$city_inputs = $form.find('input.city-select').each(function(){
			form_inputs.push( new BusbudCityDropdown( this ) );
		})
	
		$form.submit(function(e){
			if ( !self.validateForm( true, true ) ) {
				e.preventDefault();
				return false;
			}
		})
	}

	this.validateForm = function( show_required_errors, show_form_error ){
		var valid = true;
		valid = form_inputs[0].checkIsValidSelection( show_required_errors ) && valid;
		valid = form_inputs[1].checkIsValidSelection( show_required_errors ) && valid;
		if ( valid ) {
			$('.error-container').fadeOut();
			return true;
		} else {
			if ( show_form_error) $('.error-container').fadeIn();
			return false;
		}
	}

	return this;
}


// Autocomplete dropdown class
function BusbudCityDropdown( input ){
	var self = this;
	var selected_city;
	var $input = $(input);
	var $normalized_input = $( '#' + $input.attr('name') + '_norm' );
	var $parent_label = $input.parents('label');

	// initialize
	$(input).typeahead([{
		minLength: 2,
		remote: {
			url: 'http://www.busbud.com/en/complete/locations/%QUERY',
			dataType: 'jsonp',
			filter: filterCityData
		}
	  }
	]).on('typeahead:selected typeahead:autocompleted', function( e, new_city ){
		self.setCity( new_city );
		// validate form only to hide errors if everything is good
		BusbudSearchForm.validateForm();
	}).on('blur', function(){
		self.checkIsValidSelection();
	})


	// public functions
	this.setCity = function( new_city ){
		selected_city = new_city;
		self.checkIsValidSelection();
	}
	this.checkIsValidSelection = function( empty_is_error ){
		// empty input
		if ( $input.val() == '' ){
			$normalized_input.val('');
			$parent_label.removeClass('good');
			if ( empty_is_error ) $parent_label.addClass('error');
			return false;
		// user didnt select a city or manually edited the input
		} else if ( !selected_city || $input.val() != selected_city.value ){
			$normalized_input.val('');
			$parent_label.removeClass('good').addClass('error');
			return false;
		// user manually typed back in the same letters as last selection
		} else if ( selected_city && $input.val() == selected_city.value ){
			$normalized_input.val( selected_city.norm );
			$parent_label.addClass('good').removeClass('error');
			return true;
		}
	}

	// used by typeahead to convert API data into proper format
	function filterCityData( cities ){
		for (var i=0; i<cities.length; i++){
			cities[i].value = cities[i].label;
		}
		return cities;
	}
}

