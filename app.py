import os
import json
import uuid
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS # <-- Importação do Flask-CORS

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)
# MUITO IMPORTANTE: Habilitar CORS logo após a criação do objeto Flask.
# Isso permite que seu frontend (localhost:3000) se comunique com o backend (localhost:5000).
CORS(app)

# Configura a API Key do Gemini
# A chave é carregada do arquivo .env para segurança.
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY não encontrada nas variáveis de ambiente. Verifique seu arquivo .env")
genai.configure(api_key=gemini_api_key)

# --- Verificação e Listagem de Modelos Gemini Disponíveis ---
# Este bloco é executado na inicialização do Flask para ajudar a depurar
# e confirmar quais modelos estão acessíveis com sua API Key.
print("Verificando modelos Gemini disponíveis...")
try:
    found_pro_model = False
    found_flash_model = False
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            print(f"- {m.name} (suporta generateContent)")
            if "gemini-1.5-pro" in m.name or "gemini-2.5-pro" in m.name: # Adapte conforme os nomes da sua lista
                found_pro_model = True
            if "gemini-1.5-flash" in m.name or "gemini-2.5-flash" in m.name: # Adapte conforme os nomes da sua lista
                found_flash_model = True

    if not found_pro_model and not found_flash_model:
        print("\nAtenção: Nenhum modelo 'gemini-pro' ou 'gemini-flash' foi encontrado com suporte a 'generateContent'.")
        print("Você pode precisar verificar seu plano, cotas ou a disponibilidade do modelo para sua região.")
except Exception as e:
    print(f"Erro ao listar modelos do Gemini: {e}")
print("-" * 30)

# --- Funções do Gemini e Lógica de Negócios ---

def criar_questoes_gemini(tema: str, quantidade: int, dificuldade: str) -> list:
    """
    Gera questões de múltipla escolha usando a API do Gemini.
    """
    # Mude esta linha para o nome do modelo que você deseja usar.
    # 'gemini-1.5-flash-latest' é uma boa opção por ser mais econômica e rápida.
    # Você pode tentar 'gemini-1.5-pro-latest' ou 'gemini-2.5-flash' / 'gemini-2.5-pro'
    # conforme os modelos listados no início do log do seu servidor.
    model_name = 'gemini-1.5-flash-latest'
    try:
        model = genai.GenerativeModel(model_name)
    except Exception as e:
        raise ValueError(f"Não foi possível carregar o modelo '{model_name}'. Erro: {e}")


    prompt = f"""
    Gere {quantidade} questões de múltipla escolha sobre "{tema}" com dificuldade "{dificuldade}".
    Para cada questão, forneça:
    - O texto da pergunta.
    - Quatro opções de resposta (A, B, C, D).
    - A letra da resposta correta.
    - Uma explicação concisa da resposta correta.

    Formato de saída esperado (JSON):
    [
      {{
        "id": "UUID_DA_QUESTAO_1",
        "pergunta": "Texto da pergunta 1",
        "opcoes": [
          {{"letra": "A", "texto": "Opção A"}},
          {{"letra": "B", "texto": "Opção B"}},
          {{"letra": "C", "texto": "Opção C"}},
          {{"letra": "D", "texto": "Opção D"}}
        ],
        "resposta_correta": "B",
        "explicacao": "Explicação da resposta B."
      }},
      {{
        "id": "UUID_DA_QUESTAO_2",
        "pergunta": "Texto da pergunta 2",
        "opcoes": [
          {{"letra": "A", "texto": "Opção A"}},
          {{"letra": "B", "texto": "Opção B"}},
          {{"letra": "C", "texto": "Opção C"}},
          {{"letra": "D", "texto": "Opção D"}}
        ],
        "resposta_correta": "A",
        "explicacao": "Explicação da resposta A."
      }}
    ]
    É crucial que a saída seja um JSON válido e que inclua o 'id' (UUID) único para cada questão.
    """

    response = None # Inicializa response para None para evitar UnboundLocalError
    try:
        response = model.generate_content(prompt)
        # Tenta limpar e parsear o JSON.
        questoes_raw = response.text.strip()
        if questoes_raw.startswith("```json") and questoes_raw.endswith("```"):
            questoes_raw = questoes_raw[7:-3].strip()

        questoes = json.loads(questoes_raw)

        # Adicionar um ID único para cada questão gerada
        for q in questoes:
            if 'id' not in q: # Garante que cada questão tenha um ID
                q['id'] = str(uuid.uuid4())
        return questoes
    except json.JSONDecodeError as e:
        print(f"Erro ao decodificar JSON do Gemini: {e}")
        if response: # Apenas tente acessar response.text se response foi atribuído
            print(f"Resposta bruta do Gemini:\n{response.text}")
        else:
            print("Resposta do Gemini não recebida ou vazia (erro antes da atribuição de 'response').")
        raise ValueError("O Gemini não retornou um JSON válido para as questões. Tente novamente ou ajuste a prompt.")
    except genai.types.BlockedPromptException as e:
        print(f"A requisição ao Gemini foi bloqueada: {e}")
        raise ValueError("A requisição ao Gemini foi bloqueada, talvez por conteúdo sensível ou política de uso.")
    except Exception as e:
        print(f"Erro inesperado ao processar resposta do Gemini: {e}")
        if response:
            print(f"Resposta bruta do Gemini:\n{response.text}")
        else:
            print("Resposta do Gemini não recebida ou vazia (erro antes da atribuição de 'response').")
        raise

