import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../components/ui/input';
import SurveyCard from '../components/SurveyCard';
import { Search } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SurveysListPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(`${API_URL}/surveys?published=true`);
        setSurveys(response.data);
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurveys();
  }, []);

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredSurveys = filteredSurveys.filter((s) => s.is_featured);
  const regularSurveys = filteredSurveys.filter((s) => !s.is_featured);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900" data-testid="surveys-list-page">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="label-caps mb-4">Browse</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-zinc-900 dark:text-white mb-6">
            All Surveys
          </h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search surveys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-none pl-10 border-zinc-300 dark:border-zinc-700"
              data-testid="search-surveys"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-zinc-200 dark:bg-zinc-800 animate-pulse"></div>
            ))}
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-lg">No surveys found</p>
          </div>
        ) : (
          <>
            {/* Featured Surveys */}
            {featuredSurveys.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl font-normal text-zinc-900 dark:text-white mb-6">
                  Featured Surveys
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredSurveys.map((survey) => (
                    <SurveyCard key={survey.id} survey={survey} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Surveys */}
            {regularSurveys.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-normal text-zinc-900 dark:text-white mb-6">
                  All Surveys
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularSurveys.map((survey) => (
                    <SurveyCard key={survey.id} survey={survey} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SurveysListPage;
