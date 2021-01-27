/*
  How it works:

  1. we create a <script> tag & fill it with patreon_data_get() function
  2. add the <script> tag to document
  3. the function inside the <script> tag sends a message
     to THIS content script with the value of 'window.patreon' global variable
     that it gets from patreon.com page--it can access it for it runs in
     the patreon.com scope
  4. we listen for a message form a popup; we respond with
     the value of 'patreon_data' variable
*/

let patreon_data

window.addEventListener("message", event => {
    // We only accept messages from ourselves
    if (event.source !== window) return
    if (event.data.msg === "patreon_data") patreon_data = event.data.payload
})

chrome.runtime.onMessage.addListener( (req, sender, res) => {
    if (req === 'popup') res(patreon_data)
})

inject(patreon_data_get)
chrome.runtime.sendMessage("page_action") // ask to activate omnibox button

function patreon_data_get() {
    console.log('patreon-patrons-stats: extracting patreon data')
    window.postMessage({ msg: "patreon_data", payload: window.patreon }, "*")
}

function inject(fn) {
    let node = document.createElement('script')
    node.text = `(${fn.toString()})();`
    document.documentElement.appendChild(node)
}
