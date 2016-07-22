var processing;
var scrollNext;
var hasNext = false;
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
    profilePic.src = "//graph.facebook.com/"+user_id+"/picture?height=16&width=16";
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

function getPhotoLikesInfo(id){
  FB.api(
    id+"/likes",
    {fields : "total_count"},
    {access_token: access_token},
    function(response){
      if (response && !response.error) {
        // console.log("Likes Info :: <"+id+">", response);
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
  },{scope:"public_profile,email,user_photos,user_friends"});
}

function populateAlbums(response){
    $("#albumListHeading").show();
  _.each(response.data, function(obj){
    if(obj.privacy !== "custom"){
      var button = document.createElement("a");
      // button.className = " btn btn-info pull-left  margin-left-20";
      // button.className = "list-group-item margin-left-20";

      button.dataset["id"] = obj.id;
      button.innerHTML = obj.name + "("+obj.count+")";
      button.style.cursor = "pointer";
      var c = document.getElementById('album-container');
      var li = document.createElement('li');
      li.appendChild(button);
      c.appendChild(li);
      $(button).unbind().bind("click", function(loadAlbum){
        var album_id = loadAlbum.currentTarget.getAttribute("data-id");
        getEachAlbum(album_id);
      });
    }
  });
  if(_.has(response.paging, "next")){
    console.log("Has pagination");
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
      // fetch Photo Like Info
      getPhotoLikesInfo(obj.id);

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

      // Creating Links
      var likes = document.createElement("div");
      likes.className = "likes";
      var likeCount = 0, commentCount = 0;
      if(_.has(obj, "likes")){
        likeCount = obj.likes.data.length;
      }
      if(_.has(obj, "comments")){
        commentCount = obj.comments.data.length;
      }
      likes.innerHTML = "<span class='glyphicon glyphicon-heart'></span> "
                        + likeCount+ " "+
                        "<span class='glyphicon glyphicon-comment'></span> "
                        + commentCount;

      // Appending Childrens to Item
      item.appendChild(image);
      item.appendChild(cDateBlock);
      item.appendChild(likes);


      if(commentCount){
        var commentsBlock =document.createElement("div");
        commentsBlock.className = "comment-block";
        _.each(obj.comments.data, function(comment){
          var commentDiv = document.createElement("div");
          commentDiv.className = "comment";
          commentDiv.innerHTML = "<img width='32' height='32' src='//graph.facebook.com/"
            +comment.from.id
            +"/picture?height=32&width=32'>"
            +"<strong>"+comment.from.name+"</strong>" +" : " +comment.message;
            item.appendChild(commentDiv);
        });
      }
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
    msnry.layout();
    // layout Masonry again after all images have loaded
    imagesLoaded( container, function() {

      msnry.layout();
      if(_.has(response.paging, "next")){
        console.info("pagination :: has next ", response);
        scrollNext = response.paging.next;
        hasNext = true;
        // var link = document.createElement("button");
        // link.className = "btn btn-block btn-primary";
        // link.dataset["next"] = response.paging.next;
        // link.innerHTML = "Load more images";
        // var pagingBlock = document.getElementById("pagination");
        // pagingBlock.height = "100";
        // pagingBlock.innerHTML = "";
        // pagingBlock.appendChild(link);
        // $(link).bind("click", function(loadNextPageEvent){
        //   var nextLink = loadNextPageEvent.currentTarget.getAttribute("data-next");
        //   loadNextPage(nextLink);
        // });
      }
      else{
        scrollNext = "";
        hasNext=false;
      }
    });
      // activateSlimScroll();
}

function loadNextPage(next){
  $.ajax({
    url:next,
    success: function(response){
      populatePhoto(response);
      processing = false;
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
  if(document.getElementById('fb-login')){

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
}

function activateSlimScroll(){
  $("#photo-container").slimScroll({
            height: window.innerHeight+'px',
            size: '8px',
            position: 'right',
            color: '#888',
            alwaysVisible: false,
            distance: '3px',
            railVisible: true,
            railColor: '#efefef',
            railOpacity: 0.3,
            wheelStep: 10,
            allowPageScroll: true,
            disableFadeOut: false
        });
}

$(document).ready(function(){

  $("#fb-login").unbind().bind("click", function (loginEvent) {
    login();
  });

  $(document).scroll(function(e){

      if (processing)
          return false;

      if (hasNext && $(window).scrollTop() >= ($(document).height() - $(window).height())*0.8){
          processing = true;
          loadNextPage(scrollNext);
          // $.post('/echo/html/', 'html=<div class="loadedcontent">new div</div>', function(data){
          //     $('#container').append(data);
          //     processing = false;
          // });
      }
  });
});
