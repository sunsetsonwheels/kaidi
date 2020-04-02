'use strict'

if (settings.get('theme') === 'dark') {
  document.body.style.backgroundColor = '#363636'
}

function handleLocationChange () {
  switch (window.location.hash) {
    case '#home':
      window.location.assign('/home.html')
      break
    case '#player':
      window.location.assign('/player.html')
      break
    case '#settings':
      window.location.assign('/settings.html')
      break
    default:
      window.alert('[handleLocationChange] Specified hash invalid. You will be redirected home.')
      window.location.assign('/home.html')
      break
  }
}

document.addEventListener('DOMContentLoaded', () => {
  var isAdsEnabled = settings.get('ads')
  if (isAdsEnabled === 'true') {
    getKaiAd({
      publisher: '4c1c949f-8463-4551-aa6b-c1b8c1c14edc',
      app: 'Kaidi Remote (Beta)',
      slot: window.location.hash,
      timeout: 2000,
      onerror: err => {
        console.error('Ad display error: ' + err)
        handleLocationChange()
      },
      onready: ad => {
        document.body.style.opacity = 1
        ad.call('display')
        ad.on('close', () => handleLocationChange())
      }
    })
  } else if (isAdsEnabled === null) {
    settings.set('ads', 'true')
    navigator.mozL10n.formatValue('text-ad-disclaimer').then((text) => {
      window.alert(text)
      handleLocationChange()
    }).catch(() => {
      window.alert("Hello, it looks like it's your first time here. We show ads for monetization purposes, but if you want to opt out of ads, go to: Settings -> Enable monetization.")
      handleLocationChange()
    })
  } else {
    handleLocationChange()
  }
})
