
function getDate () {
  let ts = Date.now();

  let date_ob = new Date(ts);
  let date = date_ob.getDate();
  let month = date_ob.getMonth() + 1;
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  month = month / 10 < 1 ? `0${month}` : month
  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();

  // prints date & time in YYYY-MM-DD format
  return (date + "-" + month + "-" + year + "  " + hours + ":" + minutes + ":" + seconds)
}

module.exports.getDate = getDate