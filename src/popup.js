document.addEventListener('DOMContentLoaded', main)

function main() {
    // get current tab
    chrome.tabs.query({currentWindow: true, active: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'popup', render)
    })
}

function render(patreon_data) {
    console.log(patreon_data)
}
