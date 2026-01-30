import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Smartphone, Star, Share2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SurveysListPage = () => {
  const { user, api, isAdmin } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('impar_token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_URL}/surveys?published=true`, config);
      setSurveys(response.data);
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (e, surveyId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAdmin) {
      toast.error('Apenas administradores podem destacar sondagens');
      return;
    }

    try {
      await api.put(`/surveys/${surveyId}/toggle-featured`);
      // Atualizar lista localmente
      setSurveys(surveys.map(s => 
        s.id === surveyId ? { ...s, is_featured: !s.is_featured } : s
      ));
      toast.success('Estado de destaque atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar destaque');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).replace('.', '');
  };

  const handleShare = (e, survey) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/surveys/${survey.id}/take`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado!');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="surveys-list-page">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Lista de Sondagens */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-lg border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="h-32 bg-zinc-100 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : surveys.length === 0 ? (
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="py-16 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
              <p className="text-zinc-500">Ainda não há sondagens disponíveis.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {surveys.map((survey, index) => (
              <Link
                key={survey.id}
                to={`/surveys/${survey.id}/take`}
                className="block"
              >
                <Card className="rounded-lg border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Ícone */}
                      <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-5 h-5 text-sky-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Badges de Status */}
                        <div className="flex items-center gap-2 mb-2">
                          {survey.user_has_responded && (
                            <Badge className="rounded-sm bg-emerald-600 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Respondida
                            </Badge>
                          )}
                          {survey.end_date && new Date(survey.end_date) < new Date() && (
                            <Badge variant="outline" className="rounded-sm text-zinc-500 border-zinc-400 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Encerrada
                            </Badge>
                          )}
                        </div>

                        {/* Título e Estrela */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-lg font-medium text-zinc-900">
                            {surveys.length - index}. {survey.title}
                          </h3>
                          <button
                            onClick={(e) => toggleFeatured(e, survey.id)}
                            className={`flex-shrink-0 transition-colors ${
                              survey.is_featured
                                ? 'text-amber-500 hover:text-amber-600'
                                : 'text-zinc-300 hover:text-zinc-400'
                            } ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
                            disabled={!isAdmin}
                            title={isAdmin ? 'Destacar/Remover destaque' : ''}
                          >
                            <Star className={`w-5 h-5 ${survey.is_featured ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Descrição */}
                        {survey.description && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {survey.description}
                          </p>
                        )}
                        
                        {/* Separador */}
                        <hr className="my-4 border-zinc-100" />
                        
                        {/* Footer: Partilhar */}
                        <div className="flex items-center justify-between">
                          <div></div>
                          <button
                            onClick={(e) => handleShare(e, survey)}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Datas */}
                        <div className="mt-3 text-xs text-zinc-400 space-y-0.5">
                          <p>Criada: {formatDate(survey.created_at)}</p>
                          {survey.end_date && (
                            <p>Termina: {formatDate(survey.end_date)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveysListPage;
