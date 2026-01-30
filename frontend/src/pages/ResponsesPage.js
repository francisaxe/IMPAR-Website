import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { MessageCircle, ClipboardList, Calendar, ChevronRight } from 'lucide-react';

const ResponsesPage = () => {
  const { api, user } = useAuth();
  const [responses, setResponses] = useState([]);
  const [surveys, setSurveys] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      // Buscar sondagens do utilizador
      const surveysRes = await api.get('/surveys/my');
      const userSurveys = surveysRes.data;
      
      // Buscar respostas de cada sondagem
      const allResponses = [];
      const surveysMap = {};
      
      for (const survey of userSurveys) {
        surveysMap[survey.id] = survey;
        try {
          const responsesRes = await api.get(`/surveys/${survey.id}/responses`);
          responsesRes.data.forEach(r => {
            allResponses.push({ ...r, survey });
          });
        } catch (e) {
          // Pode não ter permissão para algumas sondagens
        }
      }
      
      setSurveys(surveysMap);
      setResponses(allResponses.sort((a, b) => 
        new Date(b.submitted_at) - new Date(a.submitted_at)
      ));
    } catch (error) {
      toast.error('Falha ao carregar respostas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="responses-page">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-zinc-100 mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            Respostas
          </h1>
          <p className="text-zinc-500">
            Veja as respostas às suas sondagens.
          </p>
        </div>

        {/* Respostas */}
        <Card className="rounded-none border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                <p className="text-zinc-500 mb-2">Ainda não há respostas.</p>
                <p className="text-sm text-zinc-400">
                  Quando alguém responder às suas sondagens, aparecerá aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {responses.map((response) => (
                  <Link
                    key={response.id}
                    to={`/surveys/${response.survey_id}/results`}
                    className="block"
                  >
                    <div className="border border-zinc-200 hover:border-zinc-300 transition-colors p-4 hover:bg-zinc-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="rounded-none text-xs">
                              <ClipboardList className="w-3 h-3 mr-1" />
                              {response.survey?.title || 'Sondagem'}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-600">
                            {response.answers?.length || 0} pergunta{(response.answers?.length || 0) !== 1 ? 's' : ''} respondida{(response.answers?.length || 0) !== 1 ? 's' : ''}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(response.submitted_at)}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link para Dashboard */}
        <div className="text-center mt-8">
          <Link 
            to="/dashboard" 
            className="text-sm text-zinc-500 hover:text-zinc-700 underline"
          >
            Ver todas as suas sondagens no Painel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResponsesPage;
