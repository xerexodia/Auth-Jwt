const app = require('./server');

app.listen(3000);

console.log("Server on port", app.get("port"));