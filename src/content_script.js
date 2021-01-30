/*
  How it works:

  1. we create a <script src="content_script.pagescope.js"> tag & add
     it to document

  2. the added script sends a message to THIS content script with the
     value of 'window.patreon' global variable that it gets from
     patreon.com page--it can access it for it runs in the patreon.com
     scope

  3. we listen for a message form a popup & respond with the value of
     'patreon_data' variable
*/

/* global chrome */
let patreon_data

window.addEventListener("message", event => {
    // We only accept messages from ourselves
    if (event.source !== window) return
    if (event.data.msg === "patreon_data") patreon_data = event.data.payload
})

chrome.runtime.onMessage.addListener( (req, sender, res) => {
    if (req === 'popup') res(patreon_data)
})

inject('content_script.pagescope.js')
chrome.runtime.sendMessage("page_action") // ask to activate omnibox button

function inject(file) {
    let node = document.createElement('script')
    node.src = chrome.runtime.getURL(file)
    document.documentElement.appendChild(node)
}
