const { search } = require('./search');

exports.getSongs = async (page = 0) => {
    return await search({}, page)
}
