function init_merger(){
	$("img").draggable({
		appendTo: "#main",
		helper: "clone",
	});
	$("canvas").droppable({
		drop: function(event,ui){
			var clone = ui.draggable.clone()
			$("canvas").parent().append(clone);
			clone.css({
				position: "absolute",
				width: "50%",
				top: "0px",
				left: "0px",
			});
		}
	});
}