const fs = require('fs');
const express = require('express');
const port = 3000;
const app = express();

const biblia = require('./route/ler.js');
app.use(express.json());
app.use('/ler', biblia);
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
