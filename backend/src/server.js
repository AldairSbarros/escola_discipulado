const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API Escola de Discipulado está rodando!' });
});

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  DEVOCIONAIS DIÁRIOS — Geração em lote usando Aletheia
// ═══════════════════════════════════════════════════════════════════════════════

// 30 temas para os primeiros 30 dias da Escola de Discipulado
const TEMAS_DEVOCIONAIS_30_DIAS = [
  "O que é a Bíblia e por que ela é importante",
  "Como ler a Bíblia todos os dias",
  "A oração como conversa com Deus",
  "O poder da oração intercessória",
  "Jejum: abrindo espaço para Deus",
  "Adoração além do domingo",
  "O Espírito Santo como consolador",
  "Os dons do Espírito Santo",
  "O fruto do Espírito na vida diária",
  "Perdão: libertando-se das mágoas",
  "Humildade: o caminho de Cristo",
  "Fé que move montanhas",
  "Esperança em tempos difíceis",
  "Amor ágape: o amor de Deus",
  "Serviço: seguindo o exemplo de Jesus",
  "Mordomia cristã: administrando recursos",
  "Testemunho: contando sua história",
  "Discipulado: formando outros",
  "Liderança servidora",
  "Família segundo Deus",
  "Casamento cristão",
  "Criação de filhos na fé",
  "Trabalho como adoração",
  "Finanças bíblicas",
  "Santidade no mundo moderno",
  "Batalha espiritual",
  "Identidade em Cristo",
  "Propósito de vida",
  "Chamado ministerial",
  "Legado espiritual"
];

