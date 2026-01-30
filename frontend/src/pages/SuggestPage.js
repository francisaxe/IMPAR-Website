import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea.jsx';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { Lightbulb, Send, CheckCircle, Plus, Trash2 } from 'lucide-react';

const SuggestPage = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    surveyTitle: '',
    surveyDescription: '',
    category: '',
    questions: [],
    additionalNotes: '',
  });

  const questionTypes = [
    { value: 'multiple_choice', label: 'Escolha Múltipla' },
    { value: 'text', label: 'Texto Livre' },
    { value: 'rating', label: 'Escala de Avaliação' },
    { value: 'yes_no', label: 'Sim/Não' },
    { value: 'checkbox', label: 'Múltipla Seleção' },
  ];

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { type: '', text: '', id: Date.now() }
      ]
    });
  };

  const removeQuestion = (id) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== id)
    });
  };

  const updateQuestion = (id, field, value) => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      )
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Precisa de iniciar sessão para submeter uma sugestão');
      navigate('/login');
      return;
    }

    if (!formData.surveyTitle.trim()) {
      toast.error('Por favor, preencha o título da sondagem');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Por favor, adicione pelo menos uma questão');
      return;
    }

    // Validar que todas as questões têm tipo e texto
    const invalidQuestions = formData.questions.filter(q => !q.type || !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast.error('Por favor, preencha o tipo e texto de todas as questões');
      return;
    }

    setLoading(true);
    try {
      // Formatar conteúdo da sugestão
      let content = `TÍTULO DA SONDAGEM: ${formData.surveyTitle}\n\n`;
      
      if (formData.surveyDescription) {
        content += `DESCRIÇÃO: ${formData.surveyDescription}\n\n`;
      }
      
      if (formData.category) {
        content += `CATEGORIA: ${formData.category}\n\n`;
      }
      
      content += `QUESTÕES SUGERIDAS:\n`;
      formData.questions.forEach((q, index) => {
        const typeLabel = questionTypes.find(t => t.value === q.type)?.label || q.type;
        content += `\n${index + 1}. [${typeLabel}] ${q.text}`;
      });
      
      if (formData.additionalNotes) {
        content += `\n\nNOTAS ADICIONAIS: ${formData.additionalNotes}`;
      }
      
      await api.post('/suggestions', { content });
      setSubmitted(true);
      toast.success('Sugestão submetida com sucesso!');
    } catch (error) {
      toast.error('Falha ao submeter sugestão');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]" data-testid="suggest-page">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <Card className="rounded-lg border-0 shadow-sm bg-white">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="font-serif text-2xl font-medium text-zinc-900 mb-2">
                Sugestão Recebida
              </h2>
              <p className="text-zinc-500 mb-6">
                Obrigado pela sua contribuição. A sua sugestão será analisada pela nossa equipa editorial.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ title: '', description: '', context: '' });
                }}
                variant="outline"
                className="rounded-none"
              >
                Submeter outra sugestão
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="suggest-page">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-amber-100 mx-auto mb-4 flex items-center justify-center rounded-sm">
            <Lightbulb className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-zinc-900 mb-2">
            Sugerir Sondagem
          </h1>
          <p className="text-zinc-500">
            Tem uma ideia para uma sondagem? Partilhe connosco.
          </p>
        </div>

        {/* Form */}
        <Card className="rounded-lg border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            {!user && (
              <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-sm text-amber-800">
                Precisa de <button onClick={() => navigate('/login')} className="underline font-medium">iniciar sessão</button> para submeter uma sugestão.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-zinc-700">
                  Título da Sondagem *
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Eleições autárquicas 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="rounded-none border-zinc-300"
                  data-testid="suggest-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-zinc-700">
                  Descrição *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o que gostaria de saber através desta sondagem..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-none border-zinc-300 min-h-[120px]"
                  data-testid="suggest-description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context" className="text-sm font-medium text-zinc-700">
                  Contexto (opcional)
                </Label>
                <Textarea
                  id="context"
                  placeholder="Porquê esta sondagem é relevante? Qual o contexto atual?"
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="rounded-none border-zinc-300 min-h-[100px]"
                  data-testid="suggest-context"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !user}
                className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                data-testid="submit-suggestion"
              >
                {loading ? (
                  'A submeter...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submeter Sugestão
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-sm text-zinc-500 mt-6">
          Todas as sugestões são analisadas pela nossa equipa editorial. Nem todas as sugestões 
          serão transformadas em sondagens, mas todas são consideradas.
        </p>
      </div>
    </div>
  );
};

export default SuggestPage;
