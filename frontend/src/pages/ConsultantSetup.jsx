import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ConsultantSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Profile Form States
  const [profileExists, setProfileExists] = useState(false);
  const [tagline, setTagline] = useState('');
  const [expertise, setExpertise] = useState('');
  const [certifications, setCertifications] = useState('');
  const [languages, setLanguages] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [minEngagement, setMinEngagement] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Weekly Slots State
  // Array of 7 days: day_of_week, start_time, end_time, is_available
  const [weeklySlots, setWeeklySlots] = useState(() => 
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '17:00',
      is_available: i > 0 && i < 6 // Mon-Fri default available
    }))
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Portfolio Items State
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portLoading, setPortLoading] = useState(false);
  const [showPortForm, setShowPortForm] = useState(false);
  const [portFormData, setPortFormData] = useState({ title: '', description: '', projectUrl: '', imageUrl: '' });
  const [portSubmitting, setPortSubmitting] = useState(false);
  const [portEditId, setPortEditId] = useState(null);

  const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchProfileAndAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get profile
        let existingProfile = null;
        try {
          const profRes = await api.get('/api/consultants/me');
          if (profRes && profRes.success && profRes.data) {
            existingProfile = profRes.data;
          } else if (profRes && profRes.id) {
            existingProfile = profRes;
          }
        } catch {
          // Profile not created yet (404)
        }

        if (existingProfile) {
          setProfileExists(true);
          setTagline(existingProfile.tagline || '');
          setHourlyRate(existingProfile.hourly_rate ? existingProfile.hourly_rate.toString() : '');
          setAvailabilityStatus(existingProfile.availability || 'available');
          setMinEngagement(existingProfile.min_engagement || '');
          setPortfolioUrl(existingProfile.portfolio_url || '');

          setExpertise(Array.isArray(existingProfile.expertise) ? existingProfile.expertise.join(', ') : '');
          setCertifications(Array.isArray(existingProfile.certifications) ? existingProfile.certifications.join(', ') : '');
          setLanguages(Array.isArray(existingProfile.languages) ? existingProfile.languages.join(', ') : '');
        }

        // 2. Get availability weekly slots
        try {
          const availRes = await api.get(`/api/availability/${user.id}`);
          if (availRes && availRes.slots && Array.isArray(availRes.slots)) {
            // Map slots from backend
            const mappedSlots = Array.from({ length: 7 }, (_, i) => {
              const matched = availRes.slots.find(s => s.day_of_week === i);
              return matched 
                ? { 
                    day_of_week: i, 
                    start_time: matched.start_time || '09:00', 
                    end_time: matched.end_time || '17:00', 
                    is_available: !!matched.is_available 
                  }
                : { day_of_week: i, start_time: '09:00', end_time: '17:00', is_available: false };
            });
            setWeeklySlots(mappedSlots);
          }
        } catch (availErr) {
          console.warn('No availability calendar found (will create on save):', availErr);
        }

      } catch (err) {
        console.error('Failed to load profile details:', err);
        setError('Failed to fetch consultant profile information.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileAndAvailability();
    }
  }, [user]);

  // Fetch portfolio items
  const loadPortfolio = useCallback(async () => {
    setPortLoading(true);
    try {
      const res = await api.get('/api/portfolio/my');
      if (res?.success) setPortfolioItems(res.data || []);
    } catch { /* portfolio load failed */ } finally {
      setPortLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPortfolio();
    }
  }, [user, loadPortfolio]);

  const handleSlotChange = (dayIndex, field, value) => {
    setWeeklySlots(prev => prev.map((s, idx) => {
      if (idx === dayIndex) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Parse array inputs
    const expArray = expertise.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const certArray = certifications.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const langArray = languages.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const profilePayload = {
      tagline,
      expertise: expArray,
      certifications: certArray,
      languages: langArray,
      hourly_rate: parseFloat(hourlyRate) || 0,
      currency: 'INR',
      availability: availabilityStatus,
      min_engagement: minEngagement,
      portfolio_url: portfolioUrl
    };

    try {
      // 1. Create/Update Profile
      if (profileExists) {
        await api.patch('/api/consultants/profile', profilePayload);
      } else {
        await api.post('/api/consultants/profile', profilePayload);
      }

      // 2. Create/Update Availability schedule
      try {
        const availPayload = {
          consultantId: user.id,
          slots: weeklySlots,
          timezone: 'Asia/Kolkata',
          maxConsultationsPerDay: 10
        };

        // Try updating slots
        try {
          await api.put(`/api/availability/${user.id}/slots`, { slots: weeklySlots });
        } catch {
          // If update fail (availability does not exist yet), call create post
          await api.post('/api/availability', availPayload);
        }
      } catch (availErr) {
        console.error('Availability schedule save failed:', availErr);
        // Do not crash the entire flow if availability slots failed to sync, but warn
        setError('Profile saved, but calendar slots could not sync. Check calendar setup in Dashboard.');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.message || 'Onboarding failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPortForm = (item = null) => {
    if (item) {
      setPortEditId(item.id);
      setPortFormData({ title: item.title, description: item.description || '', projectUrl: item.projectUrl || '', imageUrl: item.imageUrl || '' });
    } else {
      setPortEditId(null);
      setPortFormData({ title: '', description: '', projectUrl: '', imageUrl: '' });
    }
    setShowPortForm(true);
  };

  const closePortForm = () => { setShowPortForm(false); setPortEditId(null); };

  const handlePortSave = async (e) => {
    e.preventDefault();
    if (!portFormData.title.trim()) return;
    setPortSubmitting(true);
    try {
      if (portEditId) {
        await api.put(`/api/portfolio/${portEditId}`, portFormData);
      } else {
        await api.post('/api/portfolio', portFormData);
      }
      closePortForm();
      await loadPortfolio();
    } catch (err) {
      console.error('Portfolio save failed:', err);
    } finally {
      setPortSubmitting(false);
    }
  };

  const handlePortDelete = async (itemId) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    try {
      await api.delete(`/api/portfolio/${itemId}`);
      await loadPortfolio();
    } catch (err) {
      console.error('Portfolio delete failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading onboarding portal...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
            {profileExists ? 'Update Consultant Profile' : 'Become a Business Consultant'}
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Setup your hourly rates, bio, specialties, and weekly calendar slots so clients can book consulting sessions.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2">1. Profile Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tagline */}
            <div className="col-span-2">
              <label htmlFor="consultant-tagline" className="block text-body-sm font-bold text-primary mb-1.5">
                Tagline / Professional Summary
              </label>
              <input
                id="consultant-tagline"
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Pre-Seed Pitch Deck & Go-To-Market Consultant for FinTech startups"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label htmlFor="consultant-rate" className="block text-body-sm font-bold text-primary mb-1.5">
                Hourly Rate (INR)
              </label>
              <input
                id="consultant-rate"
                type="number"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Availability status */}
            <div>
              <label htmlFor="consultant-status" className="block text-body-sm font-bold text-primary mb-1.5">
                Current Availability
              </label>
              <select
                id="consultant-status"
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                <option value="available">Available (Booking calendar active)</option>
                <option value="busy">Busy (Temporary pause)</option>
                <option value="unavailable">Unavailable (Disabled bookings)</option>
              </select>
            </div>

            {/* Expertise */}
            <div>
              <label htmlFor="consultant-expertise" className="block text-body-sm font-bold text-primary mb-1.5">
                Expertise / Specialties (Comma-separated)
              </label>
              <input
                id="consultant-expertise"
                type="text"
                required
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="e.g. pitch decks, marketing, fundraising"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Certifications */}
            <div>
              <label htmlFor="consultant-certs" className="block text-body-sm font-bold text-primary mb-1.5">
                Certifications (Comma-separated)
              </label>
              <input
                id="consultant-certs"
                type="text"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="e.g. MBA Finance, CFA L3"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Languages */}
            <div>
              <label htmlFor="consultant-langs" className="block text-body-sm font-bold text-primary mb-1.5">
                Languages (Comma-separated)
              </label>
              <input
                id="consultant-langs"
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Hindi, German"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Portfolio Link */}
            <div>
              <label htmlFor="consultant-portfolio" className="block text-body-sm font-bold text-primary mb-1.5">
                Portfolio / LinkedIn URL
              </label>
              <input
                id="consultant-portfolio"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="e.g. https://linkedin.com/in/username"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          <h3 className="font-bold text-primary text-body-lg border-b border-outline-variant/15 pb-2 pt-4">2. Weekly Time Slots</h3>
          <div className="space-y-3">
            {weeklySlots.map((slot, i) => (
              <div 
                key={slot.day_of_week} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low"
              >
                <div className="flex items-center gap-3 font-semibold text-body-sm text-primary">
                  <input
                    id={`available-checkbox-${slot.day_of_week}`}
                    type="checkbox"
                    checked={slot.is_available}
                    onChange={(e) => handleSlotChange(i, 'is_available', e.target.checked)}
                    className="w-5 h-5 rounded focus:ring-secondary text-secondary"
                  />
                  <label htmlFor={`available-checkbox-${slot.day_of_week}`} className="w-24 cursor-pointer">{daysOfWeekNames[slot.day_of_week]}</label>
                </div>

                {slot.is_available ? (
                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <input
                      aria-label="Start Time"
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleSlotChange(i, 'start_time', e.target.value)}
                      className="bg-surface border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                    />
                    <span className="text-on-surface-variant">to</span>
                    <input
                      aria-label="End Time"
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleSlotChange(i, 'end_time', e.target.value)}
                      className="bg-surface border border-outline-variant text-primary text-body-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-secondary transition-all"
                    />
                  </div>
                ) : (
                  <span className="text-[12px] text-on-surface-variant/50 font-bold uppercase tracking-wider select-none py-1.5">
                    Closed / Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Portfolio Items Section ── */}
          <div className="border-t border-outline-variant/15 pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-primary text-body-lg">3. Portfolio Items</h3>
              <button
                type="button"
                id="add-portfolio-btn"
                onClick={() => openPortForm()}
                className="flex items-center gap-1.5 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold text-body-sm px-4 py-2 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Item
              </button>
            </div>

            {portLoading ? (
              <div className="flex items-center gap-2 py-4 text-on-surface-variant">
                <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="text-body-sm">Loading portfolio…</span>
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-8 bg-surface-container rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 block mb-1">folder_open</span>
                <p className="text-body-sm text-on-surface-variant">No portfolio items yet. Add projects to showcase your work.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="bg-surface-container border border-outline-variant/20 rounded-xl p-4 flex gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg shrink-0 bg-surface-container-high" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary text-body-sm truncate">{item.title}</p>
                      {item.description && <p className="text-xs text-on-surface-variant/80 line-clamp-2 mt-0.5">{item.description}</p>}
                      {item.projectUrl && (
                        <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline truncate block mt-1">{item.projectUrl}</a>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button type="button" onClick={() => openPortForm(item)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button type="button" onClick={() => handlePortDelete(item.id)} className="p-1.5 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/15">
            <Link
              to="/dashboard"
              className="border border-outline text-primary hover:bg-surface-container-high px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-secondary text-white hover:bg-secondary/90 px-8 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                profileExists ? 'Update Profile' : 'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Portfolio Item Modal */}
      {showPortForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20">
              <h2 className="font-bold text-primary text-body-md">{portEditId ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
              <button onClick={closePortForm} className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handlePortSave} className="p-6 space-y-4">
              <div>
                <label htmlFor="port-title" className="block text-body-sm font-bold text-primary mb-1.5">Title *</label>
                <input
                  id="port-title"
                  type="text"
                  required
                  value={portFormData.title}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Fundraising Pitch Deck for XYZ Startup"
                  className="w-full bg-surface-container border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label htmlFor="port-desc" className="block text-body-sm font-bold text-primary mb-1.5">Description</label>
                <textarea
                  id="port-desc"
                  rows={3}
                  value={portFormData.description}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe the project, your role, and outcomes achieved…"
                  className="w-full bg-surface-container border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all resize-none"
                />
              </div>
              <div>
                <label htmlFor="port-url" className="block text-body-sm font-bold text-primary mb-1.5">Project URL</label>
                <input
                  id="port-url"
                  type="url"
                  value={portFormData.projectUrl}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, projectUrl: e.target.value }))}
                  placeholder="https://github.com/yourproject or https://case-study.example.com"
                  className="w-full bg-surface-container border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
                />
              </div>
              <div>
                <label htmlFor="port-img" className="block text-body-sm font-bold text-primary mb-1.5">Cover Image URL</label>
                <input
                  id="port-img"
                  type="url"
                  value={portFormData.imageUrl}
                  onChange={(e) => setPortFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/project-screenshot.png"
                  className="w-full bg-surface-container border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closePortForm} className="border border-outline text-primary px-5 py-2.5 rounded-full font-bold text-body-sm hover:bg-surface-container-high transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={portSubmitting}
                  className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {portSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  ) : (portEditId ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
