// vue.config.js
const settings = require('standard-settings').getSettings()

module.exports = {
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: './',
      mainProcessWatch: [
        'settings/settings.default.json',
        'settings/settings.json',
        settings.settings || 'settings/settings.json'
      ],
      builderOptions: {
        extraFiles: 'settings/'
      }
    }
  }
}
