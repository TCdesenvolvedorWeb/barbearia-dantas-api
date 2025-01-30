const express = require('express');
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.get("/agendamentos" , async (_: any , res: any) => {
    const agendamentos = await prisma.agendamento.findMany({
        include:{
            clientes: true
        }
    });
    res.json(agendamentos)
})

app.listen(port , ()=> {
    console.log(`http://localhost:${port}`)
})