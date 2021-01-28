console.log('patreon-patrons-stats: extracting patreon data')
window.postMessage({ msg: "patreon_data", payload: window.patreon }, "*")
