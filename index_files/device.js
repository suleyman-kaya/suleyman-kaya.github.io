jQuery(window).load( function () {
  if ( window.self === window.top && window.innerWidth > 860 ) {
    let guest = tbdemo_getCookie("tbdemo") ? false : true;
    devicebar();
    setTimeout(function () {
      url = tbdemo_add_url_param( window.location.href, 'tbdemo_iframe', '1');
      let top_height = guest ? 60 : 0;
      let height = "";
      let buttons_container = jQuery('.tbdemo-devicebar-border');
      if (buttons_container) {
        let height_px = parseInt(buttons_container.css("bottom")) + parseInt(buttons_container.css("height")) + 20 + top_height;
        height = "height: calc(100% - " + height_px + "px);";
      }
      jQuery("body").append("<div class='tbdemo-device-layer' style='display: none'></div><iframe src='" + url + "' id='tbdemo-device-iframe'  style='display: none; top: "+top_height+"px;"+height+"'></iframe>");
      jQuery('#tbdemo-device-iframe').load(function () {
        let iframe = jQuery('#tbdemo-device-iframe').contents();
        iframe.find('#wpadminbar').css("display", "none");
        iframe.find('.menu-item a, .elementor-heading-title a').click(function (event) {
          let url = tbdemo_add_url_param( jQuery(this).attr("href"), 'tbdemo_iframe', '1');
          jQuery(this).attr("href", url);
        });
      });
      jQuery(document).on("click", ".tbdemo-device-mobile", function () {
        if (jQuery(this).hasClass("tbdemo-device-active")) {
          return
        }
        /* Hide main content scroll */
        jQuery(document).find("html").css("overflow-y", "hidden");
        jQuery(document).find(".tbdemo-device-layer, #tbdemo-device-iframe").show();
        /* Make device icon active */
        jQuery(document).find(".tbdemo-device-active").removeClass("tbdemo-device-active");
        jQuery(this).addClass("tbdemo-device-active");
        /* Animate mobile iframe to the center of window */
        let window_width = jQuery(window).width();
        jQuery(document).find('#tbdemo-device-iframe').animate({
          width: '360px',
          left: (window_width / 2 - 180) + 'px',
        }, 100);
      });
    }, 1000);
  }

  jQuery(document).on("click", ".tbdemo-device-laptop", function() {
    if( jQuery(this).hasClass("tbdemo-device-active") ) {
      return
    }

    jQuery(document).find(".tbdemo-device-active").removeClass("tbdemo-device-active");
    jQuery(this).addClass("tbdemo-device-active");
    jQuery(document).find('#tbdemo-device-iframe').animate({
      left: '0%',
      width:'100%'
    });
    setTimeout(function () {
      jQuery(document).find(".tbdemo-device-layer, #tbdemo-device-iframe").hide();
      jQuery(document).find("html").removeAttr("style");
    }, 100);

  });

  jQuery(document).find(".tbdemo-devicebar i").on({
    mouseenter: function () {
      jQuery(this).find("span").show();
    },
    mouseleave: function () {
      jQuery(this).find("span").hide();
    }
  });
})

jQuery(window).resize(function() {
  let window_width = jQuery(window).width();
  jQuery(document).find('#tbdemo-device-iframe').css({
    width:'360px',
    left: (window_width/2-180)+'px',
  });

  let left = document.body.offsetWidth/2-45;
  jQuery(document).find('.tbdemo-devicebar-border').css("left", left+"px");

});

function tbdemo_add_url_param( url, param, value) {
     let link = new URL(url);
     let search_params = link.searchParams;
     search_params.set(param, value);
     link.search = search_params.toString();
     link = link.toString();
     return link;
}

function devicebar() {
  /* Need to count offsetWidth as device bar position is changing when we hide scroll from the main window */
 let left = document.body.offsetWidth/2-45;
 let devicebar = "<div class='tbdemo-devicebar-border' style='left: "+left+"px'><div class='tbdemo-devicebar'>";
  devicebar += "<i class='tbdemo-device-laptop tbdemo-device-active eicon-device-laptop'><span class='tbdemo-devicebar-tooltip' style='display:none'>Desktop</span></i>";
  devicebar += "<i class='tbdemo-device-mobile eicon-device-mobile'><span class='tbdemo-devicebar-tooltip' style='display:none'>Mobile</span></i>";
  devicebar += "</div></div>";
  jQuery("body").append(devicebar);

}
