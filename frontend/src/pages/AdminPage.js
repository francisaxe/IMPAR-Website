import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, MessageSquare, Shield, Trash2, Send, Eye, FileText, HelpCircle, Tag, ClipboardList, Download, Key, RefreshCw, Copy } from 'lucide-react';

const AdminPage = () => {
  const { api, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [teamApplications, setTeamApplications] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [passwordRecoveryRequests, setPasswordRecoveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [suggestionDialog, setSuggestionDialog] = useState({ open: false, suggestion: null });
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ open: false, user: null, newPassword: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, suggestionsRes, teamAppsRes, surveysRes, recoveryRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/suggestions'),
        api.get('/team-applications'),
        api.get('/surveys'),
        api.get('/admin/password-recovery-requests'),
      ]);
      setUsers(usersRes.data);
      setSuggestions(suggestionsRes.data);
      setTeamApplications(teamAppsRes.data);
      setSurveys(surveysRes.data);
      setPasswordRecoveryRequests(recoveryRes.data);
    } catch (error) {
      toast.error('Falha ao carregar dados de administração');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role?role=${newRole}`);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      toast.success('Função do utilizador atualizada');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao atualizar função');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/admin/users/${deleteDialog.item.id}`);
      setUsers(users.filter((u) => u.id !== deleteDialog.item.id));
      toast.success('Utilizador eliminado');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao eliminar utilizador');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const handleSuggestionStatus = async (suggestionId, status) => {
    try {
      await api.put(`/suggestions/${suggestionId}/status?status=${status}`);
      setSuggestions(
        suggestions.map((s) => (s.id === suggestionId ? { ...s, status } : s))
      );
      toast.success('Estado da sugestão atualizado');
    } catch (error) {
      toast.error('Falha ao atualizar sugestão');
    }
  };

  const handleDeleteSuggestion = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/suggestions/${deleteDialog.item.id}`);
      setSuggestions(suggestions.filter((s) => s.id !== deleteDialog.item.id));
      toast.success('Sugestão eliminada');
    } catch (error) {
      toast.error('Falha ao eliminar sugestão');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const handleDeleteSurvey = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/surveys/${deleteDialog.item.id}`);
      setSurveys(surveys.filter((s) => s.id !== deleteDialog.item.id));
      toast.success('Sondagem eliminada com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao eliminar sondagem');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const submitSuggestion = async () => {
    if (!newSuggestion.trim()) return;
    try {
      const response = await api.post('/suggestions', { content: newSuggestion });
      setSuggestions([response.data, ...suggestions]);
      setNewSuggestion('');
      toast.success('Sugestão submetida');
    } catch (error) {
      toast.error('Falha ao submeter sugestão');
    }
  };

  const handleTeamApplicationStatusChange = async (applicationId, status) => {
    try {
      await api.put(`/team-applications/${applicationId}/status?status=${status}`);
      setTeamApplications(
        teamApplications.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      toast.success('Estado da candidatura atualizado');
    } catch (error) {
      toast.error('Falha ao atualizar candidatura');
    }
  };

  const handleDeleteTeamApplication = async () => {
    if (!deleteDialog.item) return;
    try {
      await api.delete(`/team-applications/${deleteDialog.item.id}`);
      setTeamApplications(teamApplications.filter((app) => app.id !== deleteDialog.item.id));
      toast.success('Candidatura eliminada');
    } catch (error) {
      toast.error('Falha ao eliminar candidatura');
    } finally {
      setDeleteDialog({ open: false, type: '', item: null });
    }
  };

  const handleExportUsersCSV = async () => {
    try {
      const token = localStorage.getItem('impar_token');
      const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;
      
      const response = await axios.get(`${API_URL}/admin/users/export/csv`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `impar_utilizadores_${new Date().toISOString().slice(0,10)}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Ficheiro CSV exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Falha ao exportar dados dos utilizadores');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordDialog.user || !resetPasswordDialog.newPassword) {
      toast.error('Por favor, insira uma nova palavra-passe');
      return;
    }

    if (resetPasswordDialog.newPassword.length < 6) {
      toast.error('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const response = await api.put(
        `/admin/users/${resetPasswordDialog.user.id}/reset-password`,
        null,
        { params: { new_password: resetPasswordDialog.newPassword } }
      );
      
      toast.success(`Password resetada com sucesso para ${resetPasswordDialog.user.email}`);
      setResetPasswordDialog({ open: false, user: null, newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Falha ao resetar password');
    }
  };

  const handleDeleteRecoveryRequest = async (requestId) => {
    try {
      await api.delete(`/admin/password-recovery-requests/${requestId}`);
      setPasswordRecoveryRequests(passwordRecoveryRequests.filter((r) => r.id !== requestId));
      toast.success('Pedido eliminado');
    } catch (error) {
      toast.error('Falha ao eliminar pedido');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado para a área de transferência');
  };

  const getRecoveryStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="rounded-none text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'used':
        return <Badge variant="outline" className="rounded-none text-green-600 border-green-600">Usado</Badge>;
      case 'expired':
        return <Badge variant="outline" className="rounded-none text-red-600 border-red-600">Expirado</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none">{status}</Badge>;
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'multiple_choice': 'Escolha Múltipla',
      'text': 'Texto Livre',
      'rating': 'Escala de Avaliação',
      'yes_no': 'Sim/Não',
      'checkbox': 'Múltipla Seleção'
    };
    return types[type] || type;
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'owner':
        return <Badge className="rounded-none bg-black text-white">Proprietário</Badge>;
      case 'admin':
        return <Badge className="rounded-none bg-zinc-700 text-white">Administrador</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none">Utilizador</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="rounded-none text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="rounded-none text-blue-600 border-blue-600">Revisto</Badge>;
      case 'implemented':
        return <Badge variant="outline" className="rounded-none text-green-600 border-green-600">Implementado</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="rounded-none text-green-600 border-green-600">Aceite</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="rounded-none text-red-600 border-red-600">Rejeitado</Badge>;
      default:
        return <Badge variant="outline" className="rounded-none">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="admin-page">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="label-caps mb-2">Administração</p>
          <h1 className="font-serif text-3xl font-light text-zinc-900 dark:text-white">
            Painel de Administração
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{users.length}</p>
                <p className="text-xs text-zinc-500">Total de Utilizadores</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">
                  {users.filter((u) => u.role === 'admin' || u.role === 'owner').length}
                </p>
                <p className="text-xs text-zinc-500">Administradores</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{suggestions.length}</p>
                <p className="text-xs text-zinc-500">Sugestões</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{teamApplications.length}</p>
                <p className="text-xs text-zinc-500">Candidaturas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">
                  {suggestions.filter((s) => s.status === 'pending').length}
                </p>
                <p className="text-xs text-zinc-500">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-zinc-500" />
              <div>
                <p className="text-2xl font-medium">{surveys.length}</p>
                <p className="text-xs text-zinc-500">Sondagens</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-none bg-zinc-100 dark:bg-zinc-800 p-1 flex-wrap">
            <TabsTrigger value="users" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <Users className="w-4 h-4 mr-2" />
              Utilizadores
            </TabsTrigger>
            <TabsTrigger value="surveys" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <ClipboardList className="w-4 h-4 mr-2" />
              Sondagens
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <MessageSquare className="w-4 h-4 mr-2" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="team-applications" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <Shield className="w-4 h-4 mr-2" />
              Candidaturas
            </TabsTrigger>
            <TabsTrigger value="password-recovery" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recuperação
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-serif text-xl">Gestão de Utilizadores</CardTitle>
                    <CardDescription>Gerir contas e funções de utilizadores</CardDescription>
                  </div>
                  <Button
                    onClick={handleExportUsersCSV}
                    className="rounded-sm bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Registo</TableHead>
                      {isOwner && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {isOwner && user.role !== 'owner' ? (
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-32 rounded-none h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">Utilizador</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(user.role)
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-500">
                          {new Date(user.created_at).toLocaleDateString('pt-PT')}
                        </TableCell>
                        {isOwner && (
                          <TableCell className="text-right">
                            {user.role !== 'owner' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setResetPasswordDialog({ open: true, user, newPassword: '' })}
                                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                  title="Resetar palavra-passe"
                                >
                                  <Key className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteDialog({ open: true, type: 'user', item: user })}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  data-testid={`delete-user-${user.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Gerir Sondagens</CardTitle>
                <CardDescription>Ver e eliminar sondagens da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {surveys.length === 0 ? (
                  <p className="text-center text-zinc-500 py-8">Ainda não há sondagens</p>
                ) : (
                  <div className="space-y-4">
                    {surveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <ClipboardList className="w-4 h-4 text-zinc-400" />
                              <p className="font-medium text-zinc-900 dark:text-white">
                                #{survey.survey_number}. {survey.title}
                              </p>
                              {survey.is_featured && (
                                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                  ⭐ Destacada
                                </Badge>
                              )}
                              {survey.is_published ? (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  ✓ Publicada
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800">
                                  • Rascunho
                                </Badge>
                              )}
                            </div>
                            {survey.description && (
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                                {survey.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                              <span>Criada por {survey.owner_name || 'Admin'}</span>
                              <span>{new Date(survey.created_at).toLocaleDateString('pt-PT')}</span>
                              <span>{survey.questions?.length || 0} perguntas</span>
                              <span>{survey.response_count || 0} respostas</span>
                              {survey.end_date && (
                                <span>Termina: {new Date(survey.end_date).toLocaleDateString('pt-PT')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/surveys/${survey.id}`, '_blank')}
                              className="text-zinc-600 hover:text-zinc-900"
                              title="Ver sondagem"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, type: 'survey', item: survey })}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Eliminar sondagem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-6">
              {/* Submit Suggestion */}
              <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Submeter Sugestão</CardTitle>
                  <CardDescription>Partilhe as suas ideias para melhorar a plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Textarea
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder="A sua sugestão..."
                      className="rounded-none border-zinc-300 dark:border-zinc-700 flex-1"
                      data-testid="suggestion-input"
                    />
                    <Button
                      onClick={submitSuggestion}
                      className="rounded-none bg-black text-white hover:bg-zinc-800"
                      disabled={!newSuggestion.trim()}
                      data-testid="submit-suggestion"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submeter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Suggestions List */}
              <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Todas as Sugestões</CardTitle>
                  <CardDescription>Rever e gerir sugestões dos utilizadores</CardDescription>
                </CardHeader>
                <CardContent>
                  {suggestions.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">Ainda não há sugestões</p>
                  ) : (
                    <div className="space-y-4">
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-4 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div 
                              className="flex-1 cursor-pointer" 
                              onClick={() => setSuggestionDialog({ open: true, suggestion })}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-zinc-400" />
                                <p className="font-medium text-zinc-900 dark:text-white">
                                  {suggestion.survey_title || 'Sugestão'}
                                </p>
                                {suggestion.category && (
                                  <Badge variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {suggestion.category}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                                {suggestion.survey_description || suggestion.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <span>Por {suggestion.user_name}</span>
                                <span>{new Date(suggestion.created_at).toLocaleDateString('pt-PT')}</span>
                                {suggestion.questions && suggestion.questions.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3" />
                                    {suggestion.questions.length} {suggestion.questions.length === 1 ? 'pergunta' : 'perguntas'}
                                  </span>
                                )}
                                {getStatusBadge(suggestion.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSuggestionDialog({ open: true, suggestion })}
                                className="text-zinc-600 hover:text-zinc-900"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Select
                                value={suggestion.status}
                                onValueChange={(value) => handleSuggestionStatus(suggestion.id, value)}
                              >
                                <SelectTrigger className="w-32 rounded-none h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pendente</SelectItem>
                                  <SelectItem value="reviewed">Revisto</SelectItem>
                                  <SelectItem value="implemented">Implementado</SelectItem>
                                  <SelectItem value="rejected">Rejeitado</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, type: 'suggestion', item: suggestion })}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Applications Tab */}
          <TabsContent value="team-applications">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Candidaturas à Equipa</CardTitle>
                <CardDescription>Analisar candidaturas de utilizadores</CardDescription>
              </CardHeader>
              <CardContent>
                {teamApplications.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma candidatura recebida</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamApplications.map((application) => (
                      <div
                        key={application.id}
                        className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-none"
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="font-medium text-zinc-900 dark:text-white">
                              {application.user_name}
                            </h3>
                            <p className="text-sm text-zinc-500">{application.user_email}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                              <span>{new Date(application.created_at).toLocaleDateString('pt-PT')}</span>
                              {getStatusBadge(application.status)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={application.status}
                              onValueChange={(value) => handleTeamApplicationStatusChange(application.id, value)}
                            >
                              <SelectTrigger className="w-32 rounded-none h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="reviewed">Revisto</SelectItem>
                                <SelectItem value="accepted">Aceite</SelectItem>
                                <SelectItem value="rejected">Rejeitado</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, type: 'application', item: application })}
                              className="rounded-none h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-sm">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Recovery Tab */}
          <TabsContent value="password-recovery">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Pedidos de Recuperação de Palavra-passe</CardTitle>
                <CardDescription>
                  Quando um utilizador solicita recuperação de palavra-passe, um código é gerado aqui. 
                  Forneça o código ao utilizador por telefone, mensagem ou outro meio seguro.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordRecoveryRequests.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">
                    <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido de recuperação</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {passwordRecoveryRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-none ${
                          request.status === 'pending' 
                            ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' 
                            : request.status === 'used'
                            ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium text-zinc-900 dark:text-white">
                                {request.user_name}
                              </p>
                              {getRecoveryStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                              {request.user_email}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                              <span>Solicitado: {new Date(request.created_at).toLocaleString('pt-PT')}</span>
                              <span>Expira: {new Date(request.expires_at).toLocaleString('pt-PT')}</span>
                            </div>
                            
                            {request.status === 'pending' && (
                              <div className="bg-white dark:bg-zinc-800 p-3 rounded-sm border border-zinc-200 dark:border-zinc-700">
                                <p className="text-xs text-zinc-500 mb-2">Código de Recuperação:</p>
                                <div className="flex items-center gap-2">
                                  <code className="text-lg font-mono font-bold tracking-widest text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded">
                                    {request.recovery_code}
                                  </code>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(request.recovery_code)}
                                    className="rounded-sm"
                                  >
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copiar
                                  </Button>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2">
                                  Forneça este código ao utilizador. Ele é válido por 24 horas.
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRecoveryRequest(request.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Eliminar pedido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Suggestion Details Dialog */}
      <Dialog open={suggestionDialog.open} onOpenChange={(open) => setSuggestionDialog({ ...suggestionDialog, open })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-medium text-zinc-900 dark:text-white pr-8">
              {suggestionDialog.suggestion?.survey_title || 'Detalhes da Sugestão'}
            </DialogTitle>
            <DialogDescription className="text-zinc-600 dark:text-zinc-400">
              Submetida por {suggestionDialog.suggestion?.user_name} em{' '}
              {suggestionDialog.suggestion?.created_at && new Date(suggestionDialog.suggestion.created_at).toLocaleDateString('pt-PT')}
            </DialogDescription>
          </DialogHeader>

          {suggestionDialog.suggestion && (
            <div className="space-y-6 mt-4">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  Estado
                </label>
                {getStatusBadge(suggestionDialog.suggestion.status)}
              </div>

              {/* Category */}
              {suggestionDialog.suggestion.category && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Categoria
                  </label>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    {suggestionDialog.suggestion.category}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {suggestionDialog.suggestion.survey_description && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md">
                    {suggestionDialog.suggestion.survey_description}
                  </p>
                </div>
              )}

              {/* Questions */}
              {suggestionDialog.suggestion.questions && suggestionDialog.suggestion.questions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 block flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Perguntas Sugeridas ({suggestionDialog.suggestion.questions.length})
                  </label>
                  <div className="space-y-3">
                    {suggestionDialog.suggestion.questions.map((question, index) => (
                      <Card key={question.id || index} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {getQuestionTypeLabel(question.type)}
                                </Badge>
                              </div>
                              <p className="text-sm text-zinc-900 dark:text-white font-medium">
                                {question.text}
                              </p>
                              {question.options && question.options.length > 0 && (
                                <div className="mt-3 pl-4 border-l-2 border-zinc-300 dark:border-zinc-700">
                                  <p className="text-xs text-zinc-500 mb-2">Opções de resposta:</p>
                                  <ul className="space-y-1">
                                    {question.options.map((option, optIndex) => (
                                      <li key={optIndex} className="text-xs text-zinc-600 dark:text-zinc-400">
                                        • {option}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {suggestionDialog.suggestion.additional_notes && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Notas Adicionais
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md whitespace-pre-wrap">
                    {suggestionDialog.suggestion.additional_notes}
                  </p>
                </div>
              )}

              {/* Original Content (fallback) */}
              {!suggestionDialog.suggestion.questions && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                    Conteúdo Original
                  </label>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md whitespace-pre-wrap">
                    {suggestionDialog.suggestion.content}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Select
                  value={suggestionDialog.suggestion.status}
                  onValueChange={(value) => {
                    handleSuggestionStatus(suggestionDialog.suggestion.id, value);
                    setSuggestionDialog({ 
                      open: true, 
                      suggestion: { ...suggestionDialog.suggestion, status: value } 
                    });
                  }}
                >
                  <SelectTrigger className="w-48 rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="reviewed">Revisto</SelectItem>
                    <SelectItem value="implemented">Implementado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  onClick={() => setSuggestionDialog({ open: false, suggestion: null })}
                  className="rounded-sm"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => setResetPasswordDialog({ ...resetPasswordDialog, open })}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Resetar Palavra-passe</DialogTitle>
            <DialogDescription>
              Defina uma nova palavra-passe temporária para <strong>{resetPasswordDialog.user?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-password" className="text-sm mb-2 block">
              Nova Palavra-passe Temporária
            </Label>
            <Input
              id="new-password"
              type="text"
              placeholder="Mínimo 6 caracteres"
              value={resetPasswordDialog.newPassword}
              onChange={(e) => setResetPasswordDialog({ ...resetPasswordDialog, newPassword: e.target.value })}
              className="rounded-sm"
            />
            <p className="text-xs text-zinc-500 mt-2">
              O utilizador deverá usar esta palavra-passe para fazer login e depois alterá-la no seu perfil.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setResetPasswordDialog({ open: false, user: null, newPassword: '' })}
              className="rounded-sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Key className="w-4 h-4 mr-2" />
              Resetar Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar {deleteDialog.type === 'user' ? 'Utilizador' : deleteDialog.type === 'application' ? 'Candidatura' : deleteDialog.type === 'survey' ? 'Sondagem' : 'Sugestão'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'user'
                ? `Tem a certeza que quer eliminar ${deleteDialog.item?.name}? Esta ação não pode ser revertida.`
                : deleteDialog.type === 'application'
                ? 'Tem a certeza de que deseja eliminar esta candidatura? Esta ação não pode ser desfeita.'
                : deleteDialog.type === 'survey'
                ? `Tem a certeza que quer eliminar a sondagem "${deleteDialog.item?.title}"? Esta ação irá eliminar todas as respostas associadas e não pode ser revertida.`
                : 'Tem a certeza que quer eliminar esta sugestão? Esta ação não pode ser revertida.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteDialog.type === 'user' 
                  ? handleDeleteUser 
                  : deleteDialog.type === 'application' 
                  ? handleDeleteTeamApplication 
                  : deleteDialog.type === 'survey'
                  ? handleDeleteSurvey
                  : handleDeleteSuggestion
              }
              className="rounded-none bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
