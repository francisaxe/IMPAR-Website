import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Send, Star } from 'lucide-react';
import ShareButtons from '../components/ShareButtons';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TakeSurveyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await axios.get(`${API_URL}/surveys/${id}`);
      if (!response.data.is_published) {
        toast.error('Este inquérito não está disponível');
        navigate('/surveys');
        return;
      }
      setSurvey(response.data);
    } catch (error) {
      toast.error('Inquérito não encontrado');
      navigate('/surveys');
    } finally {
      setLoading(false);
    }
  };

  const setAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    // Validate required questions
    for (const q of survey.questions) {
      if (q.required && !answers[q.id]) {
        toast.error(`Por favor, responda: "${q.text}"`);
        const qIndex = survey.questions.findIndex((question) => question.id === q.id);
        setCurrentQuestion(qIndex);
        return;
      }
      // Validate checkbox has at least one selection
      if (q.type === 'checkbox' && q.required && answers[q.id]) {
        const selected = answers[q.id].split(',').filter(Boolean);
        if (selected.length === 0) {
          toast.error(`Por favor, selecione pelo menos uma opção: "${q.text}"`);
          const qIndex = survey.questions.findIndex((question) => question.id === q.id);
          setCurrentQuestion(qIndex);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([question_id, value]) => ({
          question_id,
          value: String(value),
        })),
      };

      if (user) {
        await api.post(`/surveys/${id}/respond`, payload);
      } else {
        await axios.post(`${API_URL}/surveys/${id}/respond`, payload);
      }

      setSubmitted(true);
      toast.success('Obrigado por completar o inquérito!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao submeter inquérito');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500">A carregar inquérito...</div>
      </div>
    );
  }

  if (!survey) return null;

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4" data-testid="survey-complete">
        <Card className="rounded-none border border-zinc-200 dark:border-zinc-800 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-black dark:bg-white mx-auto mb-6 flex items-center justify-center">
              <Send className="w-8 h-8 text-white dark:text-black" />
            </div>
            <h2 className="font-serif text-2xl font-medium mb-2">Obrigado!</h2>
            <p className="text-zinc-500 mb-6">A sua resposta foi registada.</p>
            <div className="flex flex-col gap-3">
              <ShareButtons surveyId={survey.id} surveyTitle={survey.title} />
              <Button
                variant="outline"
                onClick={() => navigate('/surveys')}
                className="rounded-none"
              >
                Ver Mais Inquéritos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => setAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div
                key={option.id}
                className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => setAnswer(question.id, option.id)}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'text':
        return (
          <Textarea
            placeholder="Escreva a sua resposta aqui..."
            value={answers[question.id] || ''}
            onChange={(e) => setAnswer(question.id, e.target.value)}
            className="rounded-none border-zinc-300 dark:border-zinc-700 min-h-[150px]"
            data-testid="text-answer"
          />
        );

      case 'rating':
        const min = question.min_rating || 1;
        const max = question.max_rating || 5;
        const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {range.map((num) => (
                <button
                  key={num}
                  onClick={() => setAnswer(question.id, num)}
                  className={`w-12 h-12 flex items-center justify-center border transition-all ${
                    answers[question.id] === num
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }`}
                  data-testid={`rating-${num}`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>{min} - Baixo</span>
              <span>{max} - Alto</span>
            </div>
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAnswer(question.id, 'Sim')}
              className={`flex-1 max-w-[200px] py-4 px-6 border transition-all ${
                answers[question.id] === 'Sim'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-emerald-600'
              }`}
              data-testid="yes-button"
            >
              Sim
            </button>
            <button
              onClick={() => setAnswer(question.id, 'Não')}
              className={`flex-1 max-w-[200px] py-4 px-6 border transition-all ${
                answers[question.id] === 'Não'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-red-600'
              }`}
              data-testid="no-button"
            >
              Não
            </button>
          </div>
        );

      case 'checkbox':
        const selectedCheckboxes = answers[question.id] ? answers[question.id].split(',') : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => {
              const isChecked = selectedCheckboxes.includes(option.id);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      let newSelected;
                      if (e.target.checked) {
                        newSelected = [...selectedCheckboxes, option.id];
                      } else {
                        newSelected = selectedCheckboxes.filter(id => id !== option.id);
                      }
                      setAnswer(question.id, newSelected.join(','));
                    }}
                    className="w-5 h-5 rounded border-zinc-300"
                    data-testid={`checkbox-${option.id}`}
                  />
                  <span className="text-zinc-900 dark:text-white">{option.text}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="take-survey-page">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/surveys')}
            className="rounded-none mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Inquéritos
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {survey.is_featured && (
                  <span className="inline-flex items-center gap-1 text-xs bg-black text-white dark:bg-white dark:text-black px-2 py-1">
                    <Star className="w-3 h-3" />
                    Destaque
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
                {survey.title}
              </h1>
              {survey.description && (
                <p className="text-zinc-500 mt-2">{survey.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-zinc-500 mb-2">
            <span>Pergunta {currentQuestion + 1} de {survey.questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
          <Progress value={progress} className="h-1 rounded-none" />
        </div>

        {/* Question Card */}
        <Card className={`rounded-none border border-zinc-200 dark:border-zinc-800 mb-8 ${question.highlighted ? 'highlighted-question' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="font-serif text-xl font-medium">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </CardTitle>
            </div>
            {question.highlighted && (
              <CardDescription className="text-sm font-medium text-black dark:text-white">
                Pergunta Importante
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {renderQuestionInput()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="rounded-none"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentQuestion < survey.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 btn-hover-lift"
            >
              Seguinte
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 btn-hover-lift"
              data-testid="submit-survey"
            >
              {submitting ? 'A submeter...' : 'Submeter Inquérito'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeSurveyPage;
