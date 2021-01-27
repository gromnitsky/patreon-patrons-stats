let patreon_data

chrome.extension.onMessage.addListener( (req, sender, res) => {
    console.log(1)

    switch (req.msg) {
    case 'popup':               // from popup.html
        res(patreon_data)
        break
    case 'patreon_data':        // from content_script
        patreon_data = req.payload
        break
    case 'page_action':
        chrome.pageAction.show(sender.tab.id)
        break
    }
})
