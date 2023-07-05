jQuery(document).ready(function () {
  let guest = tbdemo_getCookie("tbdemo") ? false : true;
  tbdemo_showTypeform();
  if(guest){
    jQuery("body").addClass('tbdemo_guest');
  }else{
    jQuery("body").addClass('tbdemo_owner');
  }

  tbdemo_change_domain_id_url();

  jQuery(".tbdemo-circle-icon-content .tbdemo-share-button").parent().on("click", function () {
    jQuery(".tbdemo-big-popup, .tbdemo-big-popup-overlay").show();
  });
  jQuery(".tbdemo-sharebar-container-mobile .tbdemo-share-button").on("click", function () {
    jQuery(".tbdemo-big-popup, .tbdemo-big-popup-overlay").show();
  });
  jQuery(".tbdemo-big-popup-close, .tbdemo-big-popup-overlay, .tbdemo-button-promo-got-it").on("click", function () {
    jQuery(".tbdemo-big-popup, .tbdemo-big-popup-overlay").hide();
  });

  jQuery(".tbdemo-popup-copyied").on("click", function () {
    jQuery(this).html("Copied");
    let text_to_copy = "";
    let cont = jQuery(this).parent().find(".tbdemo-popup-text-to-copy");
    if ( typeof cont.data("text") != "undefined" ) {
      text_to_copy += cont.data("text") + " ";
    }
    text_to_copy += cont.html();
    navigator.clipboard.writeText(text_to_copy);
    setTimeout(tbdemo_resetToCopy, 2000, jQuery(this));
  });

  if (guest) {
    jQuery(".tf-v1-popover").hide();
    jQuery(".tbdemo-guest").show();
    jQuery(".twbb-pu-bottom-bar").hide();
    tbdemo_change_position();
  }
  else {
    jQuery(".tbdemo-owner").show();
    if (taa.is_home == 1) {
      // Auto open "One week free" popup once on scrolled Homepage up to 70%.
      jQuery(window).on("scroll", function () {
        let displayed_1wf = tbdemo_getCookie('tbdemo_1WF_' + taa.home_page_id);
        if ( !displayed_1wf && displayed_1wf === "" && tbdemo_amountscrolled() > 70) {
          tbdemo_setCookie('tbdemo_1WF_' + taa.home_page_id, true);
          jQuery(".tbdemo-edit-button").click();
        }
      });
    }
    else {
      // Auto open Typeform on all pages except Homepage for desktop every time until form submit .
      let displayed_typeform = tbdemo_getCookie('tbdemo_submitted_typeform_' + taa.home_page_id);
      if ( !displayed_typeform && displayed_typeform === "" ) {
        if (jQuery(window).width() > 860) {
          jQuery(".tf-v1-popover-button").click();
        }
      }
    }
  }
  /* Add a hover action to show Typeform tooltip.*/
  jQuery("#tf-v1-popover").hover(function () {
      jQuery(".tf-v1-popover.tbdemo-tooltip").show();
    },
    function () {
      jQuery(".tf-v1-popover.tbdemo-tooltip").hide();
    });

  if ( tbdemo_getCookie("tbdemo_first_time") ) {
    jQuery(".tbdemo-circle-icon.tbdemo-edit").parent().addClass("tbdemo-circle-open tbdemo-first-time");
    jQuery( window ).scroll(function() {
      jQuery(document).find('.tbdemo-first-time').removeClass("tbdemo-first-time tbdemo-circle-open");
    });
  }

  jQuery(".tbdemo-circle-icon-border:not(.tbdemo-circle-icon-border-typform)").mouseenter(function() {
      jQuery(this).addClass('tbdemo-circle-open');
  }).mouseleave(function() {
    if( jQuery(this).hasClass('tbdemo-first-time')) return;
    jQuery(this).removeClass('tbdemo-circle-open');
  });

  jQuery(".tbdemo-circle-icon-content .tbdemo-edit-button, .tbdemo-customize-edit-button").on("click", function() {
    tbdemo_show_upgrade_popup();
  });

  jQuery(".tbdemo-sharebar-container-mobile .tbdemo-edit-button").on("click", function() {
    tbdemo_show_upgrade_popup();
  });

  jQuery(".tbdemo-madebar-border-container").show();

  jQuery(".tf-v1-popover-button").on('click', function () {
    tbdemo_setCookie('tbdemo_displayed_typeform', true);
  });

  jQuery(".twbb-pu-upgrade-layout, .twbb-pu-upgrade-close").on("click", function() {
     jQuery("html").removeAttr("style");
  })

  let window_size = jQuery(window).width();
  if( window_size < 550 ) {
    tbdemo_swipePrice( window_size )
  }

  jQuery(document).find(".tbdemo-popup-share-button").on({
    mouseenter: function () {
      jQuery(this).find(".tbdemo-popup-share-button-tooltip").show();
    },
    mouseleave: function () {
      jQuery(this).find(".tbdemo-popup-share-button-tooltip").hide();
    }
  });
});

