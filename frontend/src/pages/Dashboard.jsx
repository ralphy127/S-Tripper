import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { tripAPI } from '../api';

const DashboardHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div style={STYLES.header}>
      <div>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <p style={{ margin: '5px 0', color: '#666' }}>
          Zalogowany jako: <strong>{user?.nickname}</strong>
          {user?.is_admin && <span style={{ color: '#6610f2', fontWeight: 'bold' }}> (Admin)</span>}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Ten guzik pojawi się tylko dla Admina */}
        {user?.is_admin && (
          <button 
            onClick={() => navigate('/admin')} 
            style={{ ...STYLES.button, ...STYLES.adminButton }}
          >
            Panel Admina
          </button>
        )}
        
        <button onClick={onLogout} style={{ ...STYLES.button, ...STYLES.logoutButton }}>
          Wyloguj
        </button>
      </div>
    </div>
  );
};

const CreateTripForm = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await onCreate(name, description, budget);
    setIsSubmitting(false);
    setName('');
    setDescription('');
    setBudget('');
  };

  return (
    <div style={STYLES.card}>
      <h2 style={{ marginTop: 0 }}>Stwórz nową wycieczkę</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={STYLES.label}>Nazwa wycieczki:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={STYLES.input}
            placeholder="np. Wyjazd w Bieszczady"
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={STYLES.label}>Budżet (PLN):</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            style={STYLES.input}
            placeholder="np. 500"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={STYLES.label}>Opis (opcjonalnie):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={STYLES.input}
            placeholder="Krótki opis planów..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...STYLES.button, ...STYLES.createButton }}
        >
          {isSubmitting ? 'Tworzenie...' : 'Stwórz wycieczkę'}
        </button>
      </form>
    </div>
  );
};

const TripCard = ({ trip, currentUser, onAddMember }) => {
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const navigate = useNavigate();

  const isOrganizer = currentUser && trip.organizer && currentUser.id === trip.organizer.id;

  const handleAddMemberSubmit = async () => {
    if (!newMemberNickname.trim()) return;
    setIsAdding(true);
    await onAddMember(trip.id, newMemberNickname);
    setIsAdding(false);
    setNewMemberNickname('');
  };

  const displayList = [];

  if (trip.organizer) {
    displayList.push({ user: trip.organizer, isRoleOrganizer: true });
  }

  if (trip.memberships) {
    trip.memberships.forEach((m) => {
      if (trip.organizer && m.user.id !== trip.organizer.id) {
        displayList.push({ user: m.user, isRoleOrganizer: false });
      }
    });
  }

  return (
    <div style={STYLES.tripCard}>
      <div style={STYLES.tripHeader}>
        <h3 style={{ margin: '0 0 5px 0' }}>{trip.name}</h3>
        <span style={{ fontSize: '12px', color: '#999' }}>
          {isOrganizer ? (
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>Twoja wycieczka</span>
          ) : (
            'Jesteś uczestnikiem'
          )}
        </span>
      </div>

      {trip.budget > 0 && (
        <div style={{ 
          marginBottom: '10px', 
          fontSize: '14px', 
          color: '#856404', 
          backgroundColor: '#fff3cd', 
          padding: '5px 10px', 
          borderRadius: '4px',
          width: 'fit-content'
        }}>
          💰 Budżet: <strong>{trip.budget} PLN</strong>
        </div>
      )}

      {trip.description && (
        <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px' }}>
          {trip.description}
        </p>
      )}

      <div style={{ marginTop: '10px', marginBottom: '15px' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold' }}>
          Uczestnicy ({displayList.length}):
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {displayList.map((item) => (
            <div 
              key={item.user.id} 
              style={item.isRoleOrganizer ? STYLES.badgeOrganizer : STYLES.badgeMember}
            >
              {item.user.nickname}
              {item.isRoleOrganizer && ' ★'}
            </div>
          ))}
        </div>
      </div>

      
      <button 
        onClick={() => navigate(`/trips/${trip.id}`)}
        style={{ ...STYLES.button, ...STYLES.detailsButton }}
      >
        Edytuj / Szczegóły
      </button>

      {isOrganizer && (
        <div style={{ marginTop: '15px', display: 'flex', gap: '8px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
          <input
            type="text"
            placeholder="Nickname użytkownika"
            value={newMemberNickname}
            onChange={(e) => setNewMemberNickname(e.target.value)}
            style={{ ...STYLES.input, padding: '6px' }}
          />
          <button
            onClick={handleAddMemberSubmit}
            disabled={isAdding}
            style={{ ...STYLES.button, ...STYLES.actionButton }}
          >
            {isAdding ? '...' : '+'}
          </button>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripAPI.getTrips();
      setTrips(data);
    } catch (err) {
      setError('Nie udało się pobrać wycieczek: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (name, description, budget) => {
    try {
      setError('');
      await tripAPI.createTrip(name, description, budget);
      await loadTrips();
    } catch (err) {
      setError('Błąd tworzenia wycieczki: ' + err.message);
    }
  };

  const handleAddMember = async (tripId, nickname) => {
    try {
      setError('');
      await tripAPI.addMember(tripId, nickname);
      await loadTrips();
    } catch (err) {
      setError('Błąd dodawania uczestnika: ' + err.message);
      throw err; 
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
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <DashboardHeader user={user} onLogout={handleLogout} />

      {error && <div style={STYLES.errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <CreateTripForm onCreate={handleCreateTrip} />

        <div>
          <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Twoje Wycieczki</h2>
          
          {loading ? (
            <p>Ładowanie...</p>
          ) : trips.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              Nie masz jeszcze żadnych wycieczek. Stwórz pierwszą powyżej!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {trips.map((trip) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  currentUser={user}
                  onAddMember={handleAddMember}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STYLES = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #ddd',
    paddingBottom: '20px'
  },
  adminButton: {
    padding: '8px 16px',
    backgroundColor: '#6610f2',
    color: 'white',
  },
  card: {
    padding: '25px',
    backgroundColor: '#fff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  tripCard: {
    padding: '20px',
    backgroundColor: '#fff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
  },
  button: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'opacity 0.2s'
  },
  createButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    width: '100%'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
  },
  actionButton: {
    padding: '6px 15px',
    backgroundColor: '#007bff',
    color: 'white',
  },
  detailsButton: {
    width: '100%',
    padding: '8px 10px',
    backgroundColor: '#6c757d',
    color: 'white',
    marginTop: 'auto',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  badgeMember: {
    padding: '4px 10px',
    backgroundColor: '#f1f3f5',
    color: '#495057',
    borderRadius: '15px',
    fontSize: '12px',
    border: '1px solid #dee2e6'
  },
  badgeOrganizer: {
    padding: '4px 10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '15px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid #c3e6cb'
  }
};