// *********************************   GLOBALE VARIABLES ***************************************** \\

/*
TODO: Bilder und PDFs als jeweiliges Objekt speichern (memory.resources)

TODO: IMG onclick:
	1) prüfe ob IMG ein PDF ist
	2) Wenn nicht: male das IMG auf canvas (wie bisher)
	3) wenn doch: 	finde PDF über ID-Mapping (IMG <=ID=> PDF)
	4) 				male das PDF auf canvas
	5)				button controls (eg. next, last) einabuen
*/

var memory = {
	resources: [],
	canvas: {
		"select": undefined,
		"merge": undefined
	}
};
var selectTimeout;
var last;
function random(min,max){
	return Math.floor(Math.random()*(max-min+1))+min;
}

class PDF {
	constructor(file){
		this.id = random(0,10000);
		this.file = file;
		this.pdf = this.toPDF();
		this.img = this.toIMG();
	}
	toPDF(){
		var fileReader = new FileReader();
		return new Promise(function(resolve,reject){
			fileReader.onload = function(){
				var typedarray = new Uint8Array(this.result);
				pdfjsLib.getDocument(typedarray)
					.then(function(pdf){
						resolve(pdf);
					})
					.catch(function(err){
						reject(err);
					})
				;
			}
		});
	}
	toIMG(){
		var that = this;
		return new Promise(function(resolve,reject){
			var canvas = document.querySelector("#upload-canvas");
			that.renderOnCanvas(canvas)
				.then(function(bool){
					// save canvas as image
					var imgData = canvas.toDataURL("image/jpeg", 1.0);
					resolve(imgData);
				})
				.catch(function(err){
					reject(err);
				})
			;
		});
	}
	renderOnCanvas(canvas){
		var that = this;
		return new Promise(function(resolve,reject){
			that.pdf
				.then(function(pdf){
					pdf.getPage(1)
						.then(function(page){
							var viewport = page.getViewport(1.5);
							canvas.width = viewport.width;
							canvas.height = viewport.height;
							var renderTask = page.render({canvasContext:canvas.getContext("2d"), viewport:viewport});
							renderTask.promise
								.then(function(){
									resolve(true);
								})
								.catch(function(err){
									reject(err);
								})
							;
						})
						.catch(function(err){
							reject(err);
						})
					;
				})
				.catch(function(err){
					reject(err);
				})
			;
		});
	}
}

class IMG {
	constructor(file){
		this.id = random(0,10000);
		this.file = file;
		this.img = this.toIMG();
	}
	toIMG(){
		var that = this;
		var fileReader = new FileReader();
		return new Promise(function(resolve,reject){
			fileReader.onload = function(event){
				resolve(event.target.result);
			};
			fileReader.readAsDataURL(that.file);
		});
	}
	renderOnCanvas(canvas){
		var that = this;
		return new Promise(function(resolve,reject){
			that.img
				.then(function(imgSrc){
					canvas.getContext("2d").drawImage(imgSrc,0,0);
					resolve(true);
				})
				.catch(function(err){
					reject(err);
				})
			;
		});
	}
}

// ********************************* FILE UPLOAD CODE ***************************************** \\

function add_new_file(){
	var input = $("#file-upload")[0];
	if (input.files.length > 0){
		for (var i=0;i<input.files.length;i++){
			let file = input.files[i];
			console.log("File: ",file);
			var fileReader = new FileReader();
			if (file.name.endsWith(".pdf")){	// Handle PDF's
				fileReader.onload = function(){
					var typedarray = new Uint8Array(this.result);
					pdfjsLib.getDocument(typedarray).then(function(pdf){
						console.log("TODO: ",pdf);
						pdfFile = pdf;
						convert_pdf_to_img(pdf,document.querySelector("#upload-canvas"),file);
					});
				};
				fileReader.readAsArrayBuffer(file);
			}
			else {								// Handle Images
				fileReader.onload = function(event){
					var r = random(0,10000);
					$("#upload-side, #select-side-img").append("<div><label for='img"+r+"'>"+file.name+"</div><img id='"+r+"' src='"+event.target.result+"' class='upload-img'>");
					$("#select-side-img img:last").click(function(event){
						$("#select-side select").val("Files");
						console.log("clicked: ",event);
						draw_img_on_canvas($(event.target).closest("img")[0],$("#select-canvas")[0]);
					});
				}
				fileReader.readAsDataURL(file);
			}
		}
	}
	else console.log("[INFO] No file found in file input list ...\n=> Could not add new file!");
}

