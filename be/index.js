const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');
let slotFound = 0

function poll() {
  https.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=664&date=12-05-2021', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      processData(JSON.parse(data))
      // console.log(JSON.parse(data).explanation);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}

function processData(obj) {
  console.log(JSON.stringify(obj))
  const list = obj && obj.centers || []
  for (let i = 0; i < list.length; ++i) {
    const conditionG = list[i].name.toLowerCase().indexOf('gsvm') >= 0
    const conditionK = (list[i].name.toLowerCase().indexOf('kalyanpur') >= 0 && list[i].name.toLowerCase().indexOf('44') < 0)
    || (list[i].name.toLowerCase().indexOf('iit kanpur') >= 0 && list[i].name.toLowerCase().indexOf('44') < 0)
    slotSaver(conditionG, list[i], '/dataG.csv', '/slotG.csv')
    slotSaver(conditionK, list[i], '/dataK.csv', '/slotK.csv')
    // if (condition) {
    //   const sessions = list[i].sessions
    //   sessions.forEach(element => {
    //     const data = `${new Date()},${element.date},${list[i].name},${element.available_capacity}\n`
    //     console.log(data)
    //     appendToFile(data, '/data.csv')
    //     if (element.available_capacity > 0) {
    //       appendToFile(data, '/slots.csv')
    //       slotFound=1
    //       // clearInterval(apiInterval)
    //     }
    //   });
    // }
  }
}

function slotSaver(condition, list, dataFile, slotFile){
  if (condition) {
    const sessions = list.sessions
    sessions.forEach(element => {
      const data = `${new Date()},${element.date},${list.name},${element.available_capacity},${list.pincode}\n`
      appendToFile(data, dataFile)
      if (element.available_capacity > 0) {
        console.log(data)
        appendToFile(data, slotFile)
        // slotFound=1
        playAudio()
        // clearInterval(apiInterval)
      }
    });
  }
}

function appendToFile(data, fileName) {
  fs.appendFileSync(__dirname + fileName, data, function (err) {
    if (err) throw err;
    console.log('Saved!s');
  });
}

function playAudio(){
  exec('afplay ./audio.mp3')
}

function start() {
  const api = setInterval(() => {
    poll()
    if (slotFound) {
      clearInterval(api)
    }
  }, 2000)
}

start();
