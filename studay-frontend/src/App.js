import React, { useState } from 'react';
import QuizGenerator from './components/QuizGenerator';
import QuizDisplay from './components/QuizDisplay';
import QuizResult from './components/QuizResult';

function App() {
  // Estado para controlar qual tela estamos mostrando: 'generate', 'quiz', 'results'
  const [quizMode, setQuizMode] = useState('generate');
  // Estado para armazenar as questões geradas pelo backend
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  // Estado para armazenar os resultados da correção do quiz
  const [quizResults, setQuizResults] = useState(null);

  // Função chamada quando o quiz é gerado com sucesso
  const handleQuizGenerated = (questions) => {
    setGeneratedQuestions(questions);
    setQuizMode('quiz'); // Mudar para a tela de exibição do quiz
  };

  // Função chamada quando o quiz é submetido e corrigido com sucesso
  const handleQuizSubmitted = (results) => {
    setQuizResults(results);
    setQuizMode('results'); // Mudar para a tela de resultados
  };

  // Função para reiniciar o quiz
  const handleRestartQuiz = () => {
    setQuizMode('generate'); // Voltar para a tela de geração
    setGeneratedQuestions([]);
    setQuizResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Studay</h1>

        {quizMode === 'generate' && (
          <QuizGenerator onQuizGenerated={handleQuizGenerated} />
        )}

        {quizMode === 'quiz' && (
          <QuizDisplay
            questions={generatedQuestions}
            onQuizSubmitted={handleQuizSubmitted}
          />
        )}

        {quizMode === 'results' && quizResults && ( // Adicionei quizResults && para garantir que não seja null
          <QuizResult
            score={quizResults.nota}
            detailedResults={quizResults.resultados_detalhados}
            onRestartQuiz={handleRestartQuiz}
          />
        )}
      </div>
    </div>
  );
}

export default App;