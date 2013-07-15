try{ Typekit.load(); } catch(e){}
$(document).ready(function(){
	BusbudSearchForm.init();
	//unfortunately we need a hacky fix for iconfonts in IE8
	if ( $('html').hasClass('lt-ie9') ) fixIconFontsIe8();
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
			$('.error-message').fadeOut();
			return true;
		} else {
			if ( show_form_error) $('.error-message').fadeIn();
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
	var placeholder_text = $input.attr('placeholder').toUpperCase();
	$input.removeAttr('placeholder');

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
	}).on('focus', function(){
		// need to clear it beacuse typeahead compares the hint with the input to determine if it should block default tab behavior
		clearHintPlaceholder();
	})
	// we do this instead of relying on html5 placeholders so we dont need to do anything special for old browsers
	setHintAsPlaceholder();


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
			setHintAsPlaceholder();
			if ( empty_is_error ) $parent_label.addClass('error');
			return false;
		// user didnt select a city or manually edited the input
		} else if ( !selected_city || $input.val() != selected_city.value ){
			$normalized_input.val('');
			$parent_label.removeClass('good').addClass('error');
			return false;
		// user selected a city OR manually typed back in the same letters as last selection
		} else if ( selected_city && $input.val() == selected_city.value ){
			$normalized_input.val( selected_city.norm );
			$parent_label.addClass('good').removeClass('error');
			return true;
		}
	}

	//private functions
	function setHintAsPlaceholder(){
		$parent_label.find('.tt-hint').val( placeholder_text );
	}
	function clearHintPlaceholder(){
		$parent_label.find('.tt-hint').val( '' );
	}

	// used by typeahead to convert API data into proper format
	function filterCityData( cities ){
		for (var i=0; i<cities.length; i++){
			cities[i].value = cities[i].label;
		}
		return cities;
	}
}

function fixIconFontsIe8(){
	// see http://stackoverflow.com/questions/9809351/ie8-css-font-face-fonts-only-working-for-before-content-on-over-and-sometimes
	var head = document.getElementsByTagName('head')[0],
	    style = document.createElement('style');
	style.type = 'text/css';
	style.styleSheet.cssText = ':before,:after {content:none !important';
	head.appendChild(style);
	setTimeout(function(){
	    head.removeChild(style);
	}, 0);
}

