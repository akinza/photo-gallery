$(document).ready(function(){
  $("#user_logout").unbind().bind("click", function(eventLogout){
    FB.logout(function(response) {
      // user is now logged out
      console.log("Logout::", response);
      top.location.reload();
    });
  });
});

function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    user_id = response.id;
    access_token = response.access_token;
    console.log('response ' , response);
    console.log('Successful login for: ' + response.name);
    document.getElementById('user_name').innerHTML = response.name;

    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });
}


function getPhotos(response){
  FB.api(
      "/me/photos",
      {access_token: access_token},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          console.log("photos data", response);
          populate(response);
        }else{
          console.log("photos :err", response);
        }

      }
  );
}

function login(){
  FB.login(function(response){
    console.log('Login');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
      getPhotos(response);
    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  },{scope:"public_profile,email,user_photos"});
}

function populate(response) {
  // $(document).ready(function(){
    var c = document.getElementById('container');
    //
    // for(var i = 16;i > 0; i--){
    //   var item = document.createElement("div");
    //   item.className = "item";
    //   var image = document.createElement("img");
    //   image.src = "images/"+i+".png";
    //   item.appendChild(image);
    //   c.appendChild(item);
    // }
    _.each(response.data, function(obj){
      var item = document.createElement("div");
      item.className = "item";
      var image = document.createElement("img");
      image.src = obj.source;
      image.width = "250";
      item.appendChild(image);
      // item.html = "Hello";
      // item.height = Math.ceil(Math.random()*100) +"px";
      c.appendChild(item);
    });
    var container = document.querySelector('#container');
    var msnry = new Masonry( container, {
      // options...
      itemSelector: '.item',
      columnWidth: 270
    });
    // layout Masonry again after all images have loaded
    imagesLoaded( container, function() {

      msnry.layout();

    });
    var link = document.createElement("button");
    link.className = "btn btn-block btn-default";
    link.dataset["next"] = response.paging.next;
    link.innerHTML = "Next";
    var pagingBlock = document.getElementById("pagination");
    pagingBlock.height = "100";
    pagingBlock.innerHTML = "";
    pagingBlock.appendChild(link);
    $(link).bind("click", function(loadNextPageEvent){
      var nextLink = loadNextPageEvent.currentTarget.getAttribute("data-next");
      loadNextPage(nextLink);
    });
  // });
}
function loadNextPage(next){
  $.ajax({
    url:next,
    success: function(response){
      populate(response);
    }
  });
}
function renderPagination(pagingData){

}
