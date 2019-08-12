
const LINE_SPACING = 10;
var snipElem;

function merger_init(){

  console.log('joo');

  snipElem = $('#snip1')[0];
  // use displacejs to add draging functionality
  displace = displacejs(snipElem, {
      constrain: true,
      relativeTo: document.querySelector('#workspace'),
      handle: snipElem.querySelector('.dragHandle'),
      onMouseDown: startDraging,
      onTouchStart: startDraging,
      onMouseUp: stopDraging,
      onTouchStop: stopDraging,
      customMove(el, x, y){
        $('#info').html([x,y]+[]);
        const left = Math.round(x / LINE_SPACING) * LINE_SPACING;
    		const top = Math.round(y / LINE_SPACING) * LINE_SPACING;
    		el.style.left = displace.data.xClamp(left) + 'px';
    		el.style.top = displace.data.yClamp(top) + 'px';
    	}
  });

  // init rezizer
  const resizer = document.createElement('div');
  resizer.className = 'resizeHandle';
  snipElem.appendChild(resizer);
  resizer.addEventListener('mousedown', startResize, false);

}

// Draging functions
function startDraging(el){
	el.className += ' active';
}
function stopDraging(el){
	el.className = el.className.replace(/\s*active/g, '');
}



// #########################################################
// Resizer

function startResize(e) {
  window.addEventListener('mousemove', doResize, false);
  window.addEventListener('mouseup', stopResize, false);
}
function doResize(e) {
  const snip = {width:554,height:213};
  const maxWidth = $('#workspace').offsetWidth - snipElem.offsetLeft;
  let w = e.clientX - snipElem.offsetLeft - $('#workspace').offsetLeft;
  let h = e.clientY - snipElem.offsetTop - $('#workspace').offsetTop;

  // calculate scale with w or h
  const W = Math.round(h * snip.width/snip.height);
  const H = Math.round(w * snip.height/snip.width);
  // infoElem.innerHTML = [x,h,'|',w,y,'<br>',x+h,w+y]+[];
  if(W+h > w+H){ w=W }else{ h=H } // choose maximal option
  if(w > maxWidth){ w=maxWidth; h=Math.round(w*snip.height/snip.width); }
  snipElem.style.width =  w+5 + 'px';
  snipElem.style.height = h+5 + 'px';
}
function stopResize(e) {

  window.removeEventListener('mousemove', doResize, false);
  window.removeEventListener('mouseup', stopResize, false);
  displace.reinit();
}
