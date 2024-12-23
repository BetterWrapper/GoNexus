const { JSDOM } = require('jsdom');
const axios = require('axios');
const parseTable = require('../helpers/parseTable')

exports.getArtistInfo = async (artistUrl) => {
    if (typeof artistUrl != 'string') artistUrl = artistUrl.url;
    const { data: html } = await axios.get(`https://ncs.io${artistUrl}`, {
        responseType: 'text'
    });

    const dom = new JSDOM(html);
    const document = dom.window.document.body;

    const infoEl = document.querySelector('.details .info');
    const name = infoEl.querySelector('h5').innerHTML;
    const genres = infoEl.querySelector('.tags').innerHTML.split(', ');
    const img = document.querySelector('.img').getAttribute('style').trim().replace("background-image: url('", '').replace("')", '');

    const fearuredEl = document.querySelector('.featured tbody');
    const featured = !fearuredEl ? [] : parseTable(fearuredEl);

    const songsEl = fearuredEl ? document.querySelectorAll('.table tbody')[1] : document.querySelector('.table tbody');
    const songs = parseTable(songsEl);

    return {
        name,
        url: artistUrl,
        img,
        genres,
        featured,
        songs
    }
}
