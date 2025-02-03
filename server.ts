const express = require("express");
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
      services: true,
    },
  });
  res.json(agendamentos);
});

//agendar
app.post("/agendar", async (req: any, res: any) => {
  const { professional_id, client_id, service_id, date_time } = req.body;
  const parsedDate = new Date(`${date_time}Z`);

  try {
    const alreadyBookedBenUsed = await prisma.appointment.findFirst({
      where: {
        date_time: parsedDate,
      },
    });

    if (alreadyBookedBenUsed)
      return res
        .status(409)
        .send({ message: `Este horário não está disponivel.` });

    await prisma.appointment.create({
      data: {
        professional_id,
        client_id,
        service_id,
        date_time: parsedDate.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).send({
      message: "Não foi possivel realizar o agendamento, tente novamente!",
      error,
    });
  }

  res.status(200).send({ message: `Horário agendado com sucesso.` });
});

//remarcar horário
app.put("/agendar/:id", async (req: any, res: any) => {
  const id = Number(req.params.id);
  console.log(id);

  try {
    const searchId = await prisma.appointment.findUnique({
      where: {
        id,
      },
    });

    if (!searchId)
      return res.status(404).send({
        message:
          " Agendamento não encontrado, verifique se realmente foi agendado horário!",
      });

    const data = { ...req.body };
    data.date_time = data.date_time
      ? new Date(`${data.date_time}Z`)
      : undefined;

    const alreadyBookedBenUsed = await prisma.appointment.findFirst({
      where: {
        date_time: data.date_time,
      },
    });

    if (alreadyBookedBenUsed)
      return res
        .status(409)
        .send({ message: `Este horário não está disponivel.` });

    await prisma.appointment.update({
      where: {
        id,
      },
      data: data,
    });
  } catch (error) {
    return res.status(500).send({
      message: "Não foi possivel remarcar o horário, tente novamente!",
      error,
    });
  }

  res.status(200).send({ message: `Horário remarcado com sucesso.` });
});

//remover agendamento
app.delete("/desmarcar/:id", async (req: any, res: any) => {
  const id = Number(req.params.id);

  try {
    const removeHorario = await prisma.appointment.findUnique({ where: { id } });

  if (!removeHorario){
    return res.status(404).send({ 
      message: "Horário não encontrado, verifique se realmente foi agendado horário!",
    });
  }
    
  await prisma.appointment.delete({ where: { id } });
  } catch(error) {
    return res.status(500).send({ message: ` Não foi possível descamar o horário.`})
  }

  res.status(200).send({message: 'Horário desmarcado com sucesso.'})
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
