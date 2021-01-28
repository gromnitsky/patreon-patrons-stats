/* global chrome */
/** @jsx h */
import {h} from './node_modules/dom-chef/index.js'

document.addEventListener('DOMContentLoaded', main)

function main() {
    let patreon_data = chrome.tabs ? patreon_data_extension : patreon_data_mock
    patreon_data().then(render)
}

function patreon_data_extension() {
    return new Promise( (resolve, _reject) => {
        // get current tab
        chrome.tabs.query({currentWindow: true, active: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, 'popup', resolve)
        })
    })
}

function patreon_data_mock() {
    let json = new URL(window.location).searchParams.get('i')
    return fetch(`../../test/${json}`).then( v => v.json())
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

    let in_limbo = meta.patron_count - patrons
    let in_limbo_gross = gross_total - patrons_gross

    let total_patrons = patrons + in_limbo
    let total_gross = patrons_gross + in_limbo_gross

    // helpers
    let currency_name = tiers[0].attributes.currency
    let per = v => to_f((v / total_gross) * 100, 2)
    let cf = cents => Math.floor(cents / 100)

    let table_rows = tiers.map ( (tier, idx) => {
        let gross = tier.attributes.patron_amount_cents
        let patron_count = tier.attributes.patron_count
        return <tr key={idx}>
                 <td>{tier.attributes.title}</td>
                 <td dangerouslySetInnerHTML={{__html: tier.attributes.description}} />
                 <td>{cf(gross)}</td>
                 <td>{patron_count}</td>
                 <td>{cf(patron_count * gross)}</td>
                 <td>{per(patron_count * gross)}</td>
               </tr>
    })

    document.querySelector('#result').replaceWith(
        <table>
          <tr>
            <th>Tier Title</th>
            <th>Description</th>
            <th>{currency_name}</th>
            <th>Patrons</th>
            <th>Gross<br/>Income</th>
            <th title="of total gross income">%</th>
          </tr>

          {table_rows}

          <tr style={{borderTop: '1px solid darkgray'}}>
            <td></td>
            <td></td>
            <th>Total:</th>
            <td>{patrons}</td>
            <td>{cf(patrons_gross)}</td>
            <td></td>
          </tr>
          <tr>
            <td><i>In limbo</i></td>
            <td></td>
            <td></td>
            <td>{in_limbo}</td>
            <td>{cf(in_limbo_gross)}</td>
            <td>{per(in_limbo_gross)}</td>
          </tr>
          <tr style={{borderTop: '1px solid darkgray'}}>
            <td></td>
            <td></td>
            <th>Total:</th>
            <td>{total_patrons}</td>
            <td>{cf(total_gross)}</td>
            <td></td>
          </tr>
        </table>
    )
}

function to_f(value, precision) {
    let power = Math.pow(10, precision || 0)
    return String(Math.round(value * power) / power)
}

function get(obj, ...path) {
    return path.reduce( (acc, cur) => (acc && acc[cur]), obj)
}
