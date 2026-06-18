import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Marketing', 'Consulting', 'Other'];
  const types = ['sell', 'buy', 'partner', 'supplier', 'investor'];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search,
        industry,
        type
      });

      const res = await api.get(`/api/marketplace?${queryParams.toString()}`);
      if (res && res.data) {
        setListings(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } else if (res && res.listings) {
        setListings(res.listings);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setListings(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error('Failed to load marketplace listings:', err);
      setError('Could not load marketplace listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [search, industry, type, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-container text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent pointer-events-none" />
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-body-md text-white/80">
            Connect, trade services, buy/sell assets, and find collaborative business opportunities in the BizGrowth ecosystem.
          </p>
        </div>
        {isAuthenticated && (
          <Link
            to="/marketplace/new"
            className="bg-secondary text-white hover:bg-secondary/90 font-label-md text-label-md px-6 py-3.5 rounded-full font-bold shadow-lg transition-all flex items-center gap-1.5 z-10 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Create a Listing
          </Link>
        )}
      </div>

      {/* Filter Options */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center flex-grow justify-end">
          <select
            value={industry}
            aria-label="Filter by Industry"
            onChange={(e) => { setIndustry(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
          >
            <option value="">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            value={type}
            aria-label="Filter by Listing Type"
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
          >
            <option value="">All Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(search || industry || type) && (
            <button
              onClick={() => { setSearch(''); setIndustry(''); setType(''); setPage(1); }}
              className="text-body-sm text-secondary hover:text-secondary/80 font-bold underline transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Listings Display Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-on-surface-variant">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-body-md">Searching listings...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold text-center">
          {error}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant bg-surface rounded-2xl border border-dashed border-outline-variant/60 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-6xl opacity-35 mb-2">storefront</span>
          <h3 className="font-headline-md text-headline-md font-bold text-primary">No Listings Found</h3>
          <p className="text-body-sm text-on-surface-variant font-medium mt-1">
            Try adjusting your search filters or create a new business listing.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div 
                key={item.id} 
                className="bg-surface-container-low border border-outline-variant/30 hover:border-secondary/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-semibold">
                      {item.industry}
                    </span>
                  </div>

                  <h3 className="font-headline-md text-headline-md font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-body-sm text-on-surface-variant/80 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center bg-surface border border-outline-variant/20 p-3 rounded-xl">
                    <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Budget</span>
                    <span className="text-body-md font-bold text-secondary">{item.currency || 'INR'} {item.budget}</span>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 mt-6 flex justify-between items-center">
                  <span className="text-body-sm text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {item.location || 'Remote'}
                  </span>
                  
                  <Link
                    to={`/marketplace/${item.id}`}
                    className="text-secondary group-hover:text-secondary/80 font-bold text-body-sm flex items-center gap-0.5 hover:underline"
                  >
                    View Details
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="border border-outline disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-body-sm text-primary font-bold">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="border border-outline disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container-high p-2 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
