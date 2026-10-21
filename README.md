# Escola de Discipulado Digital

## Visão Geral
Plataforma de discipulado digital baseada nos 4 módulos da Escola de Líderes, transformada em curso interativo com IA, vídeos verticais, quizzes via WhatsApp e videoconferência.

## Infraestrutura
- **Backend:** Next.js + Node.js
- **Banco de Dados:** PostgreSQL
- **Busca Vetorial:** Qdrant (para conteúdo das lições)
- **WhatsApp Automation:** Evolution API
- **Automação:** n8n
- **Videoconferência:** Jitsi Meet
- **Servidor Web:** Nginx

## Estrutura de Pastas
```
escola-discipulado/
├── backend/          # API e lógica de negócio
├── frontend/         # PWA para alunos
├── scripts-ia/       # Geração de conteúdo via inference.sh
├── conteudos/        # Vídeos, áudios e materiais
└── docker-configs/   # Configurações Docker/Nginx
```

## Como Rodar
1. Clone este repositório
2. Copie `.env.example` para `.env` e ajuste as variáveis
3. Execute `docker-compose up -d`

## Próximos Passos
- Ingerir os 4 módulos do PDF no Qdrant
- Gerar vídeos verticais via inference.sh
- Configurar workflows n8n para quizzes
- Implementar autenticação por WhatsApp

## Contato
Pr. Aldair - [seu contato]