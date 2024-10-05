const connect = require('connect');
const url = require('url');

function calculate(req, res, next) {
    const query = url.parse(req.url, true).query; 
    const method = query.method; 
    const x = parseFloat(query.x); 
    const y = parseFloat(query.y); 

    let reslt; 
    let oprt; 

    switch (method) {
        case 'add':
            reslt = x + y;
            oprt = '+';
            break;
        case 'subtract':
            reslt = x - y;
            oprt = '-';
            break;
        case 'multiply':
            reslt = x * y;
            oprt = '*';
            break;
        case 'divide':
            reslt = x / y;
            oprt = '/';
            break;
        default:
            res.end('Error: Method Invalid. Please use any one of the following methods: "add", "subtract", "multiply", or "divide".');
            return;
    }

    res.end(`${x} ${oprt} ${y} = ${reslt}`);
}

const app = connect();

app.use('/lab2', calculate);

app.listen(3000, () => {
    console.log('The Server is running on http://localhost:3000');
});
