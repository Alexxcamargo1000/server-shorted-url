import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'node:crypto'
import fastify from 'fastify'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.post('/short-url', async (req, res) => {
  const schema = z.object({
    url: z.string().url(),
  })
  const { url } = schema.parse(req.body)
  const shortUrl = randomBytes(3).toString('hex')

  const hasLink = await prisma.link.findUnique({
    where: {
      shortUrl,
    },
  })

  if (hasLink) {
    return res.status(400).send({ message: 'Erro ao criar link tente de novo' })
  }

  const newLink = await prisma.link.create({
    data: {
      url,
      shortUrl,
    },
  })

  return newLink
})

app.get('/links', async () => {
  const links = await prisma.link.findMany()

  return links
})

app.get('/redirect/:short', async (req, res) => {
  const schema = z.object({
    short: z.string().length(6),
  })

  const { short } = schema.parse(req.params)

  const link = await prisma.link.findUnique({
    where: {
      shortUrl: short,
    },
  })

  if (link === null) {
    return res.status(400).send({ message: 'Link não encontrado' })
  }

  return res.redirect(link.url)
})

app.listen(
  {
    port: 3333,
    host: '0.0.0.0',
  },
  () => {
    console.log('✅ Server is running on port 3333')
  },
)
