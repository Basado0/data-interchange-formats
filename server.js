const express = require('express');
const app = express();
const PORT = 3000;

app.use('/api/pox', require('./routes/pox'));
app.use('/soap', require('./routes/soap'));
app.use('/api/v1', require('./routes/rest'));

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`POX API доступен по адресу: http://localhost:${PORT}/api/pox`);
    console.log(`SOAP: http://localhost:${PORT}/soap`);
    console.log(`WSDL: http://localhost:${PORT}/soap/wsdl`);
    console.log(`REST: http://localhost:${PORT}/api/v1`);
});