
var merger; // global var for merger viewport
var zoom,pointerX,pointerY;

class VIEWPORT{
	constructor(elem){
		this.view = $(elem);
		this.canvas = $(elem).find('canvas')[0];
		this.size = {width:1000, height:600};
		this.snip_id = 0;
		this.zoom = 1;
		this.fitZoomOnWidth();
	}
	getZoom(){
		return (zoom = +this.zoom||1);
	}
	setZoom(z){
		this.zoom = z; //console.log('changed zoom to '+z);
		this.view.css('transform','scale('+z+')');
	}
	fitZoomOnWidth(){
		this.setZoom(($('#main').outerWidth()-25)/this.size.width)
	}
	addPage(){
		this.view.height('+='+this.size.height);
	}

	addSnip(evt,ui){              // drop img into viewport
		let view = this.view;
		let id = this.snip_id++;
		let that = this;
		let offset = this.view.offset();
		let coords = this.getCoords(evt);

		ui.draggable.clone()
		.attr('class','snippet')
		.attr('id','snip'+id)
		.css({
			left: coords.X - pointerX,  // TODO: fix drop position !! (zoom/scale)
			top: coords.Y - pointerY, //ui.position.top - offset.top,
			width: ui.draggable.prop('naturalWidth'),
			height: ui.draggable.prop('naturalHeight'),
		})
		.appendTo(this.view)
		.draggable({
			// SRC: https://stackoverflow.com/questions/2930092/jquery-draggable-with-zoom-problem
			cursor: "move",
		  start : function(evt, ui) {
				let coords = that.getCoords(evt);
		    pointerY = coords.Y - parseInt($(evt.target).css('top'));
		    pointerX = coords.X - parseInt($(evt.target).css('left'));
				$(evt.target).detach().appendTo(view); // foreground snippet
		  },
		  drag : function(evt, ui) {
				let coords = that.getCoords(evt);
		    var viewTop = view.offset().top;
		    var viewLeft = view.offset().left;
		    var viewHeight = view.height();
		    var viewWidth = view.width();

		    // Fix for zoom
		    ui.position.top = Math.round(coords.Y - pointerY);
		    ui.position.left = Math.round(coords.X - pointerX);

		    // TODO: Check if element is outside view
		    if (ui.position.left < 0) ui.position.left = 0;
		    if (ui.position.left + $(this).width() > viewWidth) ui.position.left = viewWidth - $(this).width();
		    if (ui.position.top < 0) ui.position.top = 0;
		    if (ui.position.top + $(this).height() > viewHeight) ui.position.top = viewHeight - $(this).height();

		    // Finally, make sure offset aligns with position
		    ui.offset.top = Math.round(ui.position.top + viewTop);
		    ui.offset.left = Math.round(ui.position.left + viewLeft);
		  }
		});
	}
	getCoords(evt){
		return {
			X: Math.round((evt.pageX - this.view.offset().left) / this.zoom),
			Y: Math.round((evt.pageY - this.view.offset().top) / this.zoom)
		};
	}

	renderOnCanvas(){
		//TODO
	}
	toPDF(){
		//TODO
	}
}

function viewCoords(evt){

}

//########################################################################
//########################################################################
function init_merger(){

	// GOTO merge page
	if(location.hash=='#merge') $("li a[href='#merge']").click()

	// init merger viewport
	merger = new VIEWPORT('#merge-viewport');
	$('button#merge-addpage').click(()=>merger.addPage());

	// drag Images from the sidebar to the merge-viewport
	$("#merge-side img").draggable({
		appendTo: "#body",
		helper: "clone",
		revert: "invalid",
		start: (evt,ui)=>{
			ui.helper.width(ui.helper.prop("naturalWidth")*merger.getZoom());
			pointerY = (evt.pageY - ui.offset.top)/merger.zoom;
			pointerX = (evt.pageX - ui.offset.left)/merger.zoom;
			console.log(pointerX,pointerY);
		}
	});

	// add dragged image to viewport as snippet
	$("#merge-viewport").droppable({
		accept: "#merge-side img",
		drop: (e,ui) => merger.addSnip(e,ui)
	});

	// resize viewport with window
	$(window).resize(()=>merger.fitZoomOnWidth());

	// print mouse coords for debugging
	$('#merge-viewport').mousemove(evt => {
		var o = $('#merge-viewport').offset(); // TODO: zoom ???
		let coords = merger.getCoords(evt);
		$('#mouse_coords').html([]+[coords.X,coords.Y]);
	});
}
