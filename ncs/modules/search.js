const { JSDOM } = require('jsdom')
const axios = require('axios');
const parseTable = require('../helpers/parseTable');

exports.search = async (filter, page = 0) => {
    const { data: html } = await axios.get(`https://ncs.io/music-search?page=${page + 1}${filter.genre ? `&genre=${filter.genre}` : ''}${
        filter.mood ? `&mood=${filter.mood}` : ''
    }${filter.search ? `&q=${filter.search}` : ''}${
        filter.version ? `&version=${filter.version == 'both' ? 'regular-instrumental' : filter.version}` : ''}`, {
            responseType: 'text'
        }
    );
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const table = document.querySelector('.tablesorter tbody');
    const songs = parseTable(table);
    return songs;
}
