//this is just jquey for changing the menu bar into a burger bar and then toggle between open and closed

$(document).ready(function(){
	$('.menu-toggle').click(function(){
		$('nav').toggleClass('active')
		 if($('nav').hasClass('active'))
            $('.menu-toggle i').removeClass('fas fa-bars').addClass('fas fa-times')
            else 
            $('.menu-toggle i').removeClass('fas fa-times').addClass('fas fa-bars')
	})
});