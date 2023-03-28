module.exports = function sendAll(array, job) {
    let index = 0;
    function next() {
        if (index < array.length) {
            return job(array[index++]).then(function() {
                return delay(1000).then(next);
            });
        }        
    }
    return Promise.resolve().then(next);
}