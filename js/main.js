var info = {
	c1 : {
		pdf: undefined,
		canvas: undefined,
		page: 1,
		room: 1
	},
	c2 : {
		pdf: undefined,
		canvas: undefined,
		page: 1,
		room: 1
	}
};
function load_pdf(idx,url){
	pdfjsLib.getDocument(url).then(pdf => {
		info[idx].pdf = pdf;
		info[idx].page = 1;
		info[idx].zoom = 1;
		render(idx);
	});
}
function render(idx){
	var pdf = info[idx].pdf.then(page => {
		var viewport = page.getViewport(info[idx].zoom);
		info[idx].canvas.width = viewport.width;
		info[idx].canvas.height = viewport.height;
		page.render({
			canvasContext: canvas.getContext("2d"),
			viewport: viewport
		});
	});
}
function resize_css(){
	$("#side").outerHeight($(window).innerHeight()-$("#head").outerHeight());
}
function init(){
	resize_css();
	$("#body").animate({opacity:1},500);
	$(window).resize(resize_css);
	/*
	var canvas = $("canvas");
	info.c1.canvas = canvas[0];
	info.c2.canvas = canvas[1];
	*/
}

$(document).ready(init);