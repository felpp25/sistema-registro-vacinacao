const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Configurar o CORS e o Body-Parser
app.use(cors());
app.use(bodyParser.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota POST - Salvar vacina no banco de dados
app.post('/salvarVacina', async (req, res) => {
  try {
    console.log("Dados recebidos:", req.body);

    const { vacina, fabricante, lote, data, dose, aplicador, registroProf, unidade } = req.body;

    const { data: vacinaData, error } = await supabase
      .from('vacinas')
      .insert([
        {
          vacina,
          fabricante,
          lote,
          data,
          dose,
          aplicador,
          registro_profissional: registroProf,
          unidade_saude: unidade
        }
      ])
      .select(); // <- IMPORTANTE: Retorna o ID da vacina inserida

    if (error) {
      console.error("Erro ao inserir no Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!vacinaData || vacinaData.length === 0) {
      return res.status(500).json({ error: 'Inserção feita, mas nenhum dado foi retornado.' });
    }

    // Retorna o ID da vacina criada
    res.status(201).json({ id: vacinaData[0].id });

  } catch (error) {
    console.error("Erro inesperado:", error);
    res.status(500).json({ error: 'Erro ao salvar vacina.' });
  }
});

// Rota GET - Buscar informações sobre uma vacina específica
app.get('/vacina/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('vacinas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar vacina.' });
  }
});

// Rota PUT - Atualizar informações de uma vacina
app.put('/atualizarVacina/:id', async (req, res) => {
  const { id } = req.params;
  const { vacina, fabricante, lote, data, dose, aplicador, registroProf, unidade } = req.body;

  try {
    const { data: vacinaData, error } = await supabase
      .from('vacinas')
      .update({
        vacina,
        fabricante,
        lote,
        data,
        dose,
        aplicador,
        registro_profissional: registroProf,
        unidade_saude: unidade
      })
      .eq('id', id)
      .select(); // <- Adiciona select para garantir retorno

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(vacinaData[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar vacina.' });
  }
});

// Rota DELETE - Excluir uma vacina do banco de dados
app.delete('/deletarVacina/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('vacinas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: 'Vacina excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir vacina.' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
