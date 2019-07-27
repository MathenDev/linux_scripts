
module.exports = {
    
    main: function (args = []) {
        let parsing = require('./args_parsing');
        console.log('Parsing arguments');
        let options = parsing.optionParse(args);
        console.log('Loading from:', options.file, 'encoding:', options.encoding);
        let data = loadData(options.file, options.encoding);
        console.log('Creating server');
        let server = createServer(data, (m, stt, url, date) => console.log([m, stt, url, date.toLocaleString()].join('\t')));
        server.addListener('listening', function () {
            console.log('Listenning at port', server.address().port);
        });
        server.listen(options.port);
    }
}

function loadData(file = '', encoding = '') {
    let fs = require('fs');
    let json = fs.readFileSync(file, encoding);
    return JSON.parse(json);
}

function doGet(data, path = [], params = {}) {
    for (let prop of path) {
        if (prop.length > 0) {
            data = data[prop];
            if (!data) {
                return data;
            }
        }
    };
    if (data instanceof Array) {
        if (params.random == 'true') {
            data = Array.from(data).sort(() => 0.5 - Math.random());
        }
        if (params.skip) {
            let skip = Number(params.skip);
            if (skip > 0) {
                data = data.slice(skip);
            }
        }
        if (params.limit) {
            let limit = Number(params.limit);
            if (limit > 0)
                data = data.slice(0, limit);
        }
    }
    return data;
}

function createServer(data = {}, onRequest = function (method = 'GET', statusCode = 200, url = '/', date = new Date()) { }) {
    let http = require('http');
    let parsing = require('./args_parsing');
    let server = http.createServer(function (request, response) {
        let requestTime = new Date();
        let statusCode = 0;
        let qu = request.url.indexOf('?');
        let pathString = request.url.slice(0, qu > -1 ? qu : undefined);
        let paramString = qu > -1 ? request.url.slice(qu + 1) : undefined;

        let params = paramString ? parsing.paramParse(paramString.split('&')) : {};

        switch (request.method) {
            case 'GET':
                let resBody = doGet(data, pathString.split('/'), params);
                if (resBody) {
                    let resJson = JSON.stringify(resBody);
                    response.writeHead(200, {
                        'Content-Length': resJson.length,
                        'Content-Type': 'text/json',
                    });
                    response.write(resJson);
                    statusCode = 200;
                }
                else {
                    response.writeHead(404);
                    statusCode = 404;
                }
                break;
        }
        response.end();
        onRequest(request.method, statusCode, request.url, requestTime);
    });
    return server;
}