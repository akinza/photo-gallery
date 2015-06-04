function onLoginSuccess() {
  console.log('Welcome!  Fetching your information.... ');
  $("#fb-login").hide();
  getAlbums();
  getPhotos();
  FB.api('/me', function(response) {
    user_id = response.id;
    access_token = response.access_token;
    console.log('response ' , response);
    console.log('Successful login for: ' + response.name);
    document.getElementById('user_name').innerHTML = response.name;
    var profilePic = document.createElement("img");
    profilePic.src = "http://graph.facebook.com/"+user_id+"/picture?height=16&width=16";
    document.getElementById('userProfilePicture').appendChild(profilePic);
    // document.getElementById('status').innerHTML ='Thanks for logging in, ' + response.name + '!';
    var logoutContainer = document.createElement("li");
    var logoutLink = document.createElement("a");
    logoutLink.className = "";
    logoutLink.href = "#";
    logoutLink.id = "user_logout";
    logoutLink.innerHTML = "Logout";
    logoutContainer.appendChild(logoutLink);
    document.getElementById('user-nav').appendChild(logoutContainer);

    $("#user_logout").unbind().bind("click", function(logoutEvent){
      logout(logoutEvent);
    });
  });
}

function logout(logoutEvent){
  FB.logout(function(response) {
    // user is now logged out
    console.log("Logout::", response);
    // document.getElementById('status').innerHTML = "You are successfully signed out!";
    document.getElementById('album-container').innerHTML ="";
    document.getElementById('album-pagination').innerHTML ="";
    document.getElementById('photo-container').innerHTML ="";
    document.getElementById('pagination').innerHTML ="";
     $("#albumListHeading").hide();
    top.location.reload();
  });
}

function getPhotos(){
  FB.api(
      "/me/photos?type=uploaded",
      {access_token: access_token},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          console.log("photos data", response);
          populatePhoto(response);
        }else{
          console.log("photos :err", response);
        }

      }
  );
}

function getAlbums(){
  FB.api(
      "/me/albums",
      {access_token: access_token},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          console.log("albums data", response);
          // populatePhoto(response);
          populateAlbums(response);
        }else{
          console.log("albums :err", response);
        }

      }
  );
}