def corrigir_questionario(respostas_usuario: dict, questoes_originais: list) -> tuple[int, list]:
    """
    Corrige o questionário do usuário e retorna a nota e resultados detalhados.
    """
    nota = 0
    resultados_detalhados = []

    # Mapeia as questões originais por ID para acesso rápido
    questoes_map = {q['id']: q for q in questoes_originais}

    for q_id, resposta_marcada in respostas_usuario.items():
        if q_id in questoes_map:
            questao = questoes_map[q_id]
            # Compara a resposta do usuário (em maiúscula para consistência)
            esta_correta = (str(resposta_marcada).upper() == str(questao['resposta_correta']).upper())

            if esta_correta:
                nota += 1

            resultados_detalhados.append({
                "id": q_id,
                "pergunta": questao['pergunta'],
                "sua_resposta": resposta_marcada,
                "resposta_correta": questao['resposta_correta'],
                "esta_correta": esta_correta,
                "explicacao": questao['explicacao']
            })
    return nota, resultados_detalhados

# --- Rotas da API ---

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz_endpoint():
    """
    Endpoint para gerar um novo questionário.
    Recebe: tema, quantidade, dificuldade.
    Retorna: lista de questões.
    """
    data = request.json
    tema = data.get('tema')
    quantidade = data.get('quantidade')
    dificuldade = data.get('dificuldade')

    if not all([tema, quantidade, dificuldade]):
        return jsonify({"error": "Tema, quantidade e dificuldade são obrigatórios."}), 400

    try:
        # Garante que a quantidade seja um inteiro
        quantidade = int(quantidade)
        if quantidade <= 0:
            return jsonify({"error": "A quantidade de questões deve ser um número positivo."}), 400

        questoes = criar_questoes_gemini(tema, quantidade, dificuldade)
        return jsonify({"questoes": questoes}), 200
    except ValueError as ve: # Erros específicos da lógica de negócio ou Gemini
        return jsonify({"error": str(ve)}), 400
    except Exception as e: # Erros genéricos inesperados
        print(f"Erro interno ao gerar questionário: {e}")
        return jsonify({"error": f"Ocorreu um erro interno ao gerar o questionário. Detalhes: {str(e)}"}), 500

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz_endpoint():
    """
    Endpoint para submeter as respostas do questionário para correção.
    Recebe: respostas do usuário e as questões originais.
    Retorna: nota e resultados detalhados.
    """
    data = request.json
    respostas_usuario = data.get('respostas') # Um dicionário {id_questao: resposta_marcada}
    questoes_originais = data.get('questoes') # As questões geradas e enviadas de volta pelo frontend

    if not all([respostas_usuario, questoes_originais]):
        return jsonify({"error": "As respostas do usuário e as questões originais são obrigatórias para a correção."}), 400

    try:
        nota, resultados_detalhados = corrigir_questionario(respostas_usuario, questoes_originais)
        return jsonify({"nota": nota, "resultados_detalhados": resultados_detalhados}), 200
    except Exception as e:
        print(f"Erro interno ao corrigir questionário: {e}")
        return jsonify({"error": f"Ocorreu um erro interno ao corrigir o questionário. Detalhes: {str(e)}"}), 500

# --- Execução do Aplicativo ---

if __name__ == '__main__':
    # Para desenvolvimento, o 'debug=True' é útil para recarregar o servidor
    # automaticamente em cada mudança de código e ver erros detalhados.
    # Em produção, você usaria um servidor WSGI como Gunicorn (gunicorn app:app).
    app.run(debug=True, port=5000)