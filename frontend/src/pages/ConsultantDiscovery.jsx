import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function ConsultantDiscovery() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering State
  const [search, setSearch] = useState('');
  const [availability, setAvailability] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchConsultants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        search,
        availability
      });

      const res = await api.get(`/api/consultants?${queryParams.toString()}`);
      if (res && res.success && res.data) {
        setConsultants(res.data);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setConsultants([]);
      }
    } catch (err) {
      console.error('Failed to load consultants:', err);
      setError('Could not load consultant directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, availability, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConsultants();
  }, [fetchConsultants]);

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-container to-secondary text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.04] pointer-events-none" />
        <div className="space-y-2 max-w-xl z-10">
          <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight">Business Experts & Consultants</h2>
          <p className="text-body-md text-white/85">
            Book 1-on-1 consultations with verified experts in marketing, sales, product development, legal, and pre-seed fundraising.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-low border border-outline-variant/30 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input
            type="text"
            placeholder="Search specialties, skills, taglines..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center flex-grow justify-end">
          <select
            value={availability}
            aria-label="Filter by Availability"
            onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
            className="w-full sm:w-48 bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-secondary transition-all"
          >
            <option value="">Any Status</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {(search || availability) && (
            <button
              onClick={() => { setSearch(''); setAvailability(''); setPage(1); }}
              className="text-body-sm text-secondary hover:text-secondary/80 font-bold underline transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Consultant List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-on-surface-variant">
          <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-body-md">Finding consultants...</span>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold text-center">
          {error}
        </div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant bg-surface rounded-2xl border border-dashed border-outline-variant/60 max-w-lg mx-auto">
          <span className="material-symbols-outlined text-6xl opacity-35 mb-2">person_search</span>
          <h3 className="font-headline-md text-headline-md font-bold text-primary">No Consultants Found</h3>
          <p className="text-body-sm text-on-surface-variant font-medium mt-1">
            Try adjusting your query filter, or register your own consultant profile.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {consultants.map((c) => (
              <div 
                key={c.id} 
                className="bg-surface-container-low border border-outline-variant/30 hover:border-secondary/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Rating & Status */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-tertiary text-[18px] icon-fill">star</span>
                      <span className="text-body-sm font-bold text-primary">
                        {c.avg_rating ? parseFloat(c.avg_rating).toFixed(1) : 'New'}
                      </span>
                      {c.total_reviews > 0 && (
                        <span className="text-body-sm text-on-surface-variant/60">
                          ({c.total_reviews})
                        </span>
                      )}
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.availability === 'available' ? 'bg-green-100 text-green-800' :
                      c.availability === 'busy' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.availability}
                    </span>
                  </div>

                  {/* Header Info */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary font-bold border border-outline-variant/20 shrink-0">
                      <span className="material-symbols-outlined text-[24px]">account_circle</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary text-body-lg group-hover:text-secondary transition-colors flex items-center gap-1.5 leading-snug">
                        Expert Consultant
                        {c.is_verified && (
                          <span className="material-symbols-outlined text-[16px] text-secondary icon-fill">verified</span>
                        )}
                      </h3>
                      <p className="text-[13px] text-on-surface-variant/80 font-medium line-clamp-1 mt-0.5">{c.tagline}</p>
                    </div>
                  </div>

                  {/* Expertise tags */}
                  {c.expertise && c.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {c.expertise.slice(0, 3).map((exp) => (
                        <span key={exp} className="bg-surface text-on-surface-variant border border-outline-variant/20 px-2 py-0.5 rounded text-[11px] font-medium">
                          {exp}
                        </span>
                      ))}
                      {c.expertise.length > 3 && (
                        <span className="bg-surface text-on-surface-variant border border-outline-variant/20 px-2 py-0.5 rounded text-[11px] font-medium">
                          +{c.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Rates Info */}
                  <div className="bg-surface border border-outline-variant/20 p-3 rounded-xl flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">Hourly Rate</span>
                    <span className="font-bold text-secondary text-body-md">
                      {c.currency || 'INR'} {c.hourly_rate ? parseFloat(c.hourly_rate).toFixed(0) : 'Free'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-4 mt-6 flex justify-end">
                  <Link
                    to={`/consultants/${c.id}`}
                    className="bg-secondary text-white hover:bg-secondary/90 font-bold text-body-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow flex items-center gap-1"
                  >
                    View Services
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
