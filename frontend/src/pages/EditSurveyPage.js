import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Trash2, GripVertical, Star, ArrowLeft, Save } from 'lucide-react';

const EditSurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [survey, setSurvey] = useState(null);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await api.get(`/surveys/${id}`);
      setSurvey({
        ...response.data,
        questions: response.data.questions.map((q) => ({
          ...q,
          options: q.options || (q.type === 'multiple_choice' ? [{ text: '' }] : null),
        })),
      });
    } catch (error) {
      toast.error('Falha ao carregar inquérito');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      type,
      text: '',
      required: true,
      highlighted: false,
      options: type === 'multiple_choice' ? [{ text: '' }] : null,
      min_rating: type === 'rating' ? 1 : null,
      max_rating: type === 'rating' ? 5 : null,
      order: survey.questions.length,
    };
    setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
  };

  const updateQuestion = (index, updates) => {
    const newQuestions = [...survey.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setSurvey({ ...survey, questions: newQuestions });
  };

  const removeQuestion = (index) => {
    const newQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: newQuestions });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options = [
      ...newQuestions[questionIndex].options,
      { text: '' },
    ];
    setSurvey({ ...survey, questions: newQuestions });
  };

  const updateOption = (questionIndex, optionIndex, text) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options[optionIndex].text = text;
    setSurvey({ ...survey, questions: newQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, i) => i !== optionIndex
    );
    setSurvey({ ...survey, questions: newQuestions });
  };

  const handleSubmit = async (publish = null) => {
    if (!survey.title.trim()) {
      toast.error('Por favor, introduza um título para o inquérito');
      return;
    }

    if (survey.questions.length === 0) {
      toast.error('Por favor, adicione pelo menos uma pergunta');
      return;
    }

    for (const q of survey.questions) {
      if (!q.text.trim()) {
        toast.error('Por favor, preencha o texto de todas as perguntas');
        return;
      }
      if (q.type === 'multiple_choice') {
        const validOptions = q.options.filter((o) => o.text.trim());
        if (validOptions.length < 2) {
          toast.error('Perguntas de escolha múltipla precisam de pelo menos 2 opções');
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: survey.title,
        description: survey.description,
        is_featured: survey.is_featured,
        questions: survey.questions.map((q, i) => ({
          type: q.type,
          text: q.text,
          required: q.required,
          highlighted: q.highlighted,
          options: q.options?.filter((o) => o.text.trim()).map((o) => ({ text: o.text })),
          min_rating: q.min_rating,
          max_rating: q.max_rating,
          order: i,
        })),
      };

      if (publish !== null) {
        payload.is_published = publish;
      }

      await api.put(`/surveys/${id}`, payload);
      toast.success('Inquérito atualizado!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao atualizar inquérito');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="edit-survey-page">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="rounded-none"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="label-caps mb-1">Editar</p>
            <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
              {survey.title || 'Inquérito'}
            </h1>
          </div>
        </div>

        {/* Survey Details */}
        <Card className="rounded-none border border-zinc-200 dark:border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Detalhes do Inquérito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Introduza o título do inquérito"
                value={survey.title}
                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                className="rounded-none border-zinc-300 dark:border-zinc-700"
                data-testid="survey-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Introduza uma descrição (opcional)"
                value={survey.description || ''}
                onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                className="rounded-none border-zinc-300 dark:border-zinc-700 min-h-[100px]"
                data-testid="survey-description"
              />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-3">
                <Switch
                  id="published"
                  checked={survey.is_published}
                  onCheckedChange={(checked) => setSurvey({ ...survey, is_published: checked })}
                  data-testid="survey-published"
                />
                <Label htmlFor="published" className="cursor-pointer">
                  Publicado
                </Label>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-3">
                  <Switch
                    id="featured"
                    checked={survey.is_featured}
                    onCheckedChange={(checked) => setSurvey({ ...survey, is_featured: checked })}
                    data-testid="survey-featured"
                  />
                  <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                    <Star className="w-4 h-4" />
                    Destaque
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="mb-8">
          <h2 className="font-serif text-xl font-medium text-zinc-900 dark:text-white mb-4">
            Perguntas
          </h2>

          {survey.questions.length === 0 ? (
            <Card className="rounded-none border border-dashed border-zinc-300 dark:border-zinc-700">
              <CardContent className="py-12 text-center">
                <p className="text-zinc-500 mb-4">Ainda não há perguntas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {survey.questions.map((question, qIndex) => (
                <Card
                  key={question.id}
                  className={`rounded-none border border-zinc-200 dark:border-zinc-800 ${
                    question.highlighted ? 'highlighted-question' : ''
                  }`}
                  data-testid={`question-${qIndex}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="mt-2 text-zinc-400 cursor-move">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <Input
                              placeholder="Introduza o texto da pergunta"
                              value={question.text}
                              onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                              className="rounded-none border-zinc-300 dark:border-zinc-700"
                              data-testid={`question-text-${qIndex}`}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1">
                            {question.type === 'multiple_choice'
                              ? 'Escolha Múltipla'
                              : question.type === 'rating'
                              ? 'Avaliação'
                              : 'Texto'}
                          </span>
                        </div>

                        {question.type === 'multiple_choice' && question.options && (
                          <div className="space-y-2 pl-4">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-zinc-300" />
                                <Input
                                  placeholder={`Opção ${oIndex + 1}`}
                                  value={option.text}
                                  onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                  className="rounded-none border-zinc-300 dark:border-zinc-700 flex-1"
                                  data-testid={`option-${qIndex}-${oIndex}`}
                                />
                                {question.options.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="text-zinc-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(qIndex)}
                              className="text-zinc-500"
                            >
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Adicionar Opção
                            </Button>
                          </div>
                        )}

                        {question.type === 'rating' && (
                          <div className="flex items-center gap-4 pl-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Mín:</Label>
                              <Select
                                value={String(question.min_rating || 1)}
                                onValueChange={(v) => updateQuestion(qIndex, { min_rating: parseInt(v) })}
                              >
                                <SelectTrigger className="w-20 rounded-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[0, 1].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Máx:</Label>
                              <Select
                                value={String(question.max_rating || 5)}
                                onValueChange={(v) => updateQuestion(qIndex, { max_rating: parseInt(v) })}
                              >
                                <SelectTrigger className="w-20 rounded-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[5, 7, 10].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${qIndex}`}
                              checked={question.required}
                              onCheckedChange={(checked) => updateQuestion(qIndex, { required: checked })}
                            />
                            <Label htmlFor={`required-${qIndex}`} className="text-sm cursor-pointer">
                              Obrigatória
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`highlight-${qIndex}`}
                              checked={question.highlighted}
                              onCheckedChange={(checked) => updateQuestion(qIndex, { highlighted: checked })}
                            />
                            <Label htmlFor={`highlight-${qIndex}`} className="text-sm cursor-pointer">
                              Destacar
                            </Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                            className="ml-auto text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Question Buttons */}
        <Card className="rounded-none border border-zinc-200 dark:border-zinc-800 mb-8">
          <CardContent className="p-4">
            <p className="text-sm text-zinc-500 mb-3">Adicionar Pergunta</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple_choice')}
                className="rounded-none"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Escolha Múltipla
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('text')}
                className="rounded-none"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Resposta de Texto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addQuestion('rating')}
                className="rounded-none"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Escala de Avaliação
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-wrap gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="rounded-none"
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => handleSubmit()}
            className="rounded-none bg-black text-white hover:bg-zinc-800 btn-hover-lift"
            disabled={saving}
            data-testid="save-changes"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditSurveyPage;
