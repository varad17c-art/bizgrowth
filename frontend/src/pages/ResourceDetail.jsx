import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [publishing, setPublishing] = useState(false);

  const fetchResource = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/content/${id}`);
      if (res && res.success && res.data) {
        setResource(res.data);
      } else {
        throw new Error('Resource not found.');
      }
    } catch (err) {
      console.error('Error fetching resource:', err);
      setError(err.message || 'Could not load resource details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResource();
  }, [fetchResource]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await api.delete(`/api/content/${id}`);
      navigate('/resources');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete resource: ' + err.message);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post(`/api/content/${id}/publish`, {});
      fetchResource();
    } catch (err) {
      console.error('Publishing failed:', err);
      alert('Failed to publish article: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading article...</span>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold">
          {error || 'Resource not found'}
        </div>
        <Link to="/resources" className="text-secondary font-bold hover:underline">
          Return to Knowledge Hub
        </Link>
      </div>
    );
  }

  const isAuthor = user && (user.id === resource.author_id || user.role === 'admin');

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
      <Link to="/resources" className="text-secondary font-bold text-body-sm flex items-center gap-1 hover:underline">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Knowledge Hub
      </Link>

      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-sm space-y-6">
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {resource.type}
          </span>
          <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
            {resource.industry}
          </span>
          {resource.status === 'draft' && (
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Draft
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight leading-tight">
          {resource.title}
        </h2>

        {/* Meta Info */}
        <div className="flex items-center gap-2.5 text-body-sm text-on-surface-variant/80 border-y border-outline-variant/15 py-3">
          <span className="material-symbols-outlined text-primary text-[20px]">account_circle</span>
          <span>By Author</span>
          <span>•</span>
          <span>📅 Published: {new Date(resource.created_at).toLocaleDateString()}</span>
        </div>

        {/* Article Body Content */}
        <div className="text-body-md text-on-surface-variant/95 leading-relaxed space-y-4 whitespace-pre-line pt-2">
          {resource.content}
        </div>

        {/* Actions for Author */}
        {isAuthor && (
          <div className="flex flex-wrap gap-3 pt-8 border-t border-outline-variant/20">
            {resource.status === 'draft' && (
              <button
                type="button"
                disabled={publishing}
                onClick={handlePublish}
                className="bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center gap-1"
              >
                {publishing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    Publish Now
                  </>
                )}
              </button>
            )}
            <Link
              to={`/resources/${resource.id}/edit`}
              className="border border-outline text-primary hover:bg-surface-container-high px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
            >
              Edit Content
            </Link>
            <button
              onClick={handleDelete}
              className="border border-error text-error hover:bg-error/10 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
            >
              Delete Article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
