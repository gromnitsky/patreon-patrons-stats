document.addEventListener('DOMContentLoaded', main)

function main() {
    chrome.runtime.sendMessage({msg: 'popup'}, render)
}

function render(patreon_data) {
    console.log(patreon_data)
}
