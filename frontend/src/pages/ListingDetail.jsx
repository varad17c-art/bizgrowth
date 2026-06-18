import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProductPaymentModal from '../components/ProductPaymentModal';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Contact Form State
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // Payment State
  const [showPayment, setShowPayment] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/marketplace/${id}`);
        if (res && res.data) {
          setListing(res.data);
        } else if (res) {
          setListing(res);
        } else {
          throw new Error('Listing not found.');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.message || 'Could not load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      await api.delete(`/api/marketplace/${id}`);
      navigate('/marketplace');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete listing: ' + err.message);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSentSuccess(false);

    try {
      // Mock alert or send in-app notification to the listing creator
      // Let's create an actual in-app notification if notifications API supports POST
      if (listing?.user_id) {
        await api.post('/api/notifications', {
          userId: listing.user_id,
          message: `User ${user?.name || 'A buyer'} is interested in your listing: "${listing.title}". Message: "${message}"`
        });
      }
      setSentSuccess(true);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 gap-2 text-on-surface-variant">
        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <span className="font-semibold text-body-md">Loading listing...</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/20 font-semibold">
          {error || 'Listing not found'}
        </div>
        <Link to="/marketplace" className="text-secondary font-bold hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user && (user.id === listing.user_id || user.role === 'admin');

  return (
    <>
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link to="/marketplace" className="text-secondary font-bold text-body-sm flex items-center gap-1 hover:underline">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Listing Details (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 p-8 rounded-2xl shadow-sm space-y-6">
              
              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {listing.type}
                </span>
                <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold">
                  {listing.industry}
                </span>
                {listing.location && (
                  <span className="bg-surface-container text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {listing.location}
                  </span>
                )}
              </div>

              <h2 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight leading-tight">
                {listing.title}
              </h2>

              <div className="h-[1px] bg-outline-variant/20" />

              <div className="space-y-3">
                <h3 className="font-bold text-primary text-body-lg">Listing Description</h3>
                <p className="text-body-md text-on-surface-variant/90 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Tags section */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="space-y-2 pt-4">
                  <h4 className="font-bold text-primary text-body-sm">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(listing.tags) ? listing.tags : JSON.parse(listing.tags || '[]')).map((tag) => (
                      <span key={tag} className="bg-surface border border-outline-variant/30 text-on-surface-variant px-2.5 py-1 rounded-lg text-xs font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner action buttons */}
              {isOwner && (
                <div className="flex gap-3 pt-6 border-t border-outline-variant/20">
                  <Link
                    to={`/marketplace/${listing.id}/edit`}
                    className="bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="border border-error text-error hover:bg-error/10 px-6 py-2.5 rounded-full font-bold text-body-sm transition-all"
                  >
                    Delete Listing
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary / Contact Sidebar (1 Column) */}
          <div className="space-y-6">
            
            {/* Details Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-bold text-primary text-body-lg">Summary Details</h3>
              
              <div className="space-y-3 divide-y divide-outline-variant/15 text-body-sm">
                <div className="flex justify-between py-2.5">
                  <span className="text-on-surface-variant font-medium">Budget / Price</span>
                  <span className="font-bold text-secondary text-body-md">{listing.currency || 'INR'} {listing.budget}</span>
                </div>
                
                <div className="flex justify-between py-2.5">
                  <span className="text-on-surface-variant font-medium">Location</span>
                  <span className="font-semibold text-primary">{listing.location || 'Remote'}</span>
                </div>

                <div className="flex justify-between py-2.5">
                  <span className="text-on-surface-variant font-medium">Published On</span>
                  <span className="text-on-surface-variant">{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {listing.type === 'sell' && !isOwner && user && !purchaseSuccess && (
                <button
                  onClick={() => setShowPayment(true)}
                  className="w-full bg-primary text-on-primary hover:bg-primary/90 py-3 rounded-full font-bold text-body-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-4"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  Buy Product Now
                </button>
              )}

              {listing.type === 'sell' && !isOwner && !user && (
                <Link
                  to="/login"
                  className="w-full bg-primary text-on-primary hover:bg-primary/90 py-3 rounded-full font-bold text-body-sm shadow-md transition-all flex items-center justify-center gap-1.5 mt-4"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Login to Purchase
                </Link>
              )}

              {purchaseSuccess && (
                <div className="bg-green-100 border border-green-200 text-green-800 p-4 rounded-xl text-body-sm font-semibold flex items-center gap-2 mt-4">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  You have successfully purchased this product!
                </div>
              )}
            </div>

            {/* Contact Seller Widget */}
            {!isOwner && user && (
              <div className="bg-surface-container-low border border-outline-variant/30 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-primary text-body-lg">Inquire About This Listing</h3>
                
                {sentSuccess ? (
                  <div className="bg-green-100/80 border border-green-200 text-green-800 p-4 rounded-xl text-body-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Your inquiry message was sent successfully!
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <textarea
                      required
                      rows={4}
                      placeholder="Enter your message details, questions, or collaboration requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-surface border border-outline-variant text-primary text-body-sm px-4 py-3 rounded-xl focus:outline-none focus:border-secondary transition-all placeholder:text-on-surface-variant/40"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-secondary text-white hover:bg-secondary/90 py-2.5 rounded-full font-bold text-body-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {!user && (
              <div className="bg-surface-container border border-outline-variant/30 p-5 rounded-2xl text-center space-y-3">
                <p className="text-body-sm text-on-surface-variant">Please log in to contact this business.</p>
                <Link 
                  to="/login"
                  className="inline-block bg-primary text-white hover:bg-primary/95 px-6 py-2 rounded-full font-bold text-body-sm shadow"
                >
                  Login to Inquire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <ProductPaymentModal
          listing={listing}
          amount={listing.budget}
          onClose={() => setShowPayment(false)}
          onSuccess={(payment) => {
            setShowPayment(false);
            setPurchaseSuccess(true);
          }}
        />
      )}
    </>
  );
}
