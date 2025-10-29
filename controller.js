import { Router } from 'express';
import db from './db.js';

const router = Router();

// --- ROTAS (ENDPOINTS) ---

//Rota 1: [GET] /itens
router.get('/cadeiras', async (req, res) => {
  try {
    // A consulta retorna um objeto 'result'
    // Os dados (linhas) estão em 'result.rows'
    const result = await db.query('SELECT * FROM cadeiras ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar cadeiras:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

//Rota 2: [GET] /itens/:id
router.get('/cadeiras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Usamos $1 como placeholder para o primeiro parâmetro
    const result = await db.query('SELECT * FROM cadeiras WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'cadeira não encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cadeiras:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

//Rota 3: [POST] /itens
router.post('/cadeiras', async (req, res) => {
  try {
    const { personalidade, qtdPernas, acolchoada } = req.body;

    if (!personalidade || !qtdPernas) {
      return res.status(400).json({ message: 'O campo "personalidade" e "qtdPernas" são obrigatórios' });
    }

    // Placeholders $1 e $2
    // Usamos 'RETURNING *' para o Postgres nos devolver o item que acabou de ser criado
    const sql = 'INSERT INTO cadeiras (personalidade, qtdPernas, acolchoada) VALUES ($1, $2, $3) RETURNING *';
    const result = await db.query(sql, [personalidade, qtdPernas, acolchoada]);

    // O item criado estará em result.rows[0]
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao cadastrar cadeiras:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

/**
 * Rota 4: [PUT] /itens/:id
 * Edita (atualiza) um item existente
 */
router.put('/cadeiras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { personalidade, qtdPernas, acolchoada } = req.body;

    if (!personalidade || !qtdPernas) {
      return res.status(400).json({ message: 'O campo "personalidade" e "qtdPernas" são obrigatórios' });
    }

    // $1 = nome, $2 = descricao, $3 = id
    const sql = 'UPDATE cadeiras SET personalidade = $1, qtdPernas = $2, acolchoada = $3 WHERE id = $4 RETURNING *';
    const result = await db.query(sql, [personalidade, qtdPernas, acolchoada || null, id]);

    // O 'pg' nos dá 'rowCount' para saber quantas linhas foram afetadas
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'cadeira não encontrada' });
    }
    
    // Retorna o item atualizado (graças ao RETURNING *)
    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Erro ao atualizar cadeiras:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

/**
 * Rota 5: [DELETE] /itens/:id
 * Deleta um item
 */
router.delete('/cadeiras/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM cadeiras WHERE id = $1';
    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'cadeira não encontrada' });
    }
    
    res.status(204).send(); // 204 No Content

  } catch (error) {
    console.error('Erro ao deletar cadeira:', error);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});


export default router;