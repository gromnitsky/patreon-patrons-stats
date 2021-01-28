/* global chrome */

chrome.runtime.onMessage.addListener( (req, sender, _res) => {
    // activate omnibox button
    if (req === 'page_action') chrome.action.enable(sender.tab.id)
})
