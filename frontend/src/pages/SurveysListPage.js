import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Search, ClipboardList, Users, Star } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SurveysListPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(`${API_URL}/surveys?published=true`);
        setSurveys(response.data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="surveys-list-page">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            Sondagens
          </h1>
          <p className="text-zinc-500">
            Participe nas nossas sondagens e faça ouvir a sua voz.
          </p>
        </div>

        {/* Search */}
        <Card className="rounded-none border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Pesquisar sondagens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-none pl-10 border-zinc-300"
                data-testid="search-surveys"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Sondagens */}
        <Card className="rounded-none border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-zinc-100 animate-pulse"></div>
                ))}
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
                <p className="text-zinc-500">Nenhuma sondagem encontrada.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSurveys.map((survey, index) => (
                  <Link
                    key={survey.id}
                    to={`/surveys/${survey.id}/take`}
                    className="block"
                  >
                    <div className="border border-zinc-200 hover:border-zinc-300 transition-colors p-4 bg-white hover:bg-zinc-50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Tag */}
                          <span className="inline-flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2 py-1 mb-2">
                            <ClipboardList className="w-3 h-3" />
                            Sondagem
                          </span>
                          
                          {/* Título */}
                          <h3 className="font-medium text-zinc-900 mb-1">
                            {survey.title}
                          </h3>
                          
                          {/* Descrição */}
                          {survey.description && (
                            <p className="text-sm text-zinc-500 line-clamp-2">
                              {survey.description}
                            </p>
                          )}
                          
                          {/* Meta */}
                          <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                            <span>{formatDate(survey.created_at)}</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {survey.response_count || 0} respostas
                            </span>
                            <span>
                              {survey.questions?.length || 0} perguntas
                            </span>
                          </div>
                        </div>
                        
                        {/* Estrela de Destaque */}
                        {survey.is_featured && (
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SurveysListPage;
