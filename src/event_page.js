chrome.extension.onMessage.addListener( (req, sender, res) => {
    // activate omnibox button
    if (req === 'page_action') chrome.pageAction.show(sender.tab.id)
})
