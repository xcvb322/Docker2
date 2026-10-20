const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`Application serving traffic on port ${config.port} [ENV: ${config.env}]`);
});