// Rota para gerar devocionais em lote (30 dias)
app.post('/api/escola/devocional/lote', async (req, res) => {
  try {
    const { dias = 30, temaEspecifico } = req.body;
    const aletheiaUrl = process.env.ALETHEIA_API_URL || 'http://localhost:8000';
    const adminKey = process.env.ALETHEIA_ADMIN_KEY;

    if (!adminKey) {
      return res.status(500).json({ error: 'ALETHEIA_ADMIN_KEY não configurada.' });
    }

    const resultados = [];
    const temas = temaEspecifico
      ? [temaEspecifico]
      : TEMAS_DEVOCIONAIS_30_DIAS.slice(0, dias);

    // Criar diretório para devocionais se não existir
    const devocionaisDir = path.join(__dirname, '..', '..', 'conteudos', 'devocionais');
    if (!fs.existsSync(devocionaisDir)) {
      fs.mkdirSync(devocionaisDir, { recursive: true });
    }

    for (let i = 0; i < temas.length; i++) {
      const tema = temas[i];
      const dia = i + 1;

      console.log(`\n📖 Gerando devocional dia ${dia}/${dias}: ${tema}`);

      try {
        // 1. Gerar texto devocional via Aletheia
        console.log(`   ✍️  Gerando texto...`);
        const textoResponse = await axios.post(
          `${aletheiaUrl}/api/sermao/gerar`,
          {
            tema: tema,
            tipo: "Devocional",
            colecao: "escola_discipulado"
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Key': adminKey
            },
            timeout: 120000
          }
        );

        const textoDevocional = textoResponse.data?.texto || textoResponse.data?.conteudo || 'Texto não disponível';

        // 2. Gerar áudio TTS via Aletheia
        console.log(`   🎙️  Gerando áudio...`);
        const audioResponse = await axios.post(
          `${aletheiaUrl}/api/audio/gerar`,
          {
            texto: textoDevocional.substring(0, 2000), // Limitar para áudio de ~3min
            voz: "pt-BR-AntonioNeural",
            velocidade: 1.0
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Key': adminKey
            },
            timeout: 180000,
            responseType: 'arraybuffer'
          }
        );

        // Salvar áudio
        const audioPath = path.join(devocionaisDir, `dia_${String(dia).padStart(2, '0')}_audio.mp3`);
        fs.writeFileSync(audioPath, audioResponse.data);

        // 3. Gerar imagem via Aletheia (usando Imagen 4)
        console.log(`   🎨 Gerando imagem...`);
        const imagemResponse = await axios.post(
          `${aletheiaUrl}/api/imagem/gerar`,
          {
            prompt: `Ilustração devocional cristã sobre: ${tema}. Estilo moderno, acolhedor, cores suaves, formato quadrado 1080x1080`,
            modelo: "imagen-4"
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Admin-Key': adminKey
            },
            timeout: 120000,
            responseType: 'arraybuffer'
          }
        );

        // Salvar imagem
        const imagemPath = path.join(devocionaisDir, `dia_${String(dia).padStart(2, '0')}_imagem.png`);
        fs.writeFileSync(imagemPath, imagemResponse.data);

        // 4. Salvar texto em JSON
        const devocionalData = {
          dia: dia,
          tema: tema,
          texto: textoDevocional,
          data_geracao: new Date().toISOString(),
          arquivos: {
            audio: `dia_${String(dia).padStart(2, '0')}_audio.mp3`,
            imagem: `dia_${String(dia).padStart(2, '0')}_imagem.png`
          }
        };

        const jsonPath = path.join(devocionaisDir, `dia_${String(dia).padStart(2, '0')}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(devocionalData, null, 2));

        resultados.push({
          dia: dia,
          tema: tema,
          status: 'sucesso',
          arquivos: devocionalData.arquivos
        });

        console.log(`   ✅ Dia ${dia} concluído!`);

      } catch (err) {
        console.error(`   ❌ Erro no dia ${dia}:`, err.response?.data || err.message);
        resultados.push({
          dia: dia,
          tema: tema,
          status: 'erro',
          error: err.response?.data?.detail || err.message
        });
      }
    }

    // Salvar índice geral
    const indexPath = path.join(devocionaisDir, 'indice.json');
    const indice = {
      total: resultados.length,
      sucesso: resultados.filter(r => r.status === 'sucesso').length,
      erros: resultados.filter(r => r.status === 'erro').length,
      gerado_em: new Date().toISOString(),
      devocionais: resultados
    };
    fs.writeFileSync(indexPath, JSON.stringify(indice, null, 2));

    res.json({
      ok: true,
      total: resultados.length,
      sucesso: indice.sucesso,
      erros: indice.erros,
      resultados: resultados,
      diretorio: devocionaisDir
    });

  } catch (error) {
    console.error('Erro na geração em lote:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Falha ao gerar devocionais em lote.',
      details: error.response?.data || error.message
    });
  }
});

// Rota para listar devocionais gerados
app.get('/api/escola/devocional/listar', async (req, res) => {
  try {
    const devocionaisDir = path.join(__dirname, '..', '..', 'conteudos', 'devocionais');

    if (!fs.existsSync(devocionaisDir)) {
      return res.json({ devocionais: [], total: 0 });
    }

    const indexPath = path.join(devocionaisDir, 'indice.json');
    if (fs.existsSync(indexPath)) {
      const indice = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      return res.json(indice);
    }

    // Se não tem índice, listar arquivos manualmente
    const arquivos = fs.readdirSync(devocionaisDir)
      .filter(f => f.endsWith('.json') && f !== 'indice.json')
      .map(f => {
        const data = JSON.parse(fs.readFileSync(path.join(devocionaisDir, f), 'utf-8'));
        return data;
      })
      .sort((a, b) => a.dia - b.dia);

    res.json({ devocionais: arquivos, total: arquivos.length });

  } catch (error) {
    console.error('Erro ao listar devocionais:', error.message);
    res.status(500).json({ error: 'Falha ao listar devocionais.' });
  }
});

// Rota de ingestão multitenant (repassa para o Aletheia)
app.post('/api/escola/ingestao', async (req, res) => {
  try {
    const { filePath, fileName, colecao = 'escola_discipulado', autor = 'Pr. Aldair', obra = 'Escola de Discipulado' } = req.body;

    if (!filePath || !fileName) {
      return res.status(400).json({ error: 'filePath e fileName são obrigatórios.' });
    }

    // Caminho absoluto no servidor
    const fullPath = path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, '..', filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no caminho especificado.' });
    }

    // Prepara o FormData para enviar ao Aletheia
    const form = new FormData();
    form.append('arquivos', fs.createReadStream(fullPath), fileName);
    form.append('nova_colecao', colecao);
    form.append('autor', autor);
    form.append('obra', obra);

    // Configuração do Aletheia Backend
    const aletheiaUrl = process.env.ALETHEIA_API_URL || 'http://localhost:8000';
    const adminKey = process.env.ALETHEIA_ADMIN_KEY;

    if (!adminKey) {
      return res.status(500).json({ error: 'ALETHEIA_ADMIN_KEY não configurada no .env da Escola.' });
    }

    // Repassa a ingestão
    const response = await axios.post(`${aletheiaUrl}/api/admin/ingestao/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'X-Admin-Key': adminKey,
      },
      timeout: 60000,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erro na ingestão:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Falha ao processar ingestão no Aletheia.',
      details: error.response?.data
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;