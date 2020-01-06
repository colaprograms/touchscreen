// libr.js
// pull a random book record and show it

(function() {
  // the book record range (both ends are inclusive)
  let RN_LOW = 1000001;
  let RN_HIGH = 3835994;

  let random_rec = function() {
    return Math.floor(Math.random() * (RN_HIGH - RN_LOW + 1)) + RN_LOW;
  }

  let recordurl = function(rn) {
    return "https://mercury.concordia.ca/search/?searchtype=.&searcharg=" +
      `b${rn}`;
  }

  window.random_rec = random_rec;
  window.recordurl = recordurl;
})();

