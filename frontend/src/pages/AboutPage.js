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
          <h1 className="font-serif text-6xl font-normal text-zinc-900 mb-4">
            IMPAR
          </h1>
          <p className="font-serif text-lg text-zinc-600 italic">
            Jornalismo factual. Imparcialidade por método.
          </p>
        </div>

        {/* O Problema */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-6 text-center">
              O Problema
            </h2>
            <div className="space-y-4 text-zinc-600 leading-relaxed">
              <p>
                Vivemos num tempo de abundância informativa e escassez de clareza. Nunca houve tanta informação disponível, 
                nem tantos canais a produzi-la, mas essa quantidade não se traduziu numa melhor compreensão da realidade. 
                A velocidade e a fragmentação transformaram a informação num fluxo constante de ruído.
              </p>
              <p>
                Grande parte do jornalismo contemporâneo passou a competir pela reação imediata — pelo clique, pela partilha, 
                pela emoção — em detrimento do contexto, da verificação e da responsabilidade. Factos surgem sem enquadramento, 
                opiniões confundem-se com informação e a urgência substitui o rigor.
              </p>
              <p>
                O problema não é a falta de informação, é a dificuldade crescente em compreender a realidade de forma clara, 
                equilibrada e fundamentada.
              </p>
              <p className="text-center font-medium text-zinc-900 mt-6">
                É neste contexto que a IMPAR nasce.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer sobre sondagens */}
        <p className="text-center text-sm text-zinc-500 italic mb-8">
          Estes são resultados de algumas sondagens que nos foram apresentadas antes da primeira volta das eleições presidenciais de 2026.
        </p>

        {/* A Nossa Resposta */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-8">
            <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-6 text-center">
              A Nossa Resposta
            </h2>
            <p className="text-zinc-600 leading-relaxed text-center">
              A resposta da IMPAR é simples, mas exigente: entender qual a realidade em que vivemos e analisá-la com 
              <strong className="text-zinc-900"> imparcialidade, independência e rigor</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Participa nas Nossas Sondagens */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
              <h2 className="font-serif text-2xl font-medium text-zinc-900">
                Participa nas Nossas Sondagens
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-600">Partilhe as suas opiniões valiosas</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-600">Ajude-nos a descobrir a realidade</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-600">Veja resultados em tempo real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Como Participar */}
        <Card className="rounded-lg border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <div className="flex items-start gap-3 mb-4">
              <Target className="w-6 h-6 text-rose-500 flex-shrink-0 mt-1" />
              <h2 className="font-serif text-2xl font-medium text-zinc-900">
                Como Participar
              </h2>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Navegue pelas sondagens disponíveis no separador <strong>"Sondagens"</strong>, complete-as e veja os resultados agregados. 
              Acompanhe a sua participação em <strong>"Respostas"</strong> e veja como a sua contribuição faz a diferença.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
