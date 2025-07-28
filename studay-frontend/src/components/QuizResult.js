import React from 'react';

function QuizResult({ score, detailedResults, onRestartQuiz }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-semibold text-indigo-600 text-center mb-6">Resultados do Questionário</h2>

      <div className="text-center bg-indigo-50 p-6 rounded-lg shadow-md border border-indigo-200">
        <p className="text-xl text-gray-700 font-medium mb-2">Sua Pontuação:</p>
        <p className="text-5xl font-bold text-indigo-700">{score}/{detailedResults.length}</p>
      </div>

      <div className="space-y-6">
        {detailedResults.map((result, index) => (
          <div key={result.id} className={`p-6 rounded-lg shadow-sm border ${result.esta_correta ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="text-lg font-medium text-gray-800 mb-3">
              {index + 1}. {result.pergunta}
            </p>
            <p className="text-base text-gray-700 mb-2">
              Sua resposta: <span className={`font-semibold ${result.esta_correta ? 'text-green-600' : 'text-red-600'}`}>
                {result.sua_resposta}
              </span>
            </p>
            <p className="text-base text-gray-700 mb-3">
              Resposta correta: <span className="font-semibold text-green-600">
                {result.resposta_correta}
              </span>
            </p>
            <p className="text-sm text-gray-600 italic">
              Explicação: {result.explicacao}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={onRestartQuiz}
        className="w-full py-3 px-6 rounded-lg bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out"
      >
        Fazer Novo Questionário
      </button>
    </div>
  );
}

export default QuizResult;