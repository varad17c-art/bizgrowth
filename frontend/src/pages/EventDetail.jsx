import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Get Event Detail
      const eventRes = await api.get(`/api/events/${id}`);
      if (eventRes && eventRes.success && eventRes.data) {
        setEvent(eventRes.data);
      } else {
        throw new Error('Event not found.');
      }

      // 2. Get Attendees List
      try {
        const attendeesRes = await api.get(`/api/events/${id}/attendees`);
        if (attendeesRes && attendeesRes.success && Array.isArray(attendeesRes.data)) {
          setAttendees(attendeesRes.data);
          // Check if current logged-in user is registered
          if (user) {
            const isRegistered = attendeesRes.data.some(att => att.user_id === user.id || att.id === user.id);
            setRegistered(isRegistered);
          }
        }
      } catch (attErr) {
        console.warn('Could not fetch attendees list (probably permission/not organizer):', attErr);
        // Fallback: fetch registered events of client to check registration status
        if (user) {
          const regEvents = await api.get('/api/events/registered');
          const isRegistered = regEvents && regEvents.success && Array.isArray(regEvents.data) 
            ? regEvents.data.some(ev => ev.id === id) 
            : Array.isArray(regEvents) && regEvents.some(ev => ev.id === id);
          setRegistered(isRegistered);
        }
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError(err.message || 'Could not load event details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/api/events/${id}`);
      navigate('/events');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete event: ' + err.message);
    }
  };

  const handleRegisterToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      if (registered) {
        // Cancel registration
        await api.delete(`/api/events/${id}/register`);
        setRegistered(false);
      } else {
        // Register for event
        await api.post(`/api/events/${id}/register`, {});
        setRegistered(true);
      }
      // Refresh attendees count / details
      fetchData();
    } catch (err) {
      console.error('Registration toggle failed:', err);
      alert('Action failed: ' + err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold">
          {error || 'Event not found'}
        </div>
        <Link to="/events" className="text-secondary font-bold hover:underline">
          Return to Events
        </Link>
      </div>
    );
  }

  const isOrganizer = user && (user.id === event.organizer_id || user.role === 'admin');

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
      <Link to="/events" className="text-secondary font-bold text-body-sm flex items-center gap-1 hover:underline">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Events List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Event Details (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-sm space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {event.type}
              </span>
              <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-0.5">
                📅 {new Date(event.date).toLocaleDateString()}
              </span>
              {event.location && (
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {event.location}
                </span>
              )}
            </div>

            <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight leading-tight">
              {event.title}
            </h2>

            <div className="h-[1px] bg-outline-variant/20" />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-bold text-primary text-body-lg">Event Details & Agenda</h3>
              <p className="text-body-md text-on-surface-variant/95 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Organizer Options */}
            {isOrganizer && (
              <div className="flex gap-3 pt-6 border-t border-outline-variant/20">
                <Link
                  to={`/events/${event.id}/edit`}
                  className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md"
                >
                  Edit Event Details
                </Link>
                <button
                  onClick={handleDelete}
                  className="border border-error text-error hover:bg-error/10 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
                >
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Registration & Attendees Sidebar (1 Column) */}
        <div className="space-y-6">
          
          {/* Info Card */}
          <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="font-bold text-primary text-body-lg">Registration Info</h3>
            
            <div className="space-y-3 divide-y divide-outline-variant/15 text-body-sm">
              <div className="flex justify-between py-2.5">
                <span className="text-on-surface-variant font-medium">Date</span>
                <span className="font-bold text-primary">{new Date(event.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between py-2.5">
                <span className="text-on-surface-variant font-medium">Time</span>
                <span className="font-semibold text-primary">{event.time || 'TBD'}</span>
              </div>

              <div className="flex justify-between py-2.5">
                <span className="text-on-surface-variant font-medium">Location</span>
                <span className="font-semibold text-primary text-right max-w-[150px] truncate">{event.location || 'Online'}</span>
              </div>

              <div className="flex justify-between py-2.5">
                <span className="text-on-surface-variant font-medium">Capacity</span>
                <span className="text-primary font-semibold">{event.capacity || 'Unlimited'} seats</span>
              </div>
            </div>

            {!isOrganizer && (
              <button
                type="button"
                disabled={registering}
                onClick={handleRegisterToggle}
                className={`w-full py-3 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center justify-center gap-1.5 ${
                  registered
                    ? 'bg-error text-white hover:bg-error/90'
                    : 'bg-secondary text-white hover:bg-secondary/90'
                }`}
              >
                {registering ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : registered ? (
                  <>
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Cancel Registration
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
                    Register Now
                  </>
                )}
              </button>
            )}
          </div>

          {/* Attendees List (only shown when there are attendees or if user is organizer) */}
          {attendees.length > 0 && (
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-body-lg">
                Attendees ({attendees.length})
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto divide-y divide-outline-variant/10">
                {attendees.map((att, i) => (
                  <div key={att.id || i} className="flex items-center gap-2.5 pt-2 text-body-sm">
                    <span className="material-symbols-outlined text-on-surface-variant/70 text-[20px]">person</span>
                    <span className="font-semibold text-primary">{att.name || 'Registered User'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
