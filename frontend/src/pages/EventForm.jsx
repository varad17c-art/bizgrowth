import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Webinar');
  const [capacity, setCapacity] = useState('100');

  // Page States
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [error, setError] = useState('');

  const eventTypes = ['Webinar', 'Workshop', 'Networking', 'Conference', 'Other'];

  useEffect(() => {
    if (!isEditMode) return;

    const fetchEvent = async () => {
      setLoadingData(true);
      setError('');
      try {
        const res = await api.get(`/api/events/${id}`);
        if (res && res.success && res.data) {
          const e = res.data;
          setTitle(e.title || '');
          setDescription(e.description || '');
          
          // Format ISO date to YYYY-MM-DD for input element
          if (e.date) {
            const dateObj = new Date(e.date);
            const formattedDate = dateObj.toISOString().split('T')[0];
            setDate(formattedDate);
          }
          
          setTime(e.time || '');
          setLocation(e.location || '');
          setType(e.type || 'Webinar');
          setCapacity(e.capacity ? e.capacity.toString() : '100');
        }
      } catch (err) {
        console.error('Failed to load event for editing:', err);
        setError('Failed to fetch event details.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchEvent();
  }, [id, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      date: new Date(date).toISOString(),
      time,
      location: location.trim() || 'Online',
      type,
      capacity: parseInt(capacity) || 100
    };

    try {
      let res;
      if (isEditMode) {
        res = await api.patch(`/api/events/${id}`, payload);
      } else {
        res = await api.post('/api/events', payload);
      }

      if (res && res.success && res.data) {
        navigate(`/events/${res.data.id}`);
      } else {
        throw new Error('No valid response returned from event service.');
      }
    } catch (err) {
      console.error('Submit event error:', err);
      setError(err.message || 'Failed to submit event details.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading event form...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-margin-mobile md:px-margin-desktop py-8">
      <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-md space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight">
            {isEditMode ? 'Edit Event Details' : 'Organize Event'}
          </h2>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Publish interactive webinars, local networking, or workshops for the community.
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container border border-error/20 px-4 py-3 rounded-xl text-body-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label htmlFor="event-title" className="block text-body-sm font-bold text-primary mb-1.5">
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scaling Your SaaS: Live Panel & Q&A"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-desc" className="block text-body-sm font-bold text-primary mb-1.5">
              Detailed Description & Agenda
            </label>
            <textarea
              id="event-desc"
              required
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will be covered? Who are the speakers? Add the schedule details..."
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Type */}
            <div>
              <label htmlFor="event-type" className="block text-body-sm font-bold text-primary mb-1.5">
                Event Type
              </label>
              <select
                id="event-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              >
                {eventTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="event-capacity" className="block text-body-sm font-bold text-primary mb-1.5">
                Capacity / Seats Available
              </label>
              <input
                id="event-capacity"
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 100"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="event-date" className="block text-body-sm font-bold text-primary mb-1.5">
                Date
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>

            {/* Time */}
            <div>
              <label htmlFor="event-time" className="block text-body-sm font-bold text-primary mb-1.5">
                Time
              </label>
              <input
                id="event-time"
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:00 PM IST"
                className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="event-location" className="block text-body-sm font-bold text-primary mb-1.5">
              Location / Meeting Link
            </label>
            <input
              id="event-location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Zoom Link, YouTube Live, or Physical Venue Address"
              className="w-full bg-surface-container-lowest border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Link
              to={isEditMode ? `/events/${id}` : '/events'}
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
                  Publishing...
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Publish Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
