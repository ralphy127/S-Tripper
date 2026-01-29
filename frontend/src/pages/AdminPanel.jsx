import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Błąd pobierania użytkowników: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert('Nie udało się usunąć użytkownika: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <div style={STYLES.header}>
        <div>
          <h1 style={{ margin: 0 }}>Panel Administratora</h1>
          <p style={{ margin: '5px 0', color: '#666' }}>Zarządzanie użytkownikami</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ ...STYLES.button, ...STYLES.backButton }}
        >
          &larr; Wróć do Dashboardu
        </button>
      </div>

      {error && <div style={STYLES.errorBox}>{error}</div>}

      {/* CONTENT */}
      <div style={STYLES.card}>
        {loading ? (
          <p>Ładowanie listy...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={STYLES.table}>
              <thead>
                <tr>
                  <th style={STYLES.th}>ID</th>
                  <th style={STYLES.th}>Nickname</th>
                  <th style={STYLES.th}>Email</th>
                  <th style={STYLES.th}>Rola</th>
                  <th style={STYLES.th}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={STYLES.tr}>
                    <td style={STYLES.td}>#{u.id}</td>
                    <td style={STYLES.td}><strong>{u.nickname}</strong></td>
                    <td style={STYLES.td}>{u.email}</td>
                    <td style={STYLES.td}>
                      {u.is_admin ? (
                        <span style={STYLES.badgeAdmin}>ADMIN</span>
                      ) : (
                        <span style={STYLES.badgeUser}>User</span>
                      )}
                    </td>
                    <td style={STYLES.td}>
                      {!u.is_admin && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          style={STYLES.deleteButton}
                        >
                          Usuń
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  card: {
    padding: '25px',
    backgroundColor: '#fff',
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  button: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'opacity 0.2s'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '14px'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    color: '#495057'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    color: '#212529'
  },
  tr: {
    ':hover': { backgroundColor: '#f8f9fa' }
  },
  badgeAdmin: {
    backgroundColor: '#6610f2',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  badgeUser: {
    backgroundColor: '#e9ecef',
    color: '#495057',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  }
};