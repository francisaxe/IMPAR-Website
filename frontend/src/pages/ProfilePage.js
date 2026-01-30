import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea.jsx';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { User, Mail, Calendar, Shield, Save, Users, LogOut } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [teamMessage, setTeamMessage] = useState('');
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    nationality: user?.nationality || '',
    district: user?.district || '',
    municipality: user?.municipality || '',
    parish: user?.parish || '',
    marital_status: user?.marital_status || '',
    religion: user?.religion || '',
    education_level: user?.education_level || '',
    profession: user?.profession || '',
    lived_abroad: user?.lived_abroad || false,
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTeamApplication = async () => {
    if (!teamMessage.trim()) {
      toast.error('Por favor, escreva uma mensagem');
      return;
    }

    setSubmittingTeam(true);
    try {
      const token = localStorage.getItem('impar_token');
      await axios.post(
        `${API_URL}/team-applications`,
        { message: teamMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Candidatura enviada com sucesso!');
      setShowTeamDialog(false);
      setTeamMessage('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar candidatura');
    } finally {
      setSubmittingTeam(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]" data-testid="profile-page">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* User Identity Card */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardContent className="py-12 text-center">
            <div className="w-24 h-24 bg-zinc-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-zinc-600" />
            </div>
            <h1 className="font-serif text-2xl font-medium text-zinc-900 mb-1">
              {user?.name}
            </h1>
            <p className="text-zinc-500 text-sm">{user?.email}</p>
          </CardContent>
        </Card>

        {/* Personal Data Section */}
        <Card className="rounded-lg border-0 shadow-sm bg-white mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-medium">Dados Pessoais</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-600"
                onClick={() => toast.info('Modo de edição em breve')}
              >
                ✏️ Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Nome</span>
                <span className="text-zinc-900 text-sm font-medium">{user?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Data de Nascimento</span>
                <span className="text-zinc-900 text-sm">{formData.date_of_birth || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Género</span>
                <span className="text-zinc-900 text-sm">{formData.gender || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Nacionalidade</span>
                <span className="text-zinc-900 text-sm">{formData.nationality || 'Portuguese'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Distrito</span>
                <span className="text-zinc-900 text-sm">{formData.district || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Concelho</span>
                <span className="text-zinc-900 text-sm">{formData.municipality || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Freguesia</span>
                <span className="text-zinc-900 text-sm">{formData.parish || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Estado Civil</span>
                <span className="text-zinc-900 text-sm">{formData.marital_status || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Religião</span>
                <span className="text-zinc-900 text-sm">{formData.religion || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Nível de Escolaridade</span>
                <span className="text-zinc-900 text-sm">{formData.education_level || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-100">
                <span className="text-zinc-500 text-sm">Profissão</span>
                <span className="text-zinc-900 text-sm">{formData.profession || 'Software Tester'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-500 text-sm">Viveu no Estrangeiro</span>
                <span className="text-zinc-900 text-sm">{formData.lived_abroad ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <div className="text-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-none border-red-500 text-red-500 hover:bg-red-50"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Terminar Sessão
          </Button>
        </div>
      </div>

      {/* Team Application Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium text-zinc-900">
              Juntar-se à Equipa IMPAR
            </DialogTitle>
            <DialogDescription className="text-zinc-600 pt-2">
              Fale-nos um pouco sobre si, e porque se quer juntar à nossa equipa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Escreva aqui a sua mensagem..."
              value={teamMessage}
              onChange={(e) => setTeamMessage(e.target.value)}
              className="min-h-[200px] rounded-sm border-zinc-300 resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleTeamApplication}
              disabled={submittingTeam}
              className="w-full rounded-none bg-zinc-900 text-white hover:bg-zinc-800 py-6"
            >
              {submittingTeam ? 'A enviar...' : 'Enviar Candidatura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