function tbdemo_show_upgrade_popup() {
  jQuery(".twbb-pu-upgrade-layout, .twbb-pu-upgrade-container").removeAttr("style").removeClass("twbb-pu-hidden");
  twbb_pu_run_video(jQuery(".twbb-pu-video-active"));
  jQuery("html").css("overflow", "hidden");
}

function tbdemo_showTypeform(){
  var wrapperElement = document.getElementById('tf-v1-popover');
  if ( typeof wrapperElement == "undefined" || wrapperElement == null ) {
    jQuery(".tbdemo-circle-icon-border-typform").css("visibility", "hidden");
    return;
  }
  var formId = "cVkeS1iz";
  window.tf.createPopover(
    formId,
    {
      container: wrapperElement,
      hideHeaders: true,
      hideFooter: true,
      autoClose: 3000,
      customIcon: "https://images.typeform.com/images/7BGNBNtFKvBc",
      hidden: {
        site_url: window.location.href,
      },
      onSubmit: (event) => {
        tbdemo_setCookie('tbdemo_submitted_typeform_' + taa.home_page_id, true);
      },
      onReady: (event) => {
        // Disable tooltip.
        jQuery(".tbdemo-tooltip").removeClass("tf-v1-popover").hide();
      },
      onClose : (event) => {
        // Enable tooltip.
        jQuery(".tbdemo-tooltip").addClass("tf-v1-popover");
      },
    },
  )
}

function tbdemo_change_url_param( url, param, value ) {
  url = new URL(url);
  let search_params = url.searchParams;
  search_params.set(param, value);
  url.search = search_params.toString();
  return url.toString();
}

function tbdemo_swipePrice( window_size ) {
  jQuery(".tbdemo-upgrade-price-content").on("swipeleft", function (e) {
    e.preventDefault();
    let left = jQuery(window).width() - 575;
    jQuery(this).animate({"left": left + "px"});
  });
  jQuery(".tbdemo-upgrade-price-content").on("swiperight", function (e) {
    e.preventDefault();
    jQuery(this).animate({"left": "15px"});
  });
}

function tbdemo_amountscrolled(){
  var winheight= window.innerHeight || (document.documentElement || document.body).clientHeight;
  var docheight = tbdemo_getDocHeight();
  var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
  var trackLength = docheight - winheight;
  return Math.floor(scrollTop/trackLength * 100);
}

function tbdemo_getDocHeight() {
  var D = document;
  return Math.max(
    D.body.scrollHeight, D.documentElement.scrollHeight,
    D.body.offsetHeight, D.documentElement.offsetHeight,
    D.body.clientHeight, D.documentElement.clientHeight
  )
}

jQuery(window).resize(function () {
  let guest = tbdemo_getCookie("tbdemo") ? false : true;
  if (guest) {
    tbdemo_change_position();
  }
});

function tbdemo_change_position() {
  if (jQuery(window).width() <= 860 ) {
    jQuery("body").css("padding-top", "128px");
  }
  else {
    jQuery("body").css("padding-top", "60px");
  }
}


function tbdemo_change_domain_id_url() {
  if( typeof twbb_sidebar_vars === 'undefined' ) return;
  let str = twbb_sidebar_vars.upgrade_url;


  const regex = /websites\/(\d+)\//gm;

  let m;
  let domain_id = tbdemo_getCookie("tbdemo_domain_id");
  if (!domain_id) {
    return;
  }

  let mathch1 = "";
  let mathch2 = "";
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    mathch1 = m[0];
    mathch2 = m[1];
  }

  twbb_sidebar_vars.upgrade_url = str.replace(mathch1, mathch1.replace(mathch2, domain_id));
}

function tbdemo_setCookie(cname, cvalue, exdays) {
  if ( typeof exdays == "undefined" ) {
    var exdays = 3650;
  }
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function tbdemo_getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
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

function tbdemo_resetToCopy( that ) {
  jQuery(that).html("Copy");
}

/**
 * Run the loader for the given button.
 * @param that
 */
function tbdemo_run_loader(that) {
  if( !that.hasClass("tbdemo-button-disabled") ) {
    return;
  }
  that.addClass("tbdemo-button-loading");
  setTimeout(function () {
    that.removeClass("tbdemo-button-loading tbdemo-button-disabled");
  }, 2000);
}
