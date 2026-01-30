import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
import SurveyCard from '../components/SurveyCard';
import { toast } from 'sonner';
import { PlusCircle, BarChart3, ClipboardList, Users } from 'lucide-react';

const DashboardPage = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, survey: null });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await api.get('/surveys/my');
      setSurveys(response.data);
    } catch (error) {
      toast.error('Failed to fetch surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (survey) => {
    navigate(`/surveys/${survey.id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteDialog.survey) return;
    try {
      await api.delete(`/surveys/${deleteDialog.survey.id}`);
      setSurveys(surveys.filter((s) => s.id !== deleteDialog.survey.id));
      toast.success('Survey deleted');
    } catch (error) {
      toast.error('Failed to delete survey');
    } finally {
      setDeleteDialog({ open: false, survey: null });
    }
  };

  const stats = {
    totalSurveys: surveys.length,
    publishedSurveys: surveys.filter((s) => s.is_published).length,
    totalResponses: surveys.reduce((acc, s) => acc + (s.response_count || 0), 0),
    totalQuestions: surveys.reduce((acc, s) => acc + (s.questions?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <p className="label-caps mb-2">Dashboard</p>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-zinc-900 dark:text-white">
              Welcome, {user?.name}
            </h1>
          </div>
          <Link to="/surveys/create">
            <Button
              className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 btn-hover-lift"
              data-testid="dashboard-create-survey"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-medium">{stats.totalSurveys}</p>
                  <p className="text-sm text-zinc-500">Total Surveys</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-medium">{stats.publishedSurveys}</p>
                  <p className="text-sm text-zinc-500">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-medium">{stats.totalResponses}</p>
                  <p className="text-sm text-zinc-500">Total Responses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-medium">{stats.totalQuestions}</p>
                  <p className="text-sm text-zinc-500">Total Questions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Surveys List */}
        <div>
          <h2 className="font-serif text-2xl font-normal text-zinc-900 dark:text-white mb-6">
            Your Surveys
          </h2>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
              ))}
            </div>
          ) : surveys.length === 0 ? (
            <Card className="rounded-none border border-zinc-200 dark:border-zinc-800">
              <CardContent className="py-16 text-center">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
                <h3 className="font-serif text-xl font-medium mb-2">No surveys yet</h3>
                <p className="text-zinc-500 mb-6">Create your first survey to get started</p>
                <Link to="/surveys/create">
                  <Button className="rounded-none bg-black text-white hover:bg-zinc-800">
                    Create Survey
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {surveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  showActions
                  onEdit={handleEdit}
                  onDelete={(s) => setDeleteDialog({ open: true, survey: s })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Survey</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.survey?.title}"? This action cannot be undone and all responses will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-none bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
