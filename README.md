# Socket-Server

## How to use
<pre>npm install</pre>

#client
let socket = io.connect('http://serverip:port', {reconnect: true});
//send order
socket.emit('checkOrderChemo', sendData);
//receive order
socket.on('checkOrderChemo', sendData);
