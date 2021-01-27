window.addEventListener("message", event => {
    // We only accept messages from ourselves
    if (event.source !== window) return
    if (event.data.msg && event.data.msg === "patreon_data")
        chrome.runtime.sendMessage(event.data) // finally, sent to event_page
})

inject(patreon_data)
chrome.runtime.sendMessage({ msg: "page_action" }) // activate omnibox button

function patreon_data() {
    console.log('patreon-patrons-stats: sending patreon data')
    window.postMessage({ msg: "patreon_data", payload: window.patreon }, "*")
}

function inject(fn) {
    let node = document.createElement('script')
    node.text = `(${fn.toString()})();`
    document.documentElement.appendChild(node)
}
