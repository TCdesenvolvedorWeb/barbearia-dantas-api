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

app.post("/agendar" , async (req: any , res: any) => {
  const { professional_id , client_id , service_id , date_time } = req.body
  const parsedDate = new Date(`${date_time}Z`);
  
  try{
    const alreadyBookedBenUsed = await prisma.appointment.findFirst({
      where: {
        date_time: parsedDate
      }
    })
  
    if(alreadyBookedBenUsed) return res.status(409).send({message: `Este horário não está disponivel.`})
  
    await prisma.appointment.create({
      data:{
        professional_id,
        client_id,
        service_id,
        date_time: parsedDate.toISOString()
      }
    })
  }catch(error){
    return res.status(500).send({message: 'Não foi possivel realizar o agendamento, tente novamente!' , error})
  }

  res.status(200).send({message: `Horário agendado com sucesso.`})
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
