function resize_css(){
	$("#side").outerHeight($(window).innerHeight()-$("#head").outerHeight());
}
function init(){
	// Initialize Page
	resize_css();
	$(window).resize(resize_css);
	// Set handlers for navbar
	$(".navbar-right li").click(function(event){
		$(".navbar-right li").removeClass("active");
		$(event.target).closest("li").addClass("active");
		$(".navbar-toggle:visible").click();
		$(".content, .side").addClass("hidden");
		var id = $(event.target).closest("li").children("a").attr("href");
		$(id+"-main, "+id+"-side").removeClass("hidden");
		$(id+"-main, "+id+"-side").css("opacity","1");
	});
	$(".navbar-brand").click(function(event){
		$("li a[href='#home']").click();
	});
	// Fade in effect
	$("#body").animate({opacity:1},500);
}
$(document).ready(init);