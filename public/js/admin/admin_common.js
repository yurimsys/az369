

//상세정보 토글

function folding(){
  if($('#object_detail_group').css('display') != 'none'){
      $('#folding').removeClass('btn-folder');
      $('#folding').addClass('btn-folder-active');
  }else if($('#object_detail_group').css('display') == 'none'){
      $('#folding').addClass('btn-folder');
      $('#folding').removeClass('btn-folder-active');
  }
  $('#object_detail_group').slideToggle('fast')
}

//신청서 알림 현황
function benefitRead(){
    $.ajax({
        url : '/api/benefit_length',
        method : 'get',
        dataType : 'json',
        success: function(res){
            $('#benefit_length').text(res.data[0].count)
        }					
    });
}

benefitRead();benefitRead();

(function($) {
  "use strict";

  function initMetisMenu() {
    //metis menu
    $("#side-menu").metisMenu();
  }

  function initLeftMenuCollapse() {
    $("#vertical-menu-btn").on("click", function(event) {
      event.preventDefault();
      $("body").toggleClass("sidebar-enable");
      if ($(window).width() >= 992) {
        $("body").toggleClass("vertical-collpsed");
      } else {
        $("body").removeClass("vertical-collpsed");
      }
    });
  }

  function initActiveMenu() {
    // === following js will activate the menu in left side bar based on url ====
    $("#sidebar-menu a").each(function() {
      var pageUrl = window.location.href.split(/[?#]/)[0];
      if (this.href == pageUrl) {
        
        $('.metismenu').css('display','none');
        $(this).parent().parent().css('display','block');
        if($(this).parent().parent().hasClass('side-vehicle') == true){
          $('#nav_vehicle').addClass('active');
        }
        else if($(this).parent().parent().hasClass('side-user') == true){
          $('#nav_user').addClass('active');
        }
        else if($(this).parent().parent().hasClass('side-payment') == true){
          $('#nav_payment').addClass('active');
        }
        else if($(this).parent().parent().hasClass('side-signage') == true){
          $('#nav_signage').addClass('active');
        }

        $(this).addClass("active");
        $(this)
          .parent()
          .addClass("active"); // add active to li of the current link
        $(this)
          .parent()
          .parent()
          .addClass("mm-show");
        $(this)
          .parent()
          .parent()
          .prev()
          .addClass("active"); // add active class to an anchor
        $(this)
          .parent()
          .parent()
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("mm-show"); // add active to li of the current link
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active");
      }
    });
  }

  function initMenuItem() {
    $(".navbar-nav a").each(function() {
      var pageUrl = window.location.href.split(/[?#]/)[0];
      console.log('page',pageUrl);
      if (this.href == pageUrl) {
        $(this).addClass("active");
        $(this)
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active");
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active");
      }
    });
  }

  function initFullScreen() {
    $('[data-toggle="fullscreen"]').on("click", function(e) {
      e.preventDefault();
      $("body").toggleClass("fullscreen-enable");
      if (
        !document.fullscreenElement &&
        /* alternative standard method */ !document.mozFullScreenElement &&
        !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    });
    document.addEventListener("fullscreenchange", exitHandler);
    document.addEventListener("webkitfullscreenchange", exitHandler);
    document.addEventListener("mozfullscreenchange", exitHandler);
    function exitHandler() {
      if (
        !document.webkitIsFullScreen &&
        !document.mozFullScreen &&
        !document.msFullscreenElement
      ) {
        console.log("pressed");
        $("body").removeClass("fullscreen-enable");
      }
    }
  }

  function initRightSidebar() {
    // right side-bar toggle
    $(".right-bar-toggle").on("click", function(e) {
      $("body").toggleClass("right-bar-enabled");
    });

    $(document).on("click", "body", function(e) {
      if ($(e.target).closest(".right-bar-toggle, .right-bar").length > 0) {
        return;
      }

      $("body").removeClass("right-bar-enabled");
      return;
    });
  }

  function initDropdownMenu() {
    $(".dropdown-menu a.dropdown-toggle").on("click", function(e) {
      if (
        !$(this)
          .next()
          .hasClass("show")
      ) {
        $(this)
          .parents(".dropdown-menu")
          .first()
          .find(".show")
          .removeClass("show");
      }
      var $subMenu = $(this).next(".dropdown-menu");
      $subMenu.toggleClass("show");

      return false;
    });
  }

  function initComponents() {
    $(function() {
      $('[data-toggle="tooltip"]').tooltip();
    });

    $(function() {
      $('[data-toggle="popover"]').popover();
    });
  }

  function initPreloader() {
    $(window).on("load", function() {
      $("#status").fadeOut();
      $("#preloader")
        .delay(350)
        .fadeOut("slow");
    });
  }

  function initSettings() {
    sessionStorage.setItem("is_visited", "light-mode-switch");
    if (window.sessionStorage) {
      var alreadyVisited = sessionStorage.getItem("is_visited");
      if (!alreadyVisited) {
        sessionStorage.setItem("is_visited", "light-mode-switch");
      } else {
        $(".right-bar input:checkbox").prop("checked", false);
        $("#" + alreadyVisited).prop("checked", true);
        updateThemeSetting(alreadyVisited);
      }
    }
    $("#light-mode-switch, #dark-mode-switch, #rtl-mode-switch").on(
      "change",
      function(e) {
        updateThemeSetting(e.target.id);
      }
    );
  }

  function updateThemeSetting(id) {
    if (
      $("#light-mode-switch").prop("checked") == true &&
      id === "light-mode-switch"
    ) {
      $("#dark-mode-switch").prop("checked", false);
      $("#rtl-mode-switch").prop("checked", false);
      $("#bootstrap-style").attr("href", "public/css/bootstrap.min.css");
      $("#app-style").attr("href", "public/css/app.min.css");
      sessionStorage.setItem("is_visited", "light-mode-switch");
    } else if (
      $("#dark-mode-switch").prop("checked") == true &&
      id === "dark-mode-switch"
    ) {
      $("#light-mode-switch").prop("checked", false);
      $("#rtl-mode-switch").prop("checked", false);
      $("#bootstrap-style").attr("href", "public/css/bootstrap-dark.min.css");
      $("#app-style").attr("href", "public/css/app-dark.min.css");
      sessionStorage.setItem("is_visited", "dark-mode-switch");
    } else if (
      $("#rtl-mode-switch").prop("checked") == true &&
      id === "rtl-mode-switch"
    ) {
      $("#light-mode-switch").prop("checked", false);
      $("#dark-mode-switch").prop("checked", false);
      $("#bootstrap-style").attr("href", "public/css/bootstrap.min.css");
      $("#app-style").attr("href", "public/css/app-rtl.min.css");
      sessionStorage.setItem("is_visited", "rtl-mode-switch");
    }
  }

  function init() {
    initMetisMenu();
    initLeftMenuCollapse();
    initActiveMenu();
    initMenuItem();
    initFullScreen();
    initRightSidebar();
    initDropdownMenu();
    initComponents();
    initSettings();
    initPreloader();
  }

  window.YR = {
    template : {
      alert : {
        delete : ``
      }
    },
    delete() {
      
      $("#deleteModal").modal("show");
    },
    alert(message) {
      if(message) $("#confirmModal .message").text(message);
      $("#confirmModal").modal("show");
    },
    init(){

    }
  }
  
  init();
})(jQuery);
