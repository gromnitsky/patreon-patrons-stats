document.addEventListener('DOMContentLoaded', main)

function main() {
    let patreon_data = chrome.tabs ? patreon_data_extension : patreon_data_mock
    patreon_data().then(render)
}

function patreon_data_extension() {
    return new Promise( (resolve, reject) => {
        // get current tab
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, 'popup', resolve)
        })
    })
}

function patreon_data_mock() {
    return fetch('../test/patreon_data.json').then( v => v.json())
}

function render(patreon_data) {
    let tiers = (get(patreon_data, 'bootstrap', 'campaign', 'included') || [])
        .filter( v => 'patron_count' in v.attributes)
    if (!tiers.length) return

    let meta = patreon_data.bootstrap.campaign.data.attributes
    let gross_total = meta.pledge_sum

    let patrons = tiers.reduce( (acc, cur) => {
        return cur.attributes.patron_count + acc
    }, 0)
    let patrons_gross = tiers.reduce( (acc, cur) => {
        let gross = cur.attributes.patron_amount_cents
        let patron_count = cur.attributes.patron_count
        return acc + (patron_count * gross)
    }, 0)
    let untitled_gross = gross_total - patrons_gross
    let untitled = meta.patron_count - patrons

    let total_patrons = patrons + untitled
    let total_gross = patrons_gross + untitled_gross

    let currency_name = tiers[0].attributes.currency
    let per = v => to_f((v / total_gross) * 100, 2)
    let r = [`<table><tr><th>Tier Title</th><th>Description</th><th>${currency_name}</th><th>Patrons</th><th>Gross<br>Income</th><th>%</th></tr>`]
    tiers.forEach( tier => {
        let gross = tier.attributes.patron_amount_cents
        let patron_count = tier.attributes.patron_count
        r.push('<tr>')
        r.push(`<td>${tier.attributes.title}</td>`)
        r.push(`<td>${tier.attributes.description}</td>`)
        r.push(`<td>${cf(gross)}</td>`)
        r.push(`<td>${patron_count}</td>`)
        r.push(`<td>${cf(patron_count * gross)}</td>`)
        r.push(`<td>${per(patron_count * gross)}</td>`)
        r.push('</tr>')
    })

    r.push(`<tr><td></td><td></td><td>Total:</td><td>${patrons}</td><td>${cf(patrons_gross)}</td></tr>`)
    r.push(`<tr><td>In limbo</td><td></td><td></td><td>${untitled}</td><td>${cf(untitled_gross)}</td><td>${per(untitled_gross)}</td></tr>`)
    r.push(`<tr style="border-top: 1px solid darkgray"><td></td><td></td><th>Total:</th><td>${total_patrons}</td><td>${cf(total_gross)}</td></tr>`)
    r.push('</table>')

    document.querySelector('#result').innerHTML = r.join`\n`
}

function cf(cents) { return Math.floor(cents / 100) }

function to_f(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

function get(obj, ...path) {
    return path.reduce( (acc, cur) => (acc && acc[cur]), obj)
}
