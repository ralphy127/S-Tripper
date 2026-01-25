import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const data = await tripAPI.getTrip(tripId);
      setTrip(data);
      setName(data.name);
      setDescription(data.description || '');
      setBudget(data.budget || '');
    } catch (err) {
      setError('Nie udało się pobrać szczegółów wycieczki.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await tripAPI.updateTrip(tripId, name, description, parseFloat(budget));
      setIsEditing(false);
      loadTrip();
    } catch (err) {
      alert('Błąd aktualizacji: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę wycieczkę?')) return;
    try {
      await tripAPI.deleteTrip(tripId);
      navigate('/dashboard');
    } catch (err) {
      alert('Błąd usuwania: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Ładowanie...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!trip) return null;

  const isOrganizer = user && trip.organizer && user.id === trip.organizer.id;

  return (
    <div style={STYLES.container}>
      <button onClick={() => navigate('/dashboard')} style={STYLES.backButton}>
        ← Wróć do Dashboardu
      </button>

      <div style={STYLES.card}>
        
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{trip.name}</h1>
          <div style={{ color: '#666' }}>
            Organizator: <strong>{trip.organizer?.nickname}</strong>
          </div>
        </div>

        
        {isOrganizer && isEditing ? (
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Nazwa:</label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                style={STYLES.input} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Budżet (PLN):</label>
              <input 
                type="number" 
                value={budget} 
                onChange={e => setBudget(e.target.value)} 
                style={STYLES.input} 
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Opis:</label>
              <textarea 
                rows={4}
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                style={STYLES.input} 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ ...STYLES.button, ...STYLES.saveButton }}>Zapisz zmiany</button>
              <button type="button" onClick={() => setIsEditing(false)} style={STYLES.button}>Anuluj</button>
            </div>
          </form>
        ) : (
          
          <div>
            {trip.budget > 0 && (
              <div style={STYLES.budgetBadge}>
                💰 Budżet: <strong>{trip.budget} PLN</strong>
              </div>
            )}
            
            <p style={{ lineHeight: '1.6', color: '#444' }}>
              {trip.description || 'Brak opisu.'}
            </p>

            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3>Uczestnicy</h3>
              <ul>
                {trip.memberships?.map(m => (
                  <li key={m.user.id}>
                    {m.user.nickname} {m.user.id === trip.organizer?.id && '(Organizator)'}
                  </li>
                ))}
              </ul>
            </div>

            
            {isOrganizer && (
              <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setIsEditing(true)} 
                  style={{ ...STYLES.button, ...STYLES.editButton }}
                >
                  Edytuj dane
                </button>
                <button 
                  onClick={handleDelete} 
                  style={{ ...STYLES.button, ...STYLES.deleteButton }}
                >
                  Usuń wycieczkę
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const STYLES = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  card: { padding: '30px', backgroundColor: '#fff', border: '1px solid #e1e4e8', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  backButton: { marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#007bff', fontSize: '16px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
  input: { width: '100%', padding: '10px', marginBottom: '5px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '10px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontSize: '14px' },
  saveButton: { backgroundColor: '#28a745', color: 'white' },
  editButton: { backgroundColor: '#007bff', color: 'white' },
  deleteButton: { backgroundColor: '#dc3545', color: 'white' },
  budgetBadge: { marginBottom: '20px', padding: '8px 12px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', display: 'inline-block' }
};