const express = require('express');
const app = express();
const port = 3000;

app.get("/" , async (_: any , res: any) => {
    res.send('Home page')
})

app.listen(port , ()=> {
    console.log(`http://localhost:${port}`)
})