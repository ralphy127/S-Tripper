import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { tripAPI } from '../api';

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [tripName, setTripName] = useState('');
  const [tripDescription, setTripDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await tripAPI.getTrips();
      setTrips(data);
    } catch (err) {
      setError('Failed to load trips: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    
    if (!tripName.trim()) {
      setError('Trip name is required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      await tripAPI.createTrip(tripName, tripDescription);
      
      setTripName('');
      setTripDescription('');
      
      await loadTrips();
    } catch (err) {
      setError('Failed to create trip: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Logged in as: <strong>{user?.email}</strong>
            {user?.role === 'ADMIN' && ' (Admin)'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {}
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd'
      }}>
        <h2 style={{ marginTop: 0 }}>Create New Trip</h2>
        <form onSubmit={handleCreateTrip}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Trip Name:
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Description (optional):
            </label>
            <textarea
              value={tripDescription}
              onChange={(e) => setTripDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {creating ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>

      {}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {}
      <div>
        <h2>My Trips</h2>
        
        {loading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p style={{ color: '#666' }}>
            No trips yet. Create your first trip above!
          </p>
        ) : (
          <div>
            {trips.map((trip) => (
              <div
                key={trip.id}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{trip.name}</h3>
                {trip.description && (
                  <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                    {trip.description}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                  {trip.organizer_id === user?.id ? (
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                      You are the organizer
                    </span>
                  ) : (
                    <span>Member</span>
                  )}
                  {' | '}
                  Trip ID: {trip.id}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
