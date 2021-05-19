const https = require('https');
const sound = require("sound-play");
const prependFile = require('prepend-file');
const getUserInputs = require('./prompter');
const {getDate} = require('./utils');

let slotFound = 0
let playingAudio = false
const baseUrl = 'https://cdn-api.co-vin.in/api/v2'

function poll(url) {
  return new Promise((resolve, reject) => {
    https.get((baseUrl + url), (resp) => {
      let data = '';

      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        resolve(JSON.parse(data))
        // processData(JSON.parse(data))
        // console.log(JSON.parse(data).explanation);
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
  })
}

function processData(obj, places, below45) {
  // console.log(JSON.stringify(obj))
  console.log('Processing data at ', getDate())
  const list = obj && obj.centers || []
  for (let i = 0; i < list.length; ++i) {
    const conditionK = places.some(place => {
      return (
        list[i].name.toLowerCase().indexOf(place) >= 0 &&
        (
          below45 ? list[i].name.indexOf('18') > 0 : list[i].name.indexOf('18') < 0
        )
      )
    })
    slotSaver(conditionK, list[i], '/dataK.csv', '/slotK.csv')
  }
}

function slotSaver(condition, list, dataFile, slotFile){
  if (condition) {
    const sessions = list.sessions
    sessions.forEach(element => {
      const data = `${getDate()}, ${element.date}, ${list.name}, ${element.available_capacity}, ${list.pincode}\n`
      appendToFile(data, dataFile)
      if (element.available_capacity > 0) {
        console.log('Logging', element)
        appendToFile(data, slotFile)
        slotFound=1
      }
    });
    if (slotFound) {
      playAudio()
      playingAudio = true
    }
  }
}

function appendToFile(data, fileName) {
  prependFile.sync((__dirname + fileName), data)
}

function playAudio(){
  if (playingAudio) {
    return
  }
  sound.play('./audio.mp3');
  setTimeout(() => {
    playingAudio = false
  }, 20000)
}

async function startProgram() {
  const {stateName, districtName, date, below45, places} = await getUserInputs()
  const {states} = await poll('/admin/location/states')
  const state = states.find(state => state.state_name.toLowerCase().indexOf(stateName.toLowerCase()) >= 0)
  if (!state) {
    console.log('Wrong state name. Valid list are ', JSON.stringify(states.map(({state_name}) => state_name)), null, 2)
    process.exit(1)
  }
  const stateCode = state.state_id

  const {districts} = await poll(`/admin/location/districts/${stateCode}`)
  const district = districts.find(district => district.district_name.toLowerCase().indexOf(districtName.toLowerCase()) >= 0)
  if (!district) {
    console.log('Wrong district name')
    process.exit(1)
  }
  const districtCode = district.district_id
  startPolling({
    districtCode,
    date,
    below45,
    places
  })
}

let pollId = null

async function startPolling ({districtCode, date, below45, places}) {
  // console.log('start polling')
  try {
    // const data = await poll(`/appointment/sessions/public/calendarByDistrict?district_id=${districtCode}&date=${date}`)
    // processData(data, places, below45)
    pollId = setInterval(async () => {
        // if (slotFound) {
        //   clearInterval(pollId)
        // }
        const data = await poll(`/appointment/sessions/public/calendarByDistrict?district_id=${districtCode}&date=${date}`)
        processData(data, places, below45)
      }, 10000)
  } catch (error) {
    console.log(error)
    // process.exit(1)
  }
}

startProgram();
