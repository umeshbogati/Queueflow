const http = require('http');
const data = JSON.stringify({name:'umesh', email:'umesh20@example.com', password:'umesh@1234'});
const options={hostname:'127.0.0.1', port:5000, path:'/api/auth/register', method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}};
const req = http.request(options, res=>{let resp=''; res.on('data',d=>resp+=d); res.on('end',()=>console.log(resp))}); req.on('error',e=>console.error('REQ_ERR',e)); req.write(data); req.end();
