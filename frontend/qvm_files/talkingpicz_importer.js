var fbImportMangerHelper = (function(a) {
    function b(d, c) {
      var f = false;
      var g = -999;
      var e = false;
      a.each(d, function(j, h) {
        if (c == 720 && !f) {
          if (h.height > g || h.width > g) {
            g = (h.width > h.height) ? h.width : h.height;
            e = h.source
          }
        }
        if (c == 720 && h.height == c) {
          f = h.source
        }
        if (h.width == c) {
          f = h.source
        }
      });
      if (f == false) {
        f = e
      }
      return f
    }
    return {
      createUserThumb: function(d) {
        user_data = d.split("%!!!%");
        var c = a("#fb_user_selector > .main > .fb_user_pic");
        c.attr("id", "fbuser" + user_data[1]);
        c.mouseover(function() {
          a("#fb_user_selector > .main > .fb_user_pic").addClass("fb_user_pic_active");
          a("#fb_user_selector > .main > .arrow").addClass("arrow_active")
        });
        c.mouseout(function() {
          a("#fb_user_selector > .main > .fb_user_pic").removeClass("fb_user_pic_active");
          a("#fb_user_selector > .main > .arrow").removeClass("arrow_active")
        });
        c.click(function(f) {
          fbImportManager.userDropdown();
          f.stopPropagation()
        });
        a("<img/>", {
          "class": "fb_user_img",
          src: "http://graph.facebook.com/" + user_data[1] + "/picture"
        }).appendTo("#fb_user_selector > .main > #fbuser" + user_data[1]);
        a("<div/>", {
          "class": "fb_user_name",
          text: user_data[0]
        }).appendTo("#fb_user_selector > .main > #fbuser" + user_data[1]);
        return user_data[1]
      },
      createAlbumThumb: function(e, d, c) {
        var f = a("#fb_album_selector > .main > .fb_album_pic");
        f.attr("id", "fbalbum" + e);
        a("<i/>", {
          id: "fbalbumimg" + e,
          "class": "fb_album_img"
        }).appendTo("#fb_album_selector > .main > #fbalbum" + e);
        a("<div/>", {
          "class": "fb_album_name",
          text: c
        }).appendTo("#fb_album_selector > .main > #fbalbum" + e);
        a("#fb_album_selector > .main > #fbalbum" + e + " > #fbalbumimg" + e).css("background-image", "url(" + b(d.images, 75) + ")")
      },
      createPhotoThumb: function(c) {
        a("<div/>", {
          "class": "fb_photo_wrap",
          id: "fbphotowrap" + c.id,
          mouseover: function() {
            a("#fbphotoimport" + c.id + ",#fbphotoimporttext" + c.id).show()
          },
          mouseout: function() {
            a("#fbphotoimport" + c.id + ",#fbphotoimporttext" + c.id).hide()
          }
        }).appendTo("#fb_container_photos");
        a("<div/>", {
          "class": "fb_photo_pic",
          id: "fbphotobox" + c.id
        }).appendTo("#fb_container_photos > #fbphotowrap" + c.id);
        a("<i/>", {
          id: "fbphotoimg" + c.id,
          "class": "fb_photo_img"
        }).appendTo("#fb_container_photos > #fbphotowrap" + c.id + " > #fbphotobox" + c.id);
        a("<div/>", {
          "class": "fb_photo_import",
          id: "fbphotoimport" + c.id,
          click: function() {
            fbImportManager.importPhoto(b(c.images, 720))
          }
        }).appendTo("#fb_container_photos > #fbphotowrap" + c.id + " > #fbphotobox" + c.id);
        a("<div/>", {
          "class": "fb_photo_import_text",
          id: "fbphotoimporttext" + c.id,
          text: "Import >",
          click: function() {
            fbImportManager.importPhoto(b(c.images, 720))
          }
        }).appendTo("#fb_container_photos > #fbphotowrap" + c.id + " > #fbphotobox" + c.id);
        a("#fb_container_photos > #fbphotowrap" + c.id + " > #fbphotobox" + c.id + " > #fbphotoimg" + c.id).css("background-image", "url(" + b(c.images, 180) + ")")
      },
      getCoverPhotoByToken: function(c, d) {
        return "https://graph.facebook.com/" + c.cover_photo + "/picture?access_token=" + fbImportManager.settings.access_token + "&type=" + d
      }
    }
  })(jQuery);
  var $fb_user_limit = 500;
  var fbImportManager = (function($) {
    var user = [],
      friends = [],
      albums = [],
      paging = {
        user: {
          page_offset: 0,
          page_limit: $fb_user_limit - 1
        },
        album: {
          page_offset: 0,
          page_limit: 200
        },
        photo: {
          page_offset: 0,
          page_limit: 200
        }
      },
      dropdown = {
        user: {
          init: false,
          loading: false,
          show: false,
          selected_id: false,
          bind_event: false
        },
        album: {
          init: false,
          loading: false,
          show: false,
          selected_id: false,
          bind_event: false
        }
      },
      init = false;
  
    function resetAlbumDropdown() {
      $("#fb_container_nav > #fb_album_selector > .dropdown").html("")
    }
  
    function resetUserContainer() {
      if (dropdown.user.selected_id == false) {
        return
      }
      $("#fbuser" + dropdown.user.selected_id + " > .fb_user_img").remove();
      $("#fbuser" + dropdown.user.selected_id + " > .fb_user_name").remove();
      $("#fbuser" + dropdown.user.selected_id).unbind("click")
    }
  
    function resetPhotoContainer() {
      $("#fb_container_photos").html("")
    }
  
    function resetAlbumContainer() {
      $("#fbalbum" + dropdown.album.selected_id + " > .fb_album_img").remove();
      $("#fbalbum" + dropdown.album.selected_id + " > .fb_album_name").remove();
      $("#fbalbum" + dropdown.album.selected_id).unbind("click")
    }
  
    function resetAlbumDropdown() {
      albums = [];
      paging.album.page_offset = 0;
      dropdown.album.init = false;
      $("#fb_album_selector > .dropdown").html("")
    }
  
    function renderUserDropdown(userarray) {
      $.each(userarray, function(i, userdata) {
        addUserToDropdownList(userdata.split("%!!!%"))
      });
      if (!dropdown.user.show) {
        loadingUser(false);
        $("#fb_user_selector > .dropdown").slideDown(500);
        $("body").bind("click", fbImportManager.hideUserDropdown);
        dropdown.user.show = true
      }
    }
  
    function renderAlbumDropdown(albumarray) {
      $.each(albumarray, function(i, albumdata) {
        addAlbumToDropdownList(albumdata)
      });
      if (!dropdown.album.show) {
        loadingAlbum(false);
        $("#fb_album_selector > .dropdown").slideDown(500);
        $("body").bind("click", fbImportManager.hideAlbumDropdown);
        dropdown.album.show = true
      }
    }
  
    function renderPhoto(data) {
      fbImportMangerHelper.createPhotoThumb(data)
    }
  
    function renderAlbum(lid, data, name) {
      fbImportMangerHelper.createAlbumThumb(lid, data, name)
    }
  
    function renderUsers() {
      if (user.length > 0) {
        resetUserContainer(dropdown.user.selected_id);
        dropdown.user.selected_id = fbImportMangerHelper.createUserThumb(user[0])
      }
    }
  
    function resetUsers() {
      user = [];
      friends = []
    }
  
    function addUserToDropdownList(user_data) {
      $("<div/>", {
        "class": "fb_user_pic",
        id: "fbuserdd" + user_data[1],
        click: function() {
          selectUser(user_data[1], user_data[0])
        },
        mouseover: function() {
          $("#fbuserdd" + user_data[1]).addClass("fb_user_pic_active")
        },
        mouseout: function() {
          $("#fbuserdd" + user_data[1] + ":visible").removeClass("fb_user_pic_active")
        }
      }).appendTo("#fb_user_selector > .dropdown");
      $("<img/>", {
        "class": "fb_user_img",
        src: "http://graph.facebook.com/" + user_data[1] + "/picture"
      }).appendTo("#fb_user_selector > .dropdown > #fbuserdd" + user_data[1]);
      $("<div/>", {
        "class": "fb_user_name",
        text: user_data[0]
      }).appendTo("#fb_user_selector > .dropdown > #fbuserdd" + user_data[1])
    }
  
    function addAlbumToDropdownList(album_data) {
      $("<div/>", {
        "class": "fb_album_pic",
        id: "fbalbumdd" + album_data.id,
        mouseover: function() {
          $("#fbalbumdd" + album_data.id).addClass("fb_album_pic_active")
        },
        mouseout: function() {
          $("#fbalbumdd" + album_data.id + ":visible").removeClass("fb_album_pic_active")
        },
        click: function(e) {
          selectAlbum(album_data.id, album_data.cover_photo, album_data.name)
        }
      }).appendTo("#fb_album_selector > .dropdown");
      $("<i/>", {
        id: "fbalbumimg" + album_data.id,
        "class": "fb_album_img"
      }).appendTo("#fb_album_selector > .dropdown > #fbalbumdd" + album_data.id);
      $("<div/>", {
        "class": "fb_album_name",
        text: album_data.name
      }).appendTo("#fb_album_selector > .dropdown > #fbalbumdd" + album_data.id);
      $("#fb_album_selector > .dropdown > #fbalbumdd" + album_data.id + " > #fbalbumimg" + album_data.id).css("background-image", "url(" + fbImportMangerHelper.getCoverPhotoByToken(album_data, "thumbnail") + ")")
    }
  
    function initAlbums(data) {
      user_data = data.split("%!!!%");
      setAlbumUsername(user_data[0]);
      loadingAlbum(true);
      FB.api("/" + user_data[1] + "/albums", {
        limit: paging.album.page_limit,
        offset: paging.album.page_offset
      }, function(response) {
        if (response.data.length == 0) {
          showEmptyAlbum();
          return
        }
        $.each(response.data, function(i, albumdata) {
          albums.push({
            id: albumdata.id,
            name: albumdata.name,
            cover_photo: albumdata.cover_photo,
            count: albumdata.count
          })
        });
        var cover_photo = response.data[0].cover_photo;
        var album_name = response.data[0].name;
        loadPhotos(response.data[0].id, cover_photo, album_name)
      })
    }
  
    function loadPhotos(lid, cover_photo, album_name) {
      resetAlbumContainer(dropdown.album.selected_id);
      dropdown.album.selected_id = lid;
      FB.api("/" + lid + "/photos", {
        limit: paging.photo.page_limit,
        offset: paging.photo.page_offset
      }, function(response) {
        resetPhotoContainer();
        if ($("#fb_container_photos:hidden").size() > 0) {
          $("#fb_container_photos").slideDown(500)
        }
        $.each(response.data, function(i, photodata) {
          renderPhoto(photodata);
          if (photodata.id == cover_photo) {
            renderAlbum(lid, photodata, album_name);
            loadingAlbum(false)
          }
        })
      })
    }
  
    function setAlbumUsername(username) {
      $("#fb_album_selector > .title > #username").html(username)
    }
  
    function loadingAlbum(show) {
      if (show) {
        unbindEventsAlbumContainer();
        $("#fb_album_selector > .main > .arrow,#fb_album_selector > .main > .fb_album_pic > .fb_album_img,#fb_album_selector > .main > .fb_album_pic > .fb_album_name,#fb_album_selector > .main > .fb_album_pic > .fb_album_empty").hide();
        $("#fb_album_selector > .main > .fb_album_pic > .fb_album_loading").show()
      } else {
        bindEventsAlbumContainer();
        $("#fb_album_selector > .main > .fb_album_pic > .fb_album_loading").hide();
        $("#fb_album_selector > .main > .arrow,#fb_album_selector > .main > .fb_album_pic > .fb_album_img,#fb_album_selector > .main > .fb_album_pic > .fb_album_name").show()
      }
    }
  
    function loadingUser(show) {
      if (show) {
        $("#fb_user_selector > .main > .arrow,#fb_user_selector > .main > .fb_user_pic > .fb_user_img,#fb_user_selector > .main > .fb_user_pic > .fb_user_name").hide();
        $("#fb_user_selector > .main > .fb_user_pic > .fb_user_loading").show()
      } else {
        $("#fb_user_selector > .main > .fb_user_pic > .fb_user_loading").hide();
        $("#fb_user_selector > .main > .arrow,#fb_user_selector > .main > .fb_user_pic > .fb_user_img,#fb_user_selector > .main > .fb_user_pic > .fb_user_name").show()
      }
    }
  
    function showEmptyAlbum() {
      loadingAlbum(false);
      resetAlbumContainer();
      resetPhotoContainer();
      $("#fb_album_selector > .main > .arrow").hide();
      $("#fb_album_selector > .main > .fb_album_pic > .fb_album_empty").show();
      unbindEventsAlbumContainer()
    }
  
    function unbindEventsAlbumContainer() {
      if (!dropdown.album.bind_event) {
        return
      }
      var fb_album_pic = $("#fb_album_selector > .main > .fb_album_pic");
      fb_album_pic.css("cursor", "auto");
      fb_album_pic.unbind("mouseover");
      fb_album_pic.unbind("mouseout");
      fb_album_pic.unbind("click");
      dropdown.album.bind_event = false
    }
  
    function bindEventsAlbumContainer() {
      if (dropdown.album.bind_event) {
        return
      }
      var fb_album_pic = $("#fb_album_selector > .main > .fb_album_pic");
      fb_album_pic.css("cursor", "pointer");
      fb_album_pic.mouseover(function() {
        $("#fb_album_selector > .main > .fb_album_pic").addClass("fb_album_pic_active");
        $("#fb_album_selector > .main > .arrow").addClass("arrow_active")
      });
      fb_album_pic.mouseout(function() {
        $("#fb_album_selector > .main > .fb_album_pic").removeClass("fb_album_pic_active");
        $("#fb_album_selector > .main > .arrow").removeClass("arrow_active")
      });
      fb_album_pic.click(function(e) {
        fbImportManager.albumDropdown();
        e.stopPropagation()
      });
      dropdown.album.bind_event = true
    }
  
    function hideUserDropdownSub() {
      $("#fb_user_selector > .dropdown").slideUp(300);
      $("body").unbind("click", fbImportManager.hideUserDropdown);
      $("#fb_user_selector > .dropdown > .fb_user_pic").removeClass("fb_user_pic_active");
      dropdown.user.show = false
    }
  
    function hideAlbumDropdownSub() {
      $("#fb_album_selector > .dropdown").slideUp(300);
      $("body").unbind("click", fbImportManager.hideAlbumDropdown);
      $("#fb_album_selector > .dropdown > .fb_album_pic").removeClass("fb_album_pic_active");
      dropdown.album.show = false
    }
  
    function selectUser(selected_id, name) {
      dropdown.user.loading = true;
      if (selected_id != dropdown.user.selected_id) {
        loadingUser(true);
        setAlbumUsername(name);
        resetUserContainer(dropdown.user.selected_id);
        dropdown.user.selected_id = fbImportMangerHelper.createUserThumb(name + "%!!!%" + selected_id);
        resetAlbumDropdown();
        initAlbums(name + "%!!!%" + selected_id);
        loadingUser(false)
      }
      hideUserDropdownSub();
      dropdown.user.loading = false
    }
  
    function selectAlbum(selected_id, cover_photo, name) {
      dropdown.album.loading = true;
      if (selected_id != dropdown.album.selected_id) {
        loadingAlbum(false);
        loadPhotos(selected_id, cover_photo, name);
        loadingAlbum(true)
      }
      hideAlbumDropdownSub();
      dropdown.album.loading = false
    }
    return {
      settings: {
        access_token: false
      },
      initImport() {
        if (!init) {
          FB.api("/me", function(response) {
            if (response.name) {
              user.push(response.name + "%!!!%" + response.id);
              $("#fb_username").html(response.name)
            }
            if (user.length > 0) {
              init = true;
              renderUsers();
              initAlbums(user[0]);
              showOverlay($("#fb_import"))
            }
          })
        } else {
          showOverlay($("#fb_import"))
        }
      },
      loadMoreFriends: function() {},
      albumDropdown: function() {
        if (dropdown.album.loading) {
          return
        }
        if (dropdown.album.show) {
          dropdown.album.show = false;
          $("#fb_album_selector > .dropdown").slideUp(300)
        } else {
          if (!dropdown.album.init) {
            dropdown.album.loading = true;
            loadingAlbum(true);
            renderAlbumDropdown(albums);
            dropdown.album.show = true;
            dropdown.album.loading = false;
            dropdown.album.init = true
          } else {
            if (!dropdown.album.show) {
              $("body").bind("click", fbImportManager.hideAlbumDropdown);
              loadingAlbum(false);
              $("#fb_album_selector > .dropdown").slideDown(500);
              dropdown.album.show = true
            }
          }
        }
      },
      userDropdown: function() {
        if (dropdown.user.loading) {
          return
        }
        if (dropdown.user.show) {
          dropdown.user.show = false;
          $("#fb_user_selector > .dropdown").slideUp(300)
        } else {
          if (!dropdown.user.init) {
            dropdown.user.loading = true;
            loadingUser(true);
            FB.api("/me/friends", {
              limit: paging.user.page_limit,
              offset: paging.user.page_offset
            }, function(response) {
              paging.user.page_offset += paging.user.page_limit;
              if (paging.user.page_limit == $fb_user_limit - 1) {
                paging.user.page_limit = $fb_user_limit
              }
              $.each(response.data, function(i, userdata) {
                friends.push(userdata.name + "%!!!%" + userdata.id)
              });
              friends.sort();
              if (!dropdown.user.init) {
                renderUserDropdown(user)
              }
              if (friends.length > 0) {
                renderUserDropdown(friends)
              }
              init = true;
              dropdown.user.show = true;
              dropdown.user.loading = false;
              dropdown.user.init = true
            })
          } else {
            if (!dropdown.user.show) {
              $("body").bind("click", fbImportManager.hideUserDropdown);
              loadingUser(false);
              $("#fb_user_selector > .dropdown").slideDown(500);
              dropdown.user.show = true
            }
          }
        }
      },
      hideUserDropdown: function(e) {
        if ($(e.target).closest("#fb_user_selector > .dropdown").length == 0) {
          hideUserDropdownSub()
        }
      },
      hideAlbumDropdown: function(e) {
        if ($(e.target).closest("#fb_album_selector > .dropdown").length == 0) {
          hideAlbumDropdownSub()
        }
      },
      importPhoto: function(image_src) {
        showOverlay($("#fb_uploading"));
        post_var = {};
        post_var.thumbnailUrl_0 = image_src;
        post_var.photoUrl_0 = image_src;
        post_var.remoteSiteId_0 = 1;
        post_var.title_0 = "Untitled";
        post_var.type = "bg";
        $.ajax({
          url: "/ajax/savePhotoByUrls",
          data: post_var,
          type: "POST",
          error: function() {
            $("#fb_upload_err_msg").html(GT.gettext("Service is unavailable at the moment, please try again later"));
            showOverlay($("#fb_upload_error"))
          },
          success: function(response) {
            response = eval("(" + response + ")");
            if (response.assets.length > 0) {
              if (response.assets[0].aid && response.assets[0].plain_aid && response.assets[0].extension) {
                createTPEditor({
                  assetId: response.assets[0].plain_aid + "." + response.assets[0].extension,
                  encAssetId: response.assets[0].aid
                });
                jQuery.unblockUI();
                stageManager.goTo("heads")
              } else {
                $("#fb_upload_err_msg").html(GT.gettext("This photo cannot be uploaded.  Please try another one."));
                showOverlay($("#fb_upload_error"))
              }
            } else {
              $("#fb_upload_err_msg").html(GT.gettext("This photo cannot be uploaded.  Please try another one."));
              showOverlay($("#fb_upload_error"))
            }
          }
        })
      }
    }
  })(jQuery);