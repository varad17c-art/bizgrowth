import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function ListingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('partner');
  const [industry, setIndustry] = useState('Technology');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [location, setLocation] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [orgId, setOrgId] = useState('');

  // Auxiliary States
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Marketing', 'Consulting', 'Other'];
  const types = ['sell', 'buy', 'partner', 'supplier', 'investor'];

  useEffect(() => {
    const fetchOrgsAndListing = async () => {
      setLoading(true);
      try {
        // Load user's organizations
        const orgsRes = await api.get('/api/organizations/my');
        setOrganizations(orgsRes?.data || []);

        if (isEditMode) {
          const res = await api.get(`/api/marketplace/${id}`);
          const listing = res?.data || res;
          if (listing) {
            setTitle(listing.title || '');
            setDescription(listing.description || '');
            setType(listing.type || 'partner');
            setIndustry(listing.industry || 'Technology');
            setBudget(listing.budget ? listing.budget.toString() : '');
            setCurrency(listing.currency || 'INR');
            setLocation(listing.location || '');
            setOrgId(listing.org_id || '');
            
            // Format tags (array or parsed JSON to comma string)
            let parsedTags = [];
            if (listing.tags) {
              parsedTags = Array.isArray(listing.tags) 
                ? listing.tags 
                : JSON.parse(listing.tags || '[]');
            }
            setTagsInput(parsedTags.join(', '));
          }
        }
      } catch (err) {
        console.error('Failed to pre-load details:', err);
        setError('Failed to fetch initial page details.');
      } finally {
        setLoading(false);
        setLoadingData(false);
      }
    };

    fetchOrgsAndListing();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Parse tags input (comma separated)
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const payload = {
      title,
      description,
      type,
      industry,
      budget: parseFloat(budget) || 0,
      currency,
      location: location.trim(),
      tags,
      orgId: orgId || null
    };

    try {
      let result;
      if (isEditMode) {
        result = await api.patch(`/api/marketplace/${id}`, payload);
      } else {
        result = await api.post('/api/marketplace', payload);
      }

      const listingData = result?.data || result;
      if (listingData && listingData.id) {
        navigate(`/marketplace/${listingData.id}`);
      } else {
        throw new Error('No listing ID returned in response.');
      }
    } catch (err) {
      console.error('Submit listing error:', err);
      setError(err.message || 'Failed to submit listing. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading form data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
            {isEditMode ? 'Edit Listing' : 'Create Listing'}
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Fill out the details below to publish your opportunity in the marketplace.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="listing-title" className="block text-body-sm font-bold text-primary mb-1.5">
              Listing Title
            </label>
            <input
              id="listing-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Seeking Marketing Consultant for SaaS Launch"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="listing-desc" className="block text-body-sm font-bold text-primary mb-1.5">
              Detailed Description
            </label>
            <textarea
              id="listing-desc"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your requirements, expectations, and details of the service/collaboration..."
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Listing Type */}
            <div>
              <label htmlFor="listing-type" className="block text-body-sm font-bold text-primary mb-1.5">
                Listing Type
              </label>
              <select
                id="listing-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="listing-industry" className="block text-body-sm font-bold text-primary mb-1.5">
                Industry Focus
              </label>
              <select
                id="listing-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="listing-budget" className="block text-body-sm font-bold text-primary mb-1.5">
                Budget Amount
              </label>
              <input
                id="listing-budget"
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="listing-location" className="block text-body-sm font-bold text-primary mb-1.5">
                Location (Remote / City)
              </label>
              <input
                id="listing-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, Mumbai, India"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tags Input */}
            <div>
              <label htmlFor="listing-tags" className="block text-body-sm font-bold text-primary mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                id="listing-tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. marketing, growth, startup"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Linked Organization */}
            <div>
              <label htmlFor="listing-org" className="block text-body-sm font-bold text-primary mb-1.5">
                Link to Organization (Optional)
              </label>
              <select
                id="listing-org"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                <option value="">Personal Listing (No Organization)</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Link
              to={isEditMode ? `/marketplace/${id}` : '/marketplace'}
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
                isEditMode ? 'Save Changes' : 'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
