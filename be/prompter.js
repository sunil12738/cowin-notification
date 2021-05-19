const prompt = require('prompt');
const {getDate} = require('./utils');
// aiims,gorakhnath,airforce,taramandal,jafra
let schema = {
  properties: {
    'stateName': {
      description: 'Enter state name',
      type: 'string',
      pattern: /^[a-zA-Z\s]+$/,
      message: 'State name must be only letters or spaces',
      required: true,
      default: 'uttar pradesh'
    },
    'districtName': {
      description: 'Enter district name',
      type: 'string',
      pattern: /^[a-zA-Z\s]+$/,
      message: 'District name must be only letters or spaces',
      required: true,
      default: 'gorakhpur'
    },
    'date': {
      description: 'Enter date in the format dd-mm-yyyy',
      pattern: /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/,
      message: 'Date must be valid in the format dd-mm-yyyy',
      required: true,
      default: getDate().split(' ')[0]
    },
    'below45': {
      description: 'Below 45 or above ?',
      type: 'boolean',
      default: true
    },
    'places': {
      description: 'Enter comma seperated name of places you want to check like > aiims,brd,jafra bazar,kora',
      type: 'string',
      required: true,
      before: function(value) {
        return value.split(',').map(name => name.trim() && name.toLowerCase())
      }
    }
  }
}

module.exports = function getUserInputs () {
  prompt.start();
  return new Promise ((resolve, reject) => {
    prompt.get(schema, function (err, result) {
      if (err) reject(err)

      console.log('Command-line input received:', result);
      resolve(result)
    });
  })
}