import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, Users, BarChart3, MessageSquare, Star } from 'lucide-react';
import ShareButtons from '../components/ShareButtons';

const SurveyResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [surveyRes, analyticsRes] = await Promise.all([
        api.get(`/surveys/${id}`),
        api.get(`/surveys/${id}/analytics`),
      ]);
      setSurvey(surveyRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Falha ao carregar resultados');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500">A carregar resultados...</div>
      </div>
    );
  }

  if (!survey || !analytics) return null;

  const renderQuestionResults = (question) => {
    const qAnalytics = analytics.questions[question.id];
    if (!qAnalytics) return null;

    switch (question.type) {
      case 'multiple_choice':
        const options = qAnalytics.option_breakdown || {};
        const totalResponses = qAnalytics.responses?.length || 0;
        return (
          <div className="space-y-3">
            {Object.entries(options).map(([optionId, data]) => {
              const percentage = totalResponses > 0 ? (data.count / totalResponses) * 100 : 0;
              return (
                <div key={optionId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{data.text}</span>
                    <span className="text-zinc-500">{data.count} ({Math.round(percentage)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2 rounded-none" />
                </div>
              );
            })}
          </div>
        );

      case 'rating':
        const average = qAnalytics.average || 0;
        const distribution = qAnalytics.distribution || {};
        const maxRating = question.max_rating || 5;
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-light">{average.toFixed(1)}</div>
              <div className="flex items-center gap-1">
                {Array.from({ length: maxRating }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(average)
                        ? 'fill-black text-black dark:fill-white dark:text-white'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-zinc-500">Média</span>
            </div>
            <div className="space-y-2">
              {Array.from({ length: maxRating }, (_, i) => {
                const rating = maxRating - i;
                const count = distribution[String(rating)] || 0;
                const total = qAnalytics.responses?.length || 1;
                const percentage = (count / total) * 100;
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-4">{rating}</span>
                    <Progress value={percentage} className="h-2 rounded-none flex-1" />
                    <span className="w-8 text-right text-zinc-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'text':
        const responses = qAnalytics.responses || [];
        return (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {responses.length === 0 ? (
              <p className="text-zinc-500 text-sm">Ainda sem respostas</p>
            ) : (
              responses.slice(0, 10).map((response, i) => (
                <div
                  key={i}
                  className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm"
                >
                  "{response}"
                </div>
              ))
            )}
            {responses.length > 10 && (
              <p className="text-xs text-zinc-500">
                E mais {responses.length - 10} respostas...
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="survey-results-page">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="rounded-none mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps mb-2">Resultados</p>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
                {survey.title}
              </h1>
            </div>
            {survey.is_published && (
              <ShareButtons surveyId={survey.id} surveyTitle={survey.title} />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{analytics.total_responses}</p>
                <p className="text-xs text-zinc-500">Total de Respostas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{survey.questions.length}</p>
                <p className="text-xs text-zinc-500">Perguntas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">
                  {survey.is_published ? 'Ativo' : 'Rascunho'}
                </p>
                <p className="text-xs text-zinc-500">Estado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Results */}
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-medium">Análise por Pergunta</h2>
          {survey.questions.map((question, index) => (
            <Card
              key={question.id}
              className={`rounded-none border border-zinc-200 dark:border-zinc-800 ${
                question.highlighted ? 'highlighted-question' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <span className="text-sm text-zinc-400 bg-zinc-100 dark:bg-zinc-800 w-8 h-8 flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <CardTitle className="font-serif text-lg font-medium">
                      {question.text}
                    </CardTitle>
                    <p className="text-xs text-zinc-500 mt-1">
                      {question.type === 'multiple_choice'
                        ? 'Escolha Múltipla'
                        : question.type === 'rating'
                        ? 'Escala de Avaliação'
                        : 'Resposta de Texto'}
                      {question.required && ' • Obrigatória'}
                      {question.highlighted && ' • Destacada'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderQuestionResults(question)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SurveyResultsPage;
