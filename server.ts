const express = require('express');
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

//busca os agendamentos
app.get("/agendamentos", async (_: any, res: any) => {
  const agendamentos = await prisma.appointment.findMany({
    include: {
      clientes_appointments_client_idToclientes: true,
      clientes_appointments_professional_idToclientes: true,
      services: true
    }
  });
  res.json(agendamentos);
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
