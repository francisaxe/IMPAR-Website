import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Star, Users, Smartphone, CheckCircle, Lightbulb, MapPin } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const [featuredSurveys, setFeaturedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API_URL}/surveys?published=true`);
        setFeaturedSurveys(response.data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="landing-page">
      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Logo Grande */}
          <h1 className="font-serif text-6xl md:text-8xl font-normal tracking-tight text-zinc-900 mb-4">
            IMPAR
          </h1>
          
          {/* Tagline */}
          <p className="font-serif text-lg md:text-xl text-zinc-600 italic mb-12">
            Jornalismo factual. Imparcialidade por método.
          </p>

          {/* Card de Missão */}
          <Card className="rounded-lg border-0 shadow-sm bg-white max-w-2xl mx-auto">
            <CardContent className="py-8 px-6 md:px-10">
              <p className="text-zinc-600 leading-relaxed">
                Vivemos num tempo de abundância informativa e escassez de clareza.
              </p>
              <p className="text-zinc-600 leading-relaxed mt-4">
                A IMPAR nasce para examinar os factos com rigor, contexto e responsabilidade.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secção Em Destaque */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="p-6 md:p-8">
              {/* Título da Secção */}
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h2 className="font-serif text-xl font-medium text-zinc-900">
                  Em Destaque
                </h2>
              </div>

              {/* Lista de Itens */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : featuredSurveys.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">
                  Ainda não há sondagens disponíveis.
                </p>
              ) : (
                <div className="space-y-4">
                  {featuredSurveys.map((survey, index) => (
                    <Link
                      key={survey.id}
                      to={`/surveys/${survey.id}/take`}
                      className="block"
                    >
                      <div className="border border-zinc-100 hover:border-zinc-200 transition-colors p-4 rounded-lg bg-white hover:bg-zinc-50">
                        <div className="flex items-start gap-3">
                          {/* Tag Sondagem */}
                          <span className="inline-flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">
                            <Smartphone className="w-3 h-3" />
                            Sondagem
                          </span>
                          
                          <div className="flex-1">
                            {/* Título */}
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-medium text-zinc-900">
                                {featuredSurveys.length - index}. {survey.title}
                              </h3>
                              {survey.is_featured && (
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                              )}
                            </div>
                            
                            {/* Descrição */}
                            {survey.description && (
                              <p className="text-sm text-zinc-500 mt-1">
                                {survey.description}
                              </p>
                            )}
                            
                            {/* Meta */}
                            <div className="flex items-center justify-between mt-3 text-xs text-zinc-400">
                              <span>{formatDate(survey.created_at)}</span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {survey.response_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secção Participa */}
      <section className="pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="p-6 md:p-8">
              {/* Título da Secção */}
              <div className="flex items-center gap-2 mb-6">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif text-xl font-medium text-zinc-900">
                  Participa nas Nossas Sondagens
                </h2>
              </div>

              {/* Lista de Benefícios */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-zinc-600">Partilhe as suas opiniões valiosas</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-zinc-600">Ajude-nos a descobrir a realidade</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-zinc-600">Veja resultados em tempo real</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Secção Como Participar */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="p-6 md:p-8">
              {/* Título da Secção */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-rose-500" />
                <h2 className="font-serif text-xl font-medium text-zinc-900">
                  Como Participar
                </h2>
              </div>

              <p className="text-zinc-600 leading-relaxed">
                Navegue pelas sondagens disponíveis no separador "Sondagens", complete-as e veja os resultados agregados. 
                Acompanhe a sua participação em "Respostas" e veja como a sua contribuição faz a diferença.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