function draw_img_on_canvas(img,canvas){
	iWidth = img.naturalWidth;
	iHeight = img.naturalHeight;
	cWidth = $(canvas).innerWidth();
	cHeight = $(canvas).innerHeight();
	console.log("I: ",iWidth," ",iHeight);
	console.log("C: ",cWidth," ",cHeight);

	if (iWidth < iHeight){
		canvas.width = iWidth;
		canvas.height = iHeight;
		canvas.getContext("2d").drawImage(img,0,0);
	}
	else {
		canvas.width = iWidth;
		if (iHeight < cHeight) {
			canvas.height = cHeight;
			canvas.getContext("2d").drawImage(img,0,(cHeight-iHeight)/2);
		}
		else {
			canvas.height = iWidth;
			canvas.getContext("2d").drawImage(img,0,0);
		}
	}
}

function convert_pdf_to_img(pdf,canvas,file){
	// render pdf on hidden canvas
	canvas = $("<canvas class='useless hidden'></canvas>");
	$("body").append(canvas);
	canvas = canvas[0];
	pdf.getPage(1).then(function(page){
		var viewport = page.getViewport(1.5);
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		var renderTask = page.render({canvasContext:canvas.getContext("2d"), viewport:viewport});
		renderTask.promise.then(function(){
			// save canvas as image
			var imgData = canvas.toDataURL("image/jpeg", 1.0);
			// Append image to side list
			var id = random(0,10000);
			$("#upload-side, #select-side-img").append("<label for='img"+id+"'>"+file.name+"</div><img id='"+id+"' src='"+imgData+"' class='"+id+" upload-img'>");
			$("#select-side-img img:last").click(function(event){
				//console.log("clicked: ",event);
				draw_img_on_canvas($(event.target).closest("img")[0],$("#select-canvas")[0]);
			});
			$("#upload-side img:last").click(function(event){
				$("#select-side select").val("Files");
				$("li a[href='#select']").click();
				var c = $(event.target).closest("img").attr("class").split(" ")[0];
				$("#select-side-img ."+c).click();
			});
		});
	});
	setTimeout(function(){
		$(canvas).remove();
	},10*1000);
}

// ********************************* SELECT SNIPPETS CODE ***************************************** \\

function show_select_menu(){
	clearTimeout(selectTimeout);
	$("#select-tools").removeClass("hidden");
	selectTimeout = setTimeout(function(){
		$("#select-tools").addClass("hidden");
	},2*1000);
}

function show_side_div(select){
	if ($(select).val() == "Files"){
		$("#select-side-img").removeClass("hidden");
		$("#select-side-snippets").addClass("hidden");
	}
	else {
		$("#select-side-img").addClass("hidden");
		$("#select-side-snippets").removeClass("hidden");
	}
}

// ********************************* MERGE SNIPPETS CODE ***************************************** \\

// *********************************   PAGE INITIALIZATION ***************************************** \\

function resize_css(){
	$("#side").outerHeight($(window).innerHeight()-$("#head").outerHeight());
	$("#select-canvas").css({
		width: $("#select-canvas").outerHeight()*0.9
	});
}
function init(){
	// Initialize Page
	resize_css();
	$(window).resize(resize_css);
	// Set handlers for navbar
	$(".navbar-right li").click(function(event){
		$(".navbar-right li").removeClass("active");
		$(event.target).closest("li").addClass("active");
		$(".navbar-toggle:visible[aria-expanded='true']").click();
		$(".content, .side").addClass("hidden");
		var id = $(event.target).closest("li").children("a").attr("href");
		$(id+"-main, "+id+"-side").removeClass("hidden");
		$(id+"-main, "+id+"-side").css("opacity","1");
	});
	$(".navbar-brand").click(function(event){
		$("li a[href='#home']").click();
	});
	// Initialize some global variables
	memory.canvas.select = $("#select-canvas")[0];
	memory.canvas.merge = $("#merge-canvas")[0];
	// Fade in effect
	$("#body").animate({opacity:1},500);

	// Paul startet seine INIT
	//merger_init();
}
$(document).ready(init);
