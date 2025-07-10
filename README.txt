# 📱 Carteira de Vacinação Digital

Este projeto tem como objetivo oferecer uma solução moderna e segura para o registro e consulta de vacinas, substituindo o cartão físico de vacinação por uma versão digital acessível via aplicativo com QR Code.

## 🎯 Objetivo

Criar um sistema completo para registrar dados de vacinação e gerar um QR Code com um link único, que pode ser acessado via aplicativo para exibir o histórico de vacinas.

## 🧩 Tecnologias utilizadas

- **Frontend do formulário:** HTML + JavaScript
- **Backend:** Node.js + Express
- **Banco de dados:** Supabase (PostgreSQL na nuvem)
- **Geração de QR Code:** biblioteca `qrcode`
- **Aplicativo mobile:** FlutterFlow (integrado com Supabase)
- **Versionamento:** GitHub

## 🗂️ Estrutura do Projeto

# Formulário usado pelo enfermeiro-backend/ frontend -formulariovacinal.html 
# Backend Node.js (API que salva no Supabase)── index.js/supabase/ 
# Estrutura do banco (tabelas: usuarios, vacinas, aplicacoes)/app/ 
# App criado no FlutterFlow (linkado com Supabase)



## 🔁 Fluxo de Funcionamento

1. Enfermeiro preenche o formulário com os dados da vacinação.
2. Os dados são enviados para o backend (Node.js) via `fetch`.
3. O backend salva os dados no Supabase e gera um ID único.
4. É criado um QR Code com o link `https://app.com/vacina/{id}`.
5. O QR Code é impresso ou apresentado para os pais/responsáveis.
6. O app (FlutterFlow) acessa o banco via Supabase e exibe os dados ao escanear o QR.

## 📄 Funcionalidades (MVP)

- Registro de dados de vacinação com formulário web
- Armazenamento em banco de dados online
- Geração de QR Code com link único
- Leitura do QR Code e exibição dos dados no app
- Acesso rápido ao histórico de vacinas.

## 🧪 Status atual

- [x] Formulário HTML criado
- [x] Backend funcional e conectado ao Supabase
- [x] Geração de QR Code com ID
- [x] Estrutura do banco pronta
- [ ] Integração com app FlutterFlow (em andamento)
- [ ] Testes com leitura do QR Code via app

## 📌 Observações

Este projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso (TCC), com foco na melhoria do acesso e armazenamento dos registros de vacinação infantil.

## 📷 Prints e Telas

- Tela do formulário
- QR Code gerado
- Interface do app

---

Feito com 💉 por [Wallace & Felp]