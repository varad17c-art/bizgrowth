import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function ResourceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('Article');
  const [industry, setIndustry] = useState('Technology');
  const [status, setStatus] = useState('draft');

  // Page States
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  const contentTypes = ['Article', 'Guide', 'Template', 'Checklist', 'Video'];
  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Marketing', 'Consulting', 'Other'];

  useEffect(() => {
    if (!isEditMode) return;

    const fetchResource = async () => {
      setLoadingData(true);
      setError('');
      try {
        const res = await api.get(`/api/content/${id}`);
        if (res && res.success && res.data) {
          const item = res.data;
          setTitle(item.title || '');
          setContent(item.content || '');
          setType(item.type || 'Article');
          setIndustry(item.industry || 'Technology');
          setStatus(item.status || 'draft');
        }
      } catch (err) {
        console.error('Failed to load resource for editing:', err);
        setError('Failed to fetch resource details.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchResource();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      content,
      type,
      industry,
      status
    };

    try {
      let res;
      if (isEditMode) {
        res = await api.patch(`/api/content/${id}`, payload);
      } else {
        res = await api.post('/api/content', payload);
      }

      if (res && res.success && res.data) {
        navigate(`/resources/${res.data.id}`);
      } else {
        throw new Error('No valid response returned from content service.');
      }
    } catch (err) {
      console.error('Submit resource error:', err);
      setError(err.message || 'Failed to submit article.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading form...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
            {isEditMode ? 'Edit Resource' : 'Write New Resource'}
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Publish knowledge articles, business guides, checklists, or worksheets.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Article Title */}
          <div>
            <label htmlFor="resource-title" className="block text-body-sm font-bold text-primary mb-1.5">
              Resource Title
            </label>
            <input
              id="resource-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Beginner's Guide to Raising Pre-Seed Funding"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Resource Type */}
            <div>
              <label htmlFor="resource-type" className="block text-body-sm font-bold text-primary mb-1.5">
                Resource Type
              </label>
              <select
                id="resource-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                {contentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="resource-industry" className="block text-body-sm font-bold text-primary mb-1.5">
                Industry Focus
              </label>
              <select
                id="resource-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="resource-status" className="block text-body-sm font-bold text-primary mb-1.5">
                Status
              </label>
              <select
                id="resource-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
              </select>
            </div>
          </div>

          {/* Content Body */}
          <div>
            <label htmlFor="resource-content" className="block text-body-sm font-bold text-primary mb-1.5">
              Content / Article Body
            </label>
            <textarea
              id="resource-content"
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full body content here..."
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all font-body-md"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Link
              to={isEditMode ? `/resources/${id}` : '/resources'}
              className="border border-outline text-primary hover:bg-surface-container-high px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Article'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
