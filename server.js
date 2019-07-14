var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var env = require('node-env-file');
const fetch = require('node-fetch');
const log = require('./logger');
const FormData = require('form-data');
var port = 3000;
env(__dirname + '/.env');

io.on('connection', socket => {
    log.info('New user connected IP:' + socket.handshake.address);
    const sendEmit = (event, data) => {
        log.info('broadcast emit event:' + event);
        socket.broadcast.emit(event, data);
    };

    const actionFetch = (event, url) => {
        fetch(url).then(response => response.json()).then(data => {
            log.fatal('broadcast emit event:' + event);
            if (data.data.order_complte) {
                log.info(data)
                sendEmit(event, data);
            }
        });
    };

    socket.on('checkOrderChemo', (data) => {
        const params = new URLSearchParams({
            visit_id: data.visit_id
        });
        let mainUrl = process.env.backendUrl + 'api/public-thai-his/order-chemo-complte?' + params
	    log.info(mainUrl);
        actionFetch('newOrderChemo', mainUrl);
    });

    socket.on('disconnect', function () {
        log.info('disconnected server');
        io.emit('disconnected', { 'message': 'Bey' });
    });

    const edcFetchPost = (url,data) => {
        //"app_code":"042722830","action":"APPROVED","trace":"007874","date":"190712","time":"154507","cid":"000148xxxxxx2304"
        
        let formData = new FormData();
        formData.append('token', '53d17e512d809d68524c057e9103c040');
        formData.append('receipt_mas_id', data.receipt_mas_id);
        formData.append('receipt_approved_code', data.app_code);
        formData.append('receipt_approved_trace', data.trace);
        formData.append('receipt_approved_date', data.date);
        formData.append('receipt_approved_time', data.time);
        formData.append('receipt_approved_cid', data.cid);
        console.log(formData);
        log.info(data);
        fetch(url,{
            method: 'POST',
            body: formData
        }).then(response => response.json()).then(data => {
            console.log(data);
            log.info(data);
        });
    };

    socket.on('edc_send_apporve', (data) => {
        let mainUrl = process.env.backendUrl + 'restfull/restfull2/update-receipt-byedc'
	    log.info(mainUrl);
        edcFetchPost(mainUrl,data);
    });

    socket.on('edc_receive_order', (data) => {
        sendEmit('edc_receive_order', data);
    });
});

http.listen(port, function () {
    log.trace('server start in port http://localhost:' + port);
});
