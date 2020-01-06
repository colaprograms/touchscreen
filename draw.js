//draw.js

let emptydiv = function(id) { return `<div id="${id}"></div>`; }

var lcars_count = 0;

var LCARS_LIMIT = 20;

var lcars_highlight_timer = undefined;

var set_lcars_highlight_timer = function(t) {
  lcars_highlight_timer = performance.now() + t;
  $("#lcarslist").addClass("highlight");
  requestAnimationFrame(check_lcars_highlight_timer);
}

var check_lcars_highlight_timer = function() {
  if(lcars_highlight_timer === undefined)
    return;
  if(performance.now() >= lcars_highlight_timer) {
    $("#lcarslist").removeClass("highlight");
    lcars_highlight_timer = undefined;
  }
  else {
    requestAnimationFrame(check_lcars_highlight_timer);
  }
}

let add_lcars_reference = function(text) {
  let lcarslist = $("#lcarslist");

  lcars_count++
  if(lcars_count > LCARS_LIMIT)
    lcarslist.children().last().remove();

  lcarslist.children().first().removeClass("lcarscurren");

  let lcarsnew = $(`<div class='lcarsoutput'></div>`);
  lcarsnew.text(text)

  lcarsnew.addClass("lcarscurren");
  
  lcarslist.prepend(lcarsnew);

  $("#lcarslist").addClass("highlight");
  set_lcars_highlight_timer(200);
}


let makenav = function() {
  let navigation = $("#nav");
  let navtext = "RANDOM BOOK";
  navigation.html(`
    <div id="navheader">${navtext}</div>
    <div id="lcarslist"></div>
    <div id="lcarslogo">
      <div id="lcarstext">
          LIBRARY COMPUTER ACCESS AND RETRIEVAL SYSTEM
      </div>
    </div>
  `);
  $("#navheader").click(function(e) {
    random_book_request();
  });
}

let makebod = function() {
  let body = $("#body");
  console.log(body);
  body.html(
    emptydiv("bodydraw")
  );
}

let set_body_to_text = function(text) {
  $("#bodydraw").html("<pre id='bodydrawtext'></pre>")
  $("#bodydrawtext").text(text);
}

let set_book = function(data) {
  /* data format:
   *
   * error 1:
   * {
   *   error: ["http", code, reason, headers]
   * }
   *
   * error 2: record.py threw an exception while parsing stuff
   * {
   *   error: ["parsing", (traceback)]
   * }
   *
   * success:
   * {
   *   error: None
   *   fields: [["dog", ["fantastic dog"]], ["frog", ["frog, tolerable"]]],
   * }
   */
  if(data.error) {
    if(data.error[0] == "http") {
      makeerror_http(data);
    }
    else if(data.error[0] == "parsing") {
      makeerror_parsing(data);
    }
    else {
      set_body_to_text(`Unknown error type:\n\n${JSON.stringify(data)}`);
      $("#bodydraw_json").text(JSON.stringify(data));
    }
  }
  else if(data.fields.length == 0) {
    retrysoon = true;
    add_lcars_reference(`${data.recordnumber} [INVALID]`);
  }
  else {
    set_blinking(false);
    $("#bodydraw").html("<div id='fields'></div>");
    let fields = $("#fields");
    console.log(data);
    data.fields.forEach(function(field, idx) {
      /*
      console.log(field);
      let fieldob = $("<div class='field'></div>");
      fieldob.append(`<div class='fieldname'>${field[0]}</div>`);
      field[1].forEach(function(data, dataidx) {
        fieldob.append(`<div class='fielddata'>${data}</div>`);
      });
      fields.append(fieldob)
      */
      if(idx > 0) {
        fields.append(`<div class='fieldspac'></div>`);
      }
      let name = field[0].replace(/\xa0/g, " ").toUpperCase();
      console.log("name:", name);
      let fieldname = $(`<div class='fieldname'>${name}</div>`);
      fields.append(fieldname);
      field[1].forEach(function(data, dataidx) {
        console.log("data:", data);
        fields.append(`<div class='fielddata'>${data}</div>`);
      });
    });
    add_lcars_reference(`${data.recordnumber}`);
  }
  console.log(data);
}

let showtexterror = function(status) {
  $("#bodydraw").html(`
    <div id="bodyerror">${status}</div>
  `);
}

const RELOAD_IMMEDIATELY = Infinity;
const BOOKCHANGE_INTERVAL = 600;
const RETRY_INTERVAL = 10;
var retrysoon = false;
var seconds = Infinity;
var blinking = false;

var set_blinking = function(z) {
  if(z) {
    if(!blinking) {
      $("#navheader").addClass("navheaderload");
      blinking = true;
    }
  }
  else {
    if(blinking) {
      $("#navheader").removeClass("navheaderload");
      blinking = false;
    }
  }
}

let random_book_request = function() {
  if(blinking === false) {
    $("#navheader").addClass("navheaderload");
    seconds = Infinity;
  }
}

let bookchanger = function() {
  seconds++;

  if(retrysoon)
    timeout = RETRY_INTERVAL;
  else
    timeout = BOOKCHANGE_INTERVAL;
  if(seconds < timeout)
    return;

  seconds = 0;
  retrysoon = false;
  set_blinking(true);
  const URL = "/getrecord";

  let ajax = function() {
    $.ajax(URL)
     .done(function(data) { set_book(data) })
     .fail(function(jqxhr, status, error) {
      showtexterror(status);
     });
  };

  let sandboxisopen = function() {
    let d = new Date();
    let w = d.getDay();
    let h = d.getHours();

    let isweekend = (w == 0) || (w == 6);
    let isinhours = (h >= 10) && (h < 18);
    return isinhours && !isweekend;
  }

  let wait_for_opening = function() {
    if(sandboxisopen()) {
      ajax();
    }
    else {
      set_body_to_text(`Sandbox is closed, no random book for now`);
    }
  };

  /* allow it to blink for at least 600 ms */
  setTimeout(wait_for_opening, 600);
};

let bcstart = function() {
  setTimeout(bookchanger, 0);
  setInterval(bookchanger, 1000);
};

let start = function() {
  $("body")
    .html(
      emptydiv("nav") +
      emptydiv("body")
    );
  makenav()
  makebod()
  bcstart()
};

$(start);

