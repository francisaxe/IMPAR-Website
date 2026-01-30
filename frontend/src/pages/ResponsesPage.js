import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle, ChevronRight, TrendingUp, Users } from 'lucide-react';

const ResponsesPage = () => {
  const { api, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchResponses();
  }, [user]);

  const fetchResponses = async () => {
    try {
      const res = await api.get('/my-responses');
      setResponses(res.data);
    } catch (error) {
      toast.error('Erro ao carregar respostas');
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAnswerText = (questionId, questions, answers) => {
    const question = questions.find(q => q.id === questionId);
    const answer = answers.find(a => a.question_id === questionId);
    
    if (!answer || !question) return '-';
    
    if (question.type === 'multiple_choice' || question.type === 'checkbox') {
      const optionIds = answer.value.split(',');
      const selectedOptions = question.options?.filter(opt => optionIds.includes(opt.id));
      return selectedOptions?.map(opt => opt.text).join(', ') || answer.value;
    }
    
    return answer.value;
  };

  const renderGlobalResults = (question, globalResults) => {
    const result = globalResults[question.id];
    
    if (!result) return null;
    
    if (result.type === 'multiple_choice' || result.type === 'yes_no') {
      return (
        <div className="space-y-2">
          {question.options?.map(option => {
            const percentage = result.percentages?.[option.id] || 0;
            return (
              <div key={option.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-600">{option.text}</span>
                  <span className="font-medium text-zinc-900">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      );
    }
    
    if (result.type === 'rating') {
      return (
        <div className="flex items-center gap-3 text-sm">
          <TrendingUp className="w-4 h-4 text-zinc-400" />
          <span className="text-zinc-600">Média:</span>
          <span className="font-semibold text-zinc-900">{result.average}/5</span>
          <span className="text-zinc-400">({result.total_votes} votos)</span>
        </div>
      );
    }
    
    return null;
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-zinc-500">A carregar respostas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="responses-page">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            As Suas Respostas
          </h1>
          <p className="text-zinc-500">
            Veja as sondagens que respondeu e compare com os resultados globais
          </p>
        </div>

        {/* Lista de Respostas */}
        {responses.length === 0 ? (
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
              <p className="text-zinc-500 mb-2">Ainda não respondeu a nenhuma sondagem.</p>
              <Link to="/surveys" className="text-sm text-zinc-600 hover:underline">
                Ver sondagens disponíveis
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {responses.map((item, index) => {
              const isExpanded = expandedId === item.response.id;
              
              return (
                <Card key={item.response.id} className="rounded-lg border-0 shadow-sm bg-white">
                  <CardHeader 
                    className="cursor-pointer hover:bg-zinc-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : item.response.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="rounded-sm bg-emerald-600 text-white text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Respondida
                          </Badge>
                          <Badge variant="outline" className="rounded-sm text-zinc-600 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {item.total_responses} respostas
                          </Badge>
                        </div>
                        <CardTitle className="font-serif text-xl font-medium text-zinc-900">
                          {item.survey.survey_number || responses.length - index}. {item.survey.title}
                        </CardTitle>
                        {item.survey.description && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {item.survey.description}
                          </p>
                        )}
                        <p className="text-xs text-zinc-400 mt-2">
                          Respondido em {formatDate(item.response.submitted_at)}
                        </p>
                      </div>
                      <ChevronRight 
                        className={`w-5 h-5 text-zinc-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0 pb-6">
                      <div className="space-y-6">
                        {item.survey.questions.map((question, qIndex) => (
                          <div key={question.id} className="border-t border-zinc-100 pt-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Sua Resposta */}
                              <div>
                                <h4 className="text-sm font-medium text-zinc-700 mb-3">
                                  {qIndex + 1}. {question.text}
                                </h4>
                                <div className="bg-blue-50 rounded-sm p-4">
                                  <p className="text-xs text-blue-600 font-medium mb-1">
                                    SUA RESPOSTA
                                  </p>
                                  <p className="text-sm text-zinc-900">
                                    {getAnswerText(question.id, item.survey.questions, item.response.answers)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Resultados Globais */}
                              <div>
                                <h4 className="text-sm font-medium text-zinc-700 mb-3">
                                  Resultados Globais
                                </h4>
                                <div className="bg-zinc-50 rounded-sm p-4">
                                  <p className="text-xs text-zinc-600 font-medium mb-3">
                                    PERCENTAGENS ({item.total_responses} respostas)
                                  </p>
                                  {renderGlobalResults(question, item.global_results)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Link para Resultados Completos */}
                      <div className="mt-6 pt-6 border-t border-zinc-100">
                        <Link 
                          to={`/surveys/${item.survey.id}/results`}
                          className="text-sm text-zinc-600 hover:text-zinc-900 hover:underline flex items-center gap-2"
                        >
                          Ver resultados completos desta sondagem
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsesPage;
