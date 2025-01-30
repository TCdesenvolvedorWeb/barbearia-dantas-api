const express = require('express');
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.use(express.json());

app.get("/agendamentos", async (_: any, res: any) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: {
      clientes: true,
    },
  });
  res.json(agendamentos);
});

app.post("/agendar", async (req: any, res: any) => {
  const { data, horario , cliente_id} = req.body;
  console.log( data , horario , cliente_id)

  try {
    const [hora , minuto] = horario.split(":");
    const horarioFormatado = new Date();
    horarioFormatado.setHours(Number(hora) ,  Number(minuto) , 0 , 0)

    const JaFoiAgendado = await prisma.agendamento.findFirst({
      where: {
        data: new Date(data),
        horario: horarioFormatado,
      },
    });

    if (JaFoiAgendado) return res.status(409).send("Já existe um cliente agendado para este horário");

    await prisma.agendamento.create({
      data: {
        data: new Date(data),
        horario: horarioFormatado,
        clientes: {
            connect: { id: cliente_id}
        }
      },
    });
  } catch (error) {
    return res.status(500).send({ message: `Falha ao tentar realizar o agendamento. Erro: ` , error  });
  }

  res.status(200).send({ message: `Agendamento realizado com sucesso` });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
