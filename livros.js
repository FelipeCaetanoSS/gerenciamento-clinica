const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

const livros = [
  { id: 1, titulo: 'O Alquimista',  genero: 'Romance',          disponivel: true  },
  { id: 2, titulo: '1984',          genero: 'Ficção Científica', disponivel: false },
  { id: 3, titulo: 'Dom Casmurro',  genero: 'Romance',          disponivel: true  },
  { id: 4, titulo: 'Sapiens',       genero: 'Não-Ficção',       disponivel: true  }
]

app.get('/livros', (req, res) => {
  const { genero } = req.query

  // Se vier o filtro de gênero, filtra o array
  if (genero) {
    const filtrados = livros.filter(livro => livro.genero === genero)
    return res.json(filtrados)
  }

  // Sem filtro, retorna todos
  res.json(livros)
})

app.get('/livros/:id', (req, res) => {
  // Converter para número — req.params.id sempre chega como string
  const id = Number(req.params.id)

  // Procurar o livro com esse id no array
  const livro = livros.find(l => l.id === id)

  // Se não encontrou, responder com 404
  if (!livro) {
    return res.status(404).json({ erro: 'Livro não encontrado' })
  }

  res.json(livro)
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})