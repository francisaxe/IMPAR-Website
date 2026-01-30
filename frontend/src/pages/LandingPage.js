import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import SurveyCard from '../components/SurveyCard';
import { ArrowRight, BarChart3, Users, Shield, Sparkles } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const [featuredSurveys, setFeaturedSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await axios.get(`${API_URL}/surveys?featured=true&published=true`);
        setFeaturedSurveys(response.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch featured surveys:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Real-time Analytics',
      description: 'Track responses as they come in with detailed breakdowns and visualizations.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Easy Distribution',
      description: 'Share surveys via social media, email, or direct links with one click.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security standards.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Content Highlighting',
      description: 'Emphasize important questions to guide respondents through your survey.',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-zinc-950 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,0,0,0.02),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="stagger-children">
              <p className="label-caps mb-4">Survey Platform</p>
              <h1 className="font-serif text-5xl md:text-7xl font-light tracking-tight text-zinc-900 dark:text-white mb-6">
                Create surveys that <span className="font-medium">matter</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 max-w-xl">
                IMPAR helps you design, distribute, and analyze surveys with precision. 
                Gather insights that drive decisions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-8 btn-hover-lift"
                    data-testid="hero-get-started"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/surveys">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-none border-zinc-300 dark:border-zinc-700 px-8"
                    data-testid="hero-browse"
                  >
                    Browse Surveys
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1760471461590-f81d45dc78ee?crop=entropy&cs=srgb&fm=jpg&q=85&w=800"
                  alt="Survey visualization"
                  className="w-full h-full object-cover grayscale"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-black dark:bg-white"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="label-caps mb-4">Features</p>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-zinc-900 dark:text-white">
              Everything you need
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-lg font-medium text-zinc-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Surveys Section */}
      {featuredSurveys.length > 0 && (
        <section className="py-24 bg-white dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <p className="label-caps mb-4">Discover</p>
                <h2 className="font-serif text-3xl md:text-5xl font-normal text-zinc-900 dark:text-white">
                  Featured Surveys
                </h2>
              </div>
              <Link to="/surveys">
                <Button variant="outline" className="rounded-none hidden sm:flex" data-testid="view-all-surveys">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 animate-pulse"></div>
                ))
              ) : (
                featuredSurveys.map((survey) => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-black dark:bg-white text-white dark:text-black">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-light mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-zinc-400 dark:text-zinc-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users creating impactful surveys. Start gathering insights today.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="rounded-none bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800 px-12 btn-hover-lift"
              data-testid="cta-create-account"
            >
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-serif text-2xl font-semibold">IMPAR</div>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} IMPAR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
