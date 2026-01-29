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

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [addingExpense, setAddingExpense] = useState(false);

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

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    try {
      setAddingExpense(true);
      await tripAPI.addExpense(tripId, expenseTitle, parseFloat(expenseAmount));
      setExpenseTitle('');
      setExpenseAmount('');
      await loadTrip(); 
    } catch (err) {
      alert('Błąd dodawania wydatku: ' + err.message);
    } finally {
      setAddingExpense(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Ładowanie...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  if (!trip) return null;

  const isOrganizer = user && trip.organizer && user.id === trip.organizer.id;
  
  const totalExpenses = trip.expenses ? trip.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
  const tripBudget = trip.budget || 0;
  const remaining = tripBudget - totalExpenses;
  const isOverBudget = remaining < 0;

  const paidByUser = {}; 
  trip.expenses?.forEach(exp => {
    const payerId = exp.payer_id;
    paidByUser[payerId] = (paidByUser[payerId] || 0) + exp.amount;
  });

  const allParticipants = [];
  
  if (trip.organizer) {
    allParticipants.push({ ...trip.organizer, isRoleOrganizer: true });
  }

  if (trip.memberships) {
    trip.memberships.forEach(m => {
      if (m.user.id !== trip.organizer?.id) {
        allParticipants.push({ ...m.user, isRoleOrganizer: false });
      }
    });
  }

  const memberCount = allParticipants.length || 1;
  const averageCost = totalExpenses / memberCount;

  return (
    <div style={STYLES.container}>
      <button onClick={() => navigate('/dashboard')} style={STYLES.backButton}>
        ← Wróć do Dashboardu
      </button>

      <div style={STYLES.card}>
        
        {/* HEADER */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: '0 0 10px 0' }}>{trip.name}</h1>
          <div style={{ color: '#666' }}>
            Organizator: <strong>{trip.organizer?.nickname}</strong>
          </div>
        </div>

        {/* EDIT FORM */}
        {isOrganizer && isEditing ? (
          <form onSubmit={handleUpdate}>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Nazwa:</label>
              <input value={name} onChange={e => setName(e.target.value)} style={STYLES.input} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Budżet (PLN):</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} style={STYLES.input} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={STYLES.label}>Opis:</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} style={STYLES.input} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ ...STYLES.button, ...STYLES.saveButton }}>Zapisz zmiany</button>
              <button type="button" onClick={() => setIsEditing(false)} style={STYLES.button}>Anuluj</button>
            </div>
          </form>
        ) : (
          <div>
             {/* FINANCE SECTION */}
            <div style={STYLES.financeSection}>
              <h3 style={{ marginTop: 0 }}>Podsumowanie Budżetu</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '15px' }}>
                <span>Zaplanowany budżet:</span>
                <strong>{tripBudget.toFixed(2)} PLN</strong>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px', color: isOverBudget ? '#dc3545' : '#28a745' }}>
                <span>Wydano łącznie:</span>
                <strong>{totalExpenses.toFixed(2)} PLN</strong>
              </div>
              
              <div style={{ 
                padding: '8px', 
                backgroundColor: isOverBudget ? '#ffebee' : '#e8f5e9', 
                color: isOverBudget ? '#c62828' : '#2e7d32',
                borderRadius: '4px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {isOverBudget 
                  ? `⚠ Przekroczono o ${Math.abs(remaining).toFixed(2)} PLN` 
                  : `Pozostało: ${remaining.toFixed(2)} PLN`}
              </div>
            </div>

            {/* BALANCE SECTION */}
            {totalExpenses > 0 && (
              <div style={STYLES.balanceSection}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Rozliczenie między nami</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                  Średni koszt na osobę ({memberCount} os.): <strong>{averageCost.toFixed(2)} PLN</strong>
                </p>
                
                <div style={{ display: 'grid', gap: '10px' }}>
                  {allParticipants.map(participant => {
                    const paid = paidByUser[participant.id] || 0;
                    const balance = paid - averageCost; 
                    
                    let bgColor = '#fff3e0'; 
                    let textColor = '#e67e22';
                    let sign = '';

                    if (balance > 0.01) {
                      bgColor = '#ffebee'; 
                      textColor = '#c62828';
                      sign = '+';
                    } else if (balance < -0.01) {
                      bgColor = '#e8f5e9';
                      textColor = '#2e7d32';
                    }

                    return (
                      <div key={participant.id} style={{ ...STYLES.balanceRow, backgroundColor: bgColor, color: textColor, border: `1px solid ${textColor}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={participant.isRoleOrganizer ? STYLES.badgeOrganizerMini : STYLES.badgeMemberMini}>
                              {participant.nickname} {participant.isRoleOrganizer && '★'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>(Zapłacił: {paid.toFixed(2)})</span>
                        </div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          {sign}{balance.toFixed(2)} PLN
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXPENSES LIST */}
            <div style={{ marginBottom: '30px' }}>
                <h4>Historia Wydatków</h4>
                {trip.expenses && trip.expenses.length > 0 ? (
                  <ul style={STYLES.expenseList}>
                    {trip.expenses.map(exp => (
                      <li key={exp.id} style={STYLES.expenseItem}>
                        <div>
                          <span style={{ fontWeight: '500' }}>{exp.title}</span>
                          <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>
                            (Płacił: {exp.payer ? exp.payer.nickname : 'Nieznany'})
                          </span>
                        </div>
                        <strong>{exp.amount.toFixed(2)} PLN</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>Brak dodanych wydatków.</p>
                )}

                {/* EXPENSE FORM */}
                <form onSubmit={handleAddExpense} style={STYLES.expenseForm}>
                   <div style={{flex: 2}}>
                     <input 
                        type="text" 
                        placeholder="Na co wydano? (np. Paliwo)" 
                        value={expenseTitle}
                        onChange={e => setExpenseTitle(e.target.value)}
                        style={STYLES.inputCompact}
                        required
                     />
                   </div>
                   <div style={{flex: 1}}>
                     <input 
                        type="number" 
                        step="0.01"
                        placeholder="Kwota" 
                        value={expenseAmount}
                        onChange={e => setExpenseAmount(e.target.value)}
                        style={STYLES.inputCompact}
                        required
                     />
                   </div>
                   <button 
                      type="submit" 
                      disabled={addingExpense}
                      style={{...STYLES.button, ...STYLES.actionButton}}
                   >
                     {addingExpense ? '...' : '+'}
                   </button>
                </form>
            </div>

            <p style={{ lineHeight: '1.6', color: '#444' }}>
              {trip.description || 'Brak opisu wycieczki.'}
            </p>

            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3>Uczestnicy ({allParticipants.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allParticipants.map(p => (
                   <div 
                      key={p.id} 
                      style={p.isRoleOrganizer ? STYLES.badgeOrganizer : STYLES.badgeMember}
                    >
                      {p.nickname}
                      {p.isRoleOrganizer && ' ★'}
                    </div>
                ))}
              </div>
            </div>

            {/* ORGANIZER ACTIONS */}
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
  inputCompact: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '10px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontSize: '14px' },
  saveButton: { backgroundColor: '#28a745', color: 'white' },
  editButton: { backgroundColor: '#007bff', color: 'white' },
  deleteButton: { backgroundColor: '#dc3545', color: 'white' },
  actionButton: { backgroundColor: '#6c757d', color: 'white' },
  
  financeSection: { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e9ecef' },
  
  balanceSection: { marginBottom: '30px', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' },
  balanceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '6px', marginBottom: '8px' },
  
  expenseList: { listStyle: 'none', padding: 0, margin: '0 0 15px 0' },
  expenseItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' },
  expenseForm: { display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f1f3f5', padding: '10px', borderRadius: '4px' },

  badgeMember: {
    padding: '4px 10px',
    backgroundColor: '#f1f3f5',
    color: '#495057',
    borderRadius: '15px',
    fontSize: '13px',
    border: '1px solid #dee2e6'
  },
  badgeOrganizer: {
    padding: '4px 10px',
    backgroundColor: '#d4edda',
    color: '#155724',
    borderRadius: '15px',
    fontSize: '13px',
    fontWeight: 'bold',
    border: '1px solid #c3e6cb'
  },
  badgeMemberMini: {
    fontSize: '12px',
    color: '#333'
  },
  badgeOrganizerMini: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#155724'
  }
};