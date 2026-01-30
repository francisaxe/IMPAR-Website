import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { CheckCircle, ChevronRight } from 'lucide-react';

const ResponsesPage = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchResponses();
  }, [user]);

  const fetchResponses = async () => {
    try {
      const res = await api.get('/user/responses');
      setResponses(res.data);
    } catch (error) {
      // Se o endpoint não existir, mostrar lista vazia
      console.log('Could not fetch responses');
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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="responses-page">
      <div className="max-w-3xl mx-auto px-6 py-12">
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
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="p-2">
              <div className="divide-y divide-zinc-100">
                {responses.map((response, index) => (
                  <Link
                    key={response.id}
                    to={`/surveys/${response.survey_id}/results`}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 transition-colors rounded-lg"
                  >
                    {/* Ícone Verde */}
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900">
                        {response.survey_number || (responses.length - index)}. {response.survey_title || 'Sondagem'}
                      </h3>
                      <p className="text-sm text-zinc-400 mt-0.5">
                        Respondido em {formatDate(response.submitted_at)}
                      </p>
                    </div>
                    
                    {/* Seta */}
                    <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResponsesPage;
