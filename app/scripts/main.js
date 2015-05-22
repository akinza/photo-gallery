$(document).ready(function(){
  var c = document.getElementById('container');
  for(var i = 16;i > 0; i--){
    var item = document.createElement("div");
    item.className = "item";
    var image = document.createElement("img");
    image.src = "images/"+i+".png";
    item.appendChild(image);
    // item.html = "Hello";
    // item.height = Math.ceil(Math.random()*100) +"px";
    c.appendChild(item);
  }
  var container = document.querySelector('#container');

// initialize Masonry after all images have loaded
// imagesLoaded( container, function() {
//   msnry = new Masonry( container, {
//     // options...
//     itemSelector: '.item',
//     columnWidth: 270
//   });
// });
  var msnry = new Masonry( container, {
    // options...
    itemSelector: '.item',
    columnWidth: 270
  });
  // layout Masonry again after all images have loaded
  imagesLoaded( container, function() {

    msnry.layout();

  });
  imagesLoaded( document.querySelector('#container'), function( instance ) {
  console.log('all images are loaded');
});
});
