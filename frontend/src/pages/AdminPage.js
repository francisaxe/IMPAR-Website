import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
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
import { Users, MessageSquare, Shield, Trash2, Send, Eye, FileText, HelpCircle, Tag } from 'lucide-react';

const AdminPage = () => {
  const { api, isOwner } = useAuth();
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [teamApplications, setTeamApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [suggestionDialog, setSuggestionDialog] = useState({ open: false, suggestion: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, suggestionsRes, teamAppsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/suggestions'),
        api.get('/team-applications'),
      ]);
      setUsers(usersRes.data);
      setSuggestions(suggestionsRes.data);
      setTeamApplications(teamAppsRes.data);
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
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-none bg-zinc-100 dark:bg-zinc-800 p-1">
            <TabsTrigger value="users" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <Users className="w-4 h-4 mr-2" />
              Utilizadores
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <MessageSquare className="w-4 h-4 mr-2" />
              Sugestões
            </TabsTrigger>
            <TabsTrigger value="team-applications" className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950">
              <Shield className="w-4 h-4 mr-2" />
              Candidaturas
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Gestão de Utilizadores</CardTitle>
                <CardDescription>Gerir contas e funções de utilizadores</CardDescription>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, type: 'user', item: user })}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                data-testid={`delete-user-${user.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminar {deleteDialog.type === 'user' ? 'Utilizador' : deleteDialog.type === 'application' ? 'Candidatura' : 'Sugestão'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'user'
                ? `Tem a certeza que quer eliminar ${deleteDialog.item?.name}? Esta ação não pode ser revertida.`
                : deleteDialog.type === 'application'
                ? 'Tem a certeza de que deseja eliminar esta candidatura? Esta ação não pode ser desfeita.'
                : 'Tem a certeza que quer eliminar esta sugestão? Esta ação não pode ser revertida.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteDialog.type === 'user' ? handleDeleteUser : deleteDialog.type === 'application' ? handleDeleteTeamApplication : handleDeleteSuggestion}
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
