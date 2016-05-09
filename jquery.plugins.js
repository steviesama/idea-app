(function($) {

    $.fn.outerHtml = function() {
	  return $('<div />').append(this.eq(0).clone()).html();
	};

}(jQuery));