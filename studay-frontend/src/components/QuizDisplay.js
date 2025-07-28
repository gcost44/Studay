import React, { useState } from 'react';

function QuizDisplay({ questions, onQuizSubmitted }) {
  // Estado para armazenar as respostas do usuário: { id_questao: 'letra_marcada' }
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lida com a seleção de uma opção de resposta
  const handleOptionChange = (questionId, selectedOptionLetter) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedOptionLetter,
    }));
  };

  // Lida com a submissão do questionário
  const handleSubmitQuiz = async () => {
    setError('');
    // Validação básica: garantir que todas as questões foram respondidas
    if (Object.keys(userAnswers).length !== questions.length) {
      setError('Por favor, responda a todas as questões antes de finalizar.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/submit_quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ respostas: userAnswers, questoes: questions }), // Envia as questões originais também
      });

      const data = await response.json();

      if (response.ok) {
        onQuizSubmitted(data); // Chama a função passada pelo App.js com os resultados
      } else {
        setError(data.error || 'Erro desconhecido ao submeter questionário.');
      }
    } catch (err) {
      setError('Erro de conexão com o backend ao submeter. Verifique o servidor.');
      console.error("Erro ao submeter questionário:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-indigo-600 text-center mb-6">Seu Questionário</h2>
      {questions.map((q, index) => (
        <div key={q.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-lg font-medium text-gray-800 mb-4">
            {index + 1}. {q.pergunta}
          </p>
          <div className="space-y-3">
            {q.opcoes.map((opcao) => (
              <label key={opcao.letra} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-indigo-50 transition duration-150 ease-in-out">
                <input
                  type="radio"
                  name={`question-${q.id}`} // Agrupa os radios por questão
                  value={opcao.letra}
                  checked={userAnswers[q.id] === opcao.letra}
                  onChange={() => handleOptionChange(q.id, opcao.letra)}
                  className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-gray-700 text-base">
                  {opcao.letra}) {opcao.texto}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <button
        onClick={handleSubmitQuiz}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg text-white font-semibold shadow-md transition duration-300 ease-in-out ${
          loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Finalizando...' : 'Finalizar Questionário'}
      </button>
    </div>
  );
}

export default QuizDisplay;