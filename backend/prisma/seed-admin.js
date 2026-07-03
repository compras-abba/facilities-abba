require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const admins = [
  { nome: 'Compras ABBA',    email: 'compras@abbaquimica.com.br'   },
  { nome: 'Financeiro ABBA', email: 'financeiro@abbaquimica.com.br' },
];

async function main() {
  const hash = await bcrypt.hash('Admin@2026', 10);
  for (const admin of admins) {
    await prisma.usuario.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        nome: admin.nome,
        email: admin.email,
        senha_hash: hash,
        perfil: 'Admin',
      },
    });
    console.log(`✔ Admin criado: ${admin.email} / Admin@2026`);
  }
}
main().finally(() => prisma.$disconnect());
