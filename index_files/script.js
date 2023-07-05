jQuery(document).ready(function () {
  jQuery(".tbdemo-customize-button").on('click', function () {
    jQuery(document).find(".tbdemo-customize-container").show();
    document.cookie = "tbdemo_customise_open=1; path=/";
  });

  jQuery(".tbdemo-customize-close").on('click', function () {
    jQuery(document).find(".tbdemo-customize-container").hide();
    document.cookie = "tbdemo_customise_open=0; path=/";
  });

  let tbdemo_theme = getCookie('tbdemo_theme');
  if( tbdemo_theme != "" ) {
      change_kit_theme( tbdemo_theme );
      /* Do not show in mobile iframe */
      if ( window.self === window.top ) {
        /* Automatically show customise popup only if it was opened in previous page */
        if ( getCookie('tbdemo_customise_open') == 1 ) {
          jQuery(document).find(".tbdemo-customize-container").show();
        }
        jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
        jQuery(".tbdemo-theme-item.tbdemo-"+tbdemo_theme.toLowerCase()).addClass("tbdemo-theme-selected");
      }
  } else {
      /* Active theme in all_kit.json */
      jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
      jQuery(".tbdemo-theme-item.tbdemo-"+tbdemo.active_theme).addClass("tbdemo-theme-selected");
  }


  jQuery(".tbdemo-theme-item").on('click', function () {
    jQuery(".tbdemo-theme-item").removeClass("tbdemo-theme-selected");
    jQuery(this).addClass("tbdemo-theme-selected");
    let theme = jQuery(this).data('key');
    document.cookie = "tbdemo_theme=" + theme + "; path=/";
    change_kit_theme( theme );
  });
});

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function change_kit_theme( theme ) {
  if( typeof tbdemo.kitSettings[theme] === 'undefined') {
    return;
  }
  let kitSettings = tbdemo.kitSettings[theme];
  let id;
  let iframeBody = jQuery("#tbdemo-device-iframe").contents().find("body");
  for (const key in kitSettings) {
    if( key == "system_typography" || key == "custom_typography" ) {
        kitSettings[key].forEach( function( el ) {
          let id = el['_id'];
          let font_size = el['typography_font_size']["size"]+el['typography_font_size']["unit"];
          jQuery('body').css('--e-global-typography-' + id + '-font-family', el['typography_font_family']);
          jQuery('body').attr("tbdemo_theme", theme);
          /* For changing styles in mobile view iframe */
          if( iframeBody.length ) {
            iframeBody.css('--e-global-typography-' + id + '-font-family', el['typography_font_family']);
            iframeBody.attr("tbdemo_theme", theme);
          }
        });
    }
    else if( key !== "front_data" ) {
        kitSettings[key].forEach( function( el ) {
          let id = el['_id'];
          jQuery('body').css( '--e-global-color-'+id , el['color'] );
          /* For changing styles in mobile view iframe */
          if( iframeBody.length ) {
            iframeBody.css( '--e-global-color-'+id , el['color'] );
          }
        });
    }
  };

}
