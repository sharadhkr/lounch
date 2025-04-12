const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000
const server = http.createServer(app);
const fs = require('fs');
console.log('Files in models folder:', fs.readdirSync(__dirname + '/models'));


server.listen(port, () =>{
    console.log(`Server is running on port ${port}`);
})