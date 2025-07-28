import React, { useState } from 'react';

function QuizGenerator({ onQuizGenerated }) {
  const [tema, setTema] = useState('');
  const [quantidade, setQuantidade] = useState(3); // Valor padrão
  const [dificuldade, setDificuldade] = useState('média'); // Valor padrão
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateClick = async () => {
    setError(''); // Limpa erros anteriores
    if (!tema || quantidade <= 0) {
      setError('Por favor, preencha o tema e a quantidade de questões.');
      return;
    }

    setLoading(true); // Ativa o estado de carregamento
    try {
      const response = await fetch('http://localhost:5000/generate_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tema, quantidade, dificuldade }),
      });

      const data = await response.json();

      if (response.ok) {
        onQuizGenerated(data.questoes); // Chama a função passada pelo App.js
      } else {
        setError(data.error || 'Erro desconhecido ao gerar questionário.');
      }
    } catch (err) {
      setError('Erro de conexão com o backend. Verifique se o servidor Flask está rodando em http://localhost:5000.');
      console.error("Erro ao gerar questionário:", err);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">Defina seu objetivo de estudo e deixe a IA criar seu questionário!</p>
      </div>

      <div>
        <label htmlFor="tema" className="block text-gray-700 text-sm font-medium mb-2">
          Tema do Questionário:
        </label>
        <input
          type="text"
          id="tema"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
          placeholder="Ex: Revolução Francesa, Funções Exponenciais"
        />
      </div>

      <div>
        <label htmlFor="quantidade" className="block text-gray-700 text-sm font-medium mb-2">
          Quantidade de Questões:
        </label>
        <input
          type="number"
          id="quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(parseInt(e.target.value))}
          min="1"
          max="10" // Limite para evitar prompts muito grandes na camada gratuita
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
        />
      </div>

      <div>
        <label htmlFor="dificuldade" className="block text-gray-700 text-sm font-medium mb-2">
          Dificuldade:
        </label>
        <select
          id="dificuldade"
          value={dificuldade}
          onChange={(e) => setDificuldade(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white"
        >
          <option value="fácil">Fácil</option>
          <option value="média">Média</option>
          <option value="difícil">Difícil</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <button
        onClick={handleGenerateClick}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out ${
          loading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {loading ? 'Gerando Questões...' : 'Gerar Questionário'}
      </button>
    </div>
  );
}

export default QuizGenerator;