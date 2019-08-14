
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

		ui.draggable.clone()
		.attr('class','snippet')
		.attr('id','snip'+id)
		.css({
			left: ui.position.left - offset.left,  // TODO: fix drop position !! (zoom/scale)
			top: ui.position.top - offset.top,
			width: ui.draggable.prop('naturalWidth'),
			height: ui.draggable.prop('naturalHeight'),
		})
		.appendTo(this.view)
		.draggable({
			// SRC: https://stackoverflow.com/questions/2930092/jquery-draggable-with-zoom-problem
			cursor: "move",
		  start : function(evt, ui) {
				that.getZoom();
		    pointerY = (evt.pageY - view.offset().top) / zoom - parseInt($(evt.target).css('top'));
		    pointerX = (evt.pageX - view.offset().left) / zoom - parseInt($(evt.target).css('left'));
				$(evt.target).detach().appendTo(view); // foreground snippet
		  },
		  drag : function(evt, ui) {
		    var viewTop = view.offset().top;
		    var viewLeft = view.offset().left;
		    var viewHeight = view.height();
		    var viewWidth = view.width();

		    // Fix for zoom
		    ui.position.top = Math.round((evt.pageY - viewTop) / zoom - pointerY);
		    ui.position.left = Math.round((evt.pageX - viewLeft) / zoom - pointerX);

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

	renderOnCanvas(){
		//TODO
	}
	toPDF(){
		//TODO
	}
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
	$('#merge-viewport').mousemove(e => {
		var o = $('#merge-viewport').offset(); // TODO: zoom ???
		$('#mouse_coords').html([]+[e.clientX-o.left,e.clientY-o.top]+'<br>'+merger.zoom);
	});
}
