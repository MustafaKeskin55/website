import React, { useState, useEffect } from 'react';
import { Users, Mail, Globe, Clock, UserCheck, RefreshCw } from 'lucide-react';

export const MembersTab: React.FC<{ token: string; apiUrl: string }> = ({ token, apiUrl }) => {
  const [summary, setSummary] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const baseUrl = apiUrl.replace('/api/config', '');
      
      const summaryRes = await fetch(`${baseUrl}/api/admin/members/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (summaryRes.ok) {
        setSummary(await summaryRes.json());
      }

      const listRes = await fetch(`${baseUrl}/api/admin/members?limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        setMembers(listData.items || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [token, apiUrl]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--gold)' }}>
        <RefreshCw size={24} className="animate-spin" />
        <span style={{ marginLeft: 8 }}>Veriler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: '40px' }}>
      <div className="header">
        <div>
          <h2><Users size={26} color="var(--gold)" /> Üyeler ve İstatistikler</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Mobil uygulamanıza kayıt olan kullanıcıların genel durumu ve son girenler.
          </p>
        </div>
        <button className="btn" onClick={fetchMembers}>
          <RefreshCw size={18} /> Yenile
        </button>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-title">
              <span>Toplam Üye</span>
              <Users size={18} color="var(--gold)" />
            </div>
            <div className="stat-value">{summary.total || 0}</div>
            <div className="stat-subtitle">Kayıtlı Tüm Hesaplar</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">
              <span>Bugün Katılan</span>
              <UserCheck size={18} color="var(--accent)" />
            </div>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{summary.today || 0}</div>
            <div className="stat-subtitle">Sadece Bugüne Ait Kayıtlar</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">
              <span>Son 7 Gün</span>
              <Clock size={18} color="var(--gold-bright)" />
            </div>
            <div className="stat-value">{summary.last7 || 0}</div>
            <div className="stat-subtitle">Son Bir Haftalık Artış</div>
          </div>

          <div className="stat-card">
            <div className="stat-title">
              <span>Aktif (Bugün)</span>
              <Globe size={18} color="#3B82F6" />
            </div>
            <div className="stat-value" style={{ color: '#60A5FA' }}>{summary.activeToday || 0}</div>
            <div className="stat-subtitle">Bugün Uygulamaya Girenler</div>
          </div>
        </div>
      )}

      <div className="control-panel">
        <div className="panel-title">
          <span><Users size={20} /> Son Kayıt Olanlar (En Yeni 20 Üye)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {members.map((m) => (
            <div className="service-row" key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                {m.picture ? (
                  <img 
                    src={m.picture} 
                    alt={m.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border)', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="var(--text-muted)" />
                  </div>
                )}
                <div className="service-info" style={{ flex: 1 }}>
                  <div className="service-name">{m.name || 'İsimsiz Kullanıcı'}</div>
                  <div className="service-url" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {m.email}
                    </span>
                    <span style={{ color: 'var(--gold)' }}>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Globe size={12} /> {(m.language || 'tr').toUpperCase()} {m.country ? `(${m.country})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="service-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span className="status-badge" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  Giriş: {m.login_count || 1} kez
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Kayıt: {new Date(m.created_at * 1000).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Henüz kayıtlı bir üye bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