function getEachAlbum(albumId){
  FB.api(
      albumId+"/photos",
      {access_token: access_token},
      function (response) {
        if (response && !response.error) {
          /* handle the result */
          console.log("data of Album ",albumId, response);
          var c = document.getElementById('photo-container');
          c.innerHTML = "";
          populatePhoto(response);
        }else{
          console.log("albums :err", response);
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
      onLoginSuccess();

    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      // document.getElementById('status').innerHTML = 'Please log into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  },{scope:"public_profile,email,user_photos"});
}

function populateAlbums(response){
    $("#albumListHeading").show();
  _.each(response.data, function(obj){
    var button = document.createElement("a");
    // button.className = " btn btn-info pull-left  margin-left-20";
    button.className = "list-group-item margin-left-20";

    button.dataset["id"] = obj.id;
    button.innerHTML = obj.name + "("+obj.count+")";
    button.style.cursor = "pointer";
    var c = document.getElementById('album-container');
    c.appendChild(button);
    $(button).unbind().bind("click", function(loadAlbum){
      var album_id = loadAlbum.currentTarget.getAttribute("data-id");
      getEachAlbum(album_id);
    });
  });
  if(_.has(response.paging, "next")){
    var link = document.createElement("button");
    link.className = "btn btn-block btn-default";
    link.dataset["next"] = response.paging.next;
    link.innerHTML = "Next";
    var pagingBlock = document.getElementById("album-pagination");
    pagingBlock.height = "100";
    pagingBlock.innerHTML = "";
    pagingBlock.appendChild(link);
    $(link).bind("click", function(loadNextPageEvent){
      var nextLink = loadNextPageEvent.currentTarget.getAttribute("data-next");
      loadNextPageAlbums(nextLink);
    });
  }
}

function populatePhoto(response) {
    var c = document.getElementById('photo-container');
    var pagingBlock = document.getElementById("pagination");
    pagingBlock.innerHTML = "";
    _.each(response.data, function(obj){
      // Creating Item
      var item = document.createElement("div");
      item.className = "item";

      // Creating Image
      var image = document.createElement("img");
      image.src = obj.images[obj.images.length-1].source;
      item.dataset["source"] = obj.images[0].source;
      image.width = "230";

      // Creating Create Date
      var cDateBlock = document.createElement("div");
      cDateBlock.className = "created-time";
      cDateBlock.innerHTML = new Date(obj.created_time).toDateString();


      // Appending Childrens to Item
      item.appendChild(image);
      item.appendChild(cDateBlock);
      // Appending Item to Container
      c.appendChild(item);
      $(item).unbind().bind("click",  function(eventZoomImage){
        var source = eventZoomImage.currentTarget.getAttribute("data-source");
        loadImageViewer(source);
      });
    });
    var container = document.querySelector('#photo-container');
    var msnry = new Masonry( container, {
      // options...
      itemSelector: '.item',
      columnWidth: 250
    });
    // layout Masonry again after all images have loaded
    imagesLoaded( container, function() {

      msnry.layout();
      if(_.has(response.paging, "next")){
        var link = document.createElement("button");
        link.className = "btn btn-block btn-primary";
        link.dataset["next"] = response.paging.next;
        link.innerHTML = "Load more images";
        var pagingBlock = document.getElementById("pagination");
        pagingBlock.height = "100";
        pagingBlock.innerHTML = "";
        pagingBlock.appendChild(link);
        $(link).bind("click", function(loadNextPageEvent){
          var nextLink = loadNextPageEvent.currentTarget.getAttribute("data-next");
          loadNextPage(nextLink);
        });
      }
    });
}

function loadNextPage(next){
  $.ajax({
    url:next,
    success: function(response){
      populatePhoto(response);
    }
  });
}

function loadNextPageAlbums(next){
  $.ajax({
    url:next,
    success: function(response){
      populateAlbums(response);
    }
  });
}

function loadImageViewer(source){
  //  fetch container
  console.log("loadImageViewer :: ", source);
  var imageViewerContainer = document.getElementById('imageViewer');
  imageViewerContainer.innerHTML = "";
  var viewer = document.createElement("div");
  viewer.className = "v-image-container-inner";
  var image = document.createElement("img");
  image.src = source;
  var closeButton = document.createElement("div");
  closeButton.className = "close";
  var close = document.createElement("span");
  close.className = "glyphicon glyphicon-remove";
  closeButton.appendChild(close);

  viewer.appendChild(image);
  viewer.appendChild(closeButton);
  imageViewerContainer.appendChild(viewer);
  imagesLoaded(imageViewerContainer, function(){
    $(imageViewerContainer).show(100);
  });
  $(closeButton).click(function(){
    $(imageViewerContainer).hide(100);
  });
  // create image
  // append to container
  // show container
}

function statusChangeCallback(response) {
 console.log('statusChangeCallback');
 console.log(response);
 var loginButton = document.createElement("img");
 loginButton.src = "images/fb_login.png";
 // The response object is returned with a status field that lets the
 // app know the current login status of the person.
 // Full docs on the response object can be found in the documentation
 // for FB.getLoginStatus().
 if (response.status === 'connected') {
   // Logged into your app and Facebook.
  //  testAPI();
  onLoginSuccess();
 } else if (response.status === 'not_authorized') {
  //  login();
  document.getElementById('fb-login').appendChild(loginButton);
 } else {
  //  login();
  document.getElementById('fb-login').appendChild(loginButton);
 }
}

$(document).ready(function(){
  $("#fb-login").unbind().bind("click", function (loginEvent) {
    login();
  });
});
