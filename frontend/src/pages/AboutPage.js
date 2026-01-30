import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Target, Eye, Scale, Shield } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Rigor',
      description: 'Cada sondagem é construída com metodologia transparente e critérios claros de participação.',
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Transparência',
      description: 'Os resultados são apresentados de forma clara, com acesso aos dados e à metodologia utilizada.',
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: 'Imparcialidade',
      description: 'Não tomamos partido. Apresentamos os factos e deixamos que tire as suas próprias conclusões.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Privacidade',
      description: 'A sua participação é protegida. Valorizamos a sua opinião e respeitamos a sua privacidade.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="about-page">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-zinc-900 mb-4">
            Sobre a IMPAR
          </h1>
          <p className="font-serif text-lg text-zinc-600 italic">
            Jornalismo factual. Imparcialidade por método.
          </p>
        </div>

        {/* Missão */}
        <Card className="rounded-none border-0 shadow-sm bg-white mb-8">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-4">
              A Nossa Missão
            </h2>
            <div className="space-y-4 text-zinc-600 leading-relaxed">
              <p>
                Vivemos num tempo de abundância informativa e escassez de clareza. A cada dia, somos 
                bombardeados com dados, opiniões e narrativas que competem pela nossa atenção.
              </p>
              <p>
                A IMPAR nasce para examinar os factos com rigor, contexto e responsabilidade. Acreditamos 
                que a opinião pública merece ser ouvida e representada de forma fiel, sem distorções ou 
                agendas ocultas.
              </p>
              <p>
                Através das nossas sondagens, procuramos captar o pulso da sociedade portuguesa, dando 
                voz aos cidadãos e contribuindo para um debate público mais informado e democrático.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card className="rounded-none border-0 shadow-sm bg-white mb-8">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-6">
              Os Nossos Valores
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-100 flex items-center justify-center text-zinc-600">
                    {value.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-zinc-900 mb-1">{value.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Como Funciona */}
        <Card className="rounded-none border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-4">
              Como Funciona
            </h2>
            <div className="space-y-4 text-zinc-600 leading-relaxed">
              <p>
                <strong className="text-zinc-900">1. Criação de Sondagens</strong> — As nossas sondagens são 
                criadas com perguntas claras e opções de resposta equilibradas. Cada sondagem passa por 
                uma revisão editorial antes de ser publicada.
              </p>
              <p>
                <strong className="text-zinc-900">2. Participação</strong> — Qualquer pessoa pode participar 
                nas sondagens publicadas. As respostas são anónimas e os dados são tratados com total 
                confidencialidade.
              </p>
              <p>
                <strong className="text-zinc-900">3. Resultados</strong> — Os resultados são apresentados de 
                forma transparente, com visualizações claras e acesso aos dados agregados. Nunca 
                manipulamos ou distorcemos os resultados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
