# Studay - Sistema de Questionários com IA

Um sistema completo para geração de questionários usando Inteligência Artificial (Google Gemini), com backend em Flask e frontend em React.

## 📋 Funcionalidades

- ✅ Geração automática de questionários usando Google Gemini AI
- ✅ Interface web moderna e responsiva
- ✅ Correção automática com explicações detalhadas
- ✅ Diferentes níveis de dificuldade
- ✅ Suporte a diversos temas de estudo

## 🛠️ Tecnologias Utilizadas

### Backend

- **Python 3.13**
- **Flask** - Framework web
- **Google Generative AI** - Geração de conteúdo com IA
- **Flask-CORS** - Habilitação de CORS
- **python-dotenv** - Gerenciamento de variáveis de ambiente

### Frontend

- **React.js** - Biblioteca para interface do usuário
- **CSS** - Estilização

## 🚀 Como Executar o Projeto

### Pré-requisitos

1. Python 3.13+ instalado
2. Node.js e npm instalados
3. Chave de API do Google Gemini

### Configuração do Backend

1. Clone o repositório:

```bash
git clone https://github.com/gcost44/Studay.git
cd Studay
```

2. Crie um ambiente virtual:

```bash
python -m venv studay_env
```

3. Ative o ambiente virtual:

```bash
# Windows
studay_env\Scripts\activate

# Linux/Mac
source studay_env/bin/activate
```

4. Instale as dependências:

```bash
pip install flask python-dotenv google-generativeai flask-cors
```

5. Configure a chave da API:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave do Google Gemini:

```
GEMINI_API_KEY=sua_chave_aqui
```

6. Execute o backend:

```bash
python app.py
```

O backend estará rodando em `http://localhost:5000`

### Configuração do Frontend

1. Navegue para o diretório do frontend:

```bash
cd studay-frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o frontend:

```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

## 📡 API Endpoints

### POST `/generate_quiz`

Gera um novo questionário com base nos parâmetros fornecidos.

**Parâmetros:**

```json
{
  "tema": "História do Brasil",
  "quantidade": 5,
  "dificuldade": "médio"
}
```

**Resposta:**

```json
{
  "questoes": [
    {
      "id": "uuid-da-questao",
      "pergunta": "Pergunta aqui",
      "opcoes": [
        { "letra": "A", "texto": "Opção A" },
        { "letra": "B", "texto": "Opção B" },
        { "letra": "C", "texto": "Opção C" },
        { "letra": "D", "texto": "Opção D" }
      ],
      "resposta_correta": "B",
      "explicacao": "Explicação da resposta"
    }
  ]
}
```

### POST `/submit_quiz`

Submete as respostas do usuário para correção.

**Parâmetros:**

```json
{
  "respostas": {
    "uuid-da-questao": "A"
  },
  "questoes": [...]
}
```

## 🔒 Segurança

- As chaves de API são gerenciadas através de variáveis de ambiente
- O arquivo `.env` está incluído no `.gitignore` para evitar exposição acidental
- CORS configurado para permitir comunicação segura entre frontend e backend

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**gcost44**

- GitHub: [@gcost44](https://github.com/gcost44)

---

⭐ Se este projeto te ajudou, considere dar uma estrela!
