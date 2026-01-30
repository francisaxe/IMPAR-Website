import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ClipboardList, Users, Star, ArrowRight } from 'lucide-react';
import ShareButtons from './ShareButtons';

const SurveyCard = ({ survey, showActions = false, onEdit, onDelete }) => {
  const questionCount = survey.questions?.length || 0;

  return (
    <Card
      className="rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 card-hover overflow-hidden"
      data-testid={`survey-card-${survey.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {survey.is_featured && (
                <Badge variant="secondary" className="rounded-none bg-black text-white dark:bg-white dark:text-black">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {survey.is_published ? (
                <Badge variant="outline" className="rounded-none text-green-600 border-green-600">
                  Published
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-none text-zinc-500 border-zinc-400">
                  Draft
                </Badge>
              )}
            </div>
            <h3 className="font-serif text-xl font-medium text-zinc-900 dark:text-white mb-2">
              {survey.title}
            </h3>
            {survey.description && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                {survey.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <ClipboardList className="w-4 h-4" />
            <span>{questionCount} question{questionCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{survey.response_count || 0} response{(survey.response_count || 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {survey.owner_name && (
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Created by {survey.owner_name}
          </p>
        )}
      </CardContent>

      <CardFooter className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        {showActions ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => onEdit?.(survey)}
                data-testid={`edit-survey-${survey.id}`}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete?.(survey)}
                data-testid={`delete-survey-${survey.id}`}
              >
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              {survey.is_published && (
                <ShareButtons surveyId={survey.id} surveyTitle={survey.title} />
              )}
              <Link to={`/surveys/${survey.id}/results`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  data-testid={`view-results-${survey.id}`}
                >
                  Results
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full justify-between">
            {survey.is_published && (
              <ShareButtons surveyId={survey.id} surveyTitle={survey.title} />
            )}
            <Link to={survey.is_published ? `/surveys/${survey.id}/take` : `/surveys/${survey.id}`}>
              <Button
                size="sm"
                className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 btn-hover-lift"
                data-testid={`take-survey-${survey.id}`}
              >
                {survey.is_published ? 'Take Survey' : 'View'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SurveyCard;
