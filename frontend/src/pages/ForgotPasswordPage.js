import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Key, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: request code, 2: enter code and new password
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    recovery_code: '',
    new_password: '',
    confirm_password: ''
  });

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/request-recovery`, {
        email: formData.email
      });
      setRequestSent(true);
      toast.success('Pedido de recuperação enviado');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error('As palavras-passe não coincidem');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-with-code`, {
        email: formData.email,
        recovery_code: formData.recovery_code.toUpperCase(),
        new_password: formData.new_password
      });
      toast.success('Palavra-passe redefinida com sucesso!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao redefinir palavra-passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4" data-testid="forgot-password-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="font-serif text-4xl font-normal text-zinc-900">IMPAR</h1>
          </Link>
          <p className="font-serif text-sm text-zinc-500 italic mt-2">
            Jornalismo factual. Imparcialidade por método.
          </p>
        </div>

        {/* Form Card */}
        <Card className="rounded-none border-0 shadow-sm bg-white">
          <CardContent className="p-8">
            <h2 className="font-serif text-xl font-medium text-zinc-900 mb-2 text-center">
              Recuperar Palavra-passe
            </h2>
            <p className="text-sm text-zinc-500 text-center mb-6">
              {step === 1 
                ? 'Introduza o seu email para solicitar um código de recuperação'
                : 'Introduza o código fornecido pelo administrador'
              }
            </p>

            {step === 1 && !requestSent && (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm text-zinc-600">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="rounded-none border-zinc-300 pl-10"
                      data-testid="recovery-email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  disabled={loading}
                  data-testid="request-code-btn"
                >
                  {loading ? 'A enviar...' : 'Solicitar Código'}
                </Button>
              </form>
            )}

            {step === 1 && requestSent && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 font-medium">
                    Pedido enviado com sucesso!
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Se o email estiver registado, um código foi gerado.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    Próximos passos:
                  </p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Contacte um administrador do IMPAR</li>
                    <li>Solicite o código de recuperação</li>
                    <li>Use o código para definir nova palavra-passe</li>
                  </ol>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  data-testid="have-code-btn"
                >
                  Já tenho o código
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setRequestSent(false)}
                  className="w-full rounded-none"
                >
                  Enviar novo pedido
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email2" className="text-sm text-zinc-600">
                    Email
                  </Label>
                  <Input
                    id="email2"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-none border-zinc-300"
                    data-testid="reset-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recovery_code" className="text-sm text-zinc-600">
                    Código de Recuperação
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="recovery_code"
                      type="text"
                      placeholder="XXXXXXXX"
                      value={formData.recovery_code}
                      onChange={(e) => setFormData({ ...formData, recovery_code: e.target.value.toUpperCase() })}
                      required
                      maxLength={8}
                      className="rounded-none border-zinc-300 pl-10 uppercase tracking-widest font-mono"
                      data-testid="recovery-code"
                    />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Código de 8 caracteres fornecido pelo administrador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-sm text-zinc-600">
                    Nova Palavra-passe
                  </Label>
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-none border-zinc-300"
                    data-testid="new-password"
                  />
                  <p className="text-xs text-zinc-500">Mínimo 6 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm text-zinc-600">
                    Confirmar Palavra-passe
                  </Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                    minLength={6}
                    className="rounded-none border-zinc-300"
                    data-testid="confirm-password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
                  disabled={loading}
                  data-testid="reset-password-btn"
                >
                  {loading ? 'A redefinir...' : 'Redefinir Palavra-passe'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setRequestSent(false);
                  }}
                  className="w-full rounded-none"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-zinc-500">
              Lembrou-se da palavra-passe?{' '}
              <Link
                to="/login"
                className="text-zinc-900 hover:underline"
              >
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
