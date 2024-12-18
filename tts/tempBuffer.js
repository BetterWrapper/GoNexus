const tempBuffers = {};

module.exports = {
    get(id) {
        return tempBuffers[id];
    },
    set(id, buffer) {
        tempBuffers[id] = buffer;
    }
}