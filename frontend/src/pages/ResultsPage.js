import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { BarChart3, ClipboardList, Users, ChevronRight, Star } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ResultsPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axios.get(`${API_URL}/surveys?published=true`);
      // Filtrar apenas sondagens com respostas
      const surveysWithResponses = response.data.filter(s => s.response_count > 0);
      setSurveys(surveysWithResponses);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (surveyId) => {
    setLoadingAnalytics(true);
    try {
      const [surveyRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/surveys/${surveyId}`),
        axios.get(`${API_URL}/surveys/${surveyId}/public-results`),
      ]);
      setSelectedSurvey(surveyRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const renderQuestionResults = (question) => {
    const qAnalytics = analytics?.questions?.[question.id];
    if (!qAnalytics) return null;

    const totalResponses = qAnalytics.responses?.length || 0;

    switch (question.type) {
      case 'multiple_choice':
        const options = qAnalytics.option_breakdown || {};
        return (
          <div className="space-y-3">
            {Object.entries(options).map(([optionId, data]) => {
              const percentage = totalResponses > 0 ? (data.count / totalResponses) * 100 : 0;
              return (
                <div key={optionId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-700">{data.text}</span>
                    <span className="font-medium text-zinc-900">{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-100 overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'rating':
        const distribution = qAnalytics.distribution || {};
        const maxRating = question.max_rating || 5;
        const minRating = question.min_rating || 1;
        return (
          <div className="space-y-2">
            {Array.from({ length: maxRating - minRating + 1 }, (_, i) => {
              const rating = maxRating - i;
              const count = distribution[String(rating)] || 0;
              const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="w-6 text-zinc-500">{rating}</span>
                  <div className="flex-1 h-2 bg-zinc-100 overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-medium text-zinc-900">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>
        );

      case 'text':
        return (
          <p className="text-sm text-zinc-500 italic">
            {totalResponses} resposta{totalResponses !== 1 ? 's' : ''} de texto (conteúdo privado)
          </p>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="results-page">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-100 rounded-sm mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            Resultados
          </h1>
          <p className="text-zinc-500">
            Veja os resultados das sondagens realizadas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de Sondagens */}
          <div className="md:col-span-1">
            <Card className="rounded-lg border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <h3 className="font-medium text-zinc-900 mb-4 text-sm">
                  Sondagens com Resultados
                </h3>
                
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-zinc-100 animate-pulse"></div>
                    ))}
                  </div>
                ) : surveys.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    Ainda não há resultados disponíveis.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {surveys.map((survey) => (
                      <button
                        key={survey.id}
                        onClick={() => fetchAnalytics(survey.id)}
                        className={`w-full text-left p-3 transition-colors text-sm ${
                          selectedSurvey?.id === survey.id
                            ? 'bg-zinc-100 border-l-2 border-zinc-900'
                            : 'hover:bg-zinc-50 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-zinc-900 truncate">
                              {survey.title}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {survey.response_count} resposta{survey.response_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {survey.is_featured && (
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resultados da Sondagem Selecionada */}
          <div className="md:col-span-2">
            {!selectedSurvey ? (
              <Card className="rounded-lg border-0 shadow-sm bg-white">
                <CardContent className="py-16 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                  <p className="text-zinc-500">
                    Selecione uma sondagem para ver os resultados.
                  </p>
                </CardContent>
              </Card>
            ) : loadingAnalytics ? (
              <Card className="rounded-lg border-0 shadow-sm bg-white">
                <CardContent className="py-16 text-center">
                  <p className="text-zinc-500">A carregar resultados...</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Header da Sondagem */}
                <Card className="rounded-lg border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-xl font-medium text-zinc-900 mb-2">
                          {selectedSurvey.title}
                        </h2>
                        {selectedSurvey.description && (
                          <p className="text-sm text-zinc-500">
                            {selectedSurvey.description}
                          </p>
                        )}
                      </div>
                      {selectedSurvey.is_featured && (
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {analytics?.total_responses || 0} respostas
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-4 h-4" />
                        {selectedSurvey.questions?.length || 0} perguntas
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Resultados por Pergunta */}
                {selectedSurvey.questions?.map((question, index) => (
                  <Card key={question.id} className="rounded-lg border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="text-sm text-zinc-400 bg-zinc-100 w-6 h-6 rounded-sm flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-medium text-zinc-900">
                            {question.text}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            {question.type === 'multiple_choice' ? 'Escolha Múltipla' :
                             question.type === 'rating' ? 'Escala de Avaliação' : 'Texto Livre'}
                          </p>
                        </div>
                      </div>
                      {renderQuestionResults(question)}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
