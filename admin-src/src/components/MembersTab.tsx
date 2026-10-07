import React, { useState, useEffect } from 'react';

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
    return <div className="tab-content"><p>Yükleniyor...</p></div>;
  }

  return (
    <div className="tab-content fade-in">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Üyeler</h2>
          <p className="text-gray-400">Mobil uygulama kullanıcı istatistikleri ve listesi</p>
        </div>
        <button className="btn-primary" onClick={fetchMembers}>
          Yenile
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center p-4">
            <h3 className="text-gray-400 text-sm">Toplam Üye</h3>
            <p className="text-3xl font-bold text-gold-500">{summary.total}</p>
          </div>
          <div className="card text-center p-4">
            <h3 className="text-gray-400 text-sm">Bugün Katılan</h3>
            <p className="text-3xl font-bold text-white">{summary.today}</p>
          </div>
          <div className="card text-center p-4">
            <h3 className="text-gray-400 text-sm">Son 7 Gün</h3>
            <p className="text-3xl font-bold text-white">{summary.last7}</p>
          </div>
          <div className="card text-center p-4">
            <h3 className="text-gray-400 text-sm">Aktif (Bugün)</h3>
            <p className="text-3xl font-bold text-emerald-400">{summary.activeToday}</p>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-4">Kullanıcı</th>
              <th className="p-4">E-posta</th>
              <th className="p-4 text-center">Dil/Ülke</th>
              <th className="p-4 text-center">Kayıt Tarihi</th>
              <th className="p-4 text-center">Son Giriş</th>
              <th className="p-4 text-center">Giriş S.</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-4 flex items-center gap-3">
                  {m.picture ? (
                    <img src={m.picture} alt="" className="w-8 h-8 rounded-full border border-gray-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">?</div>
                  )}
                  <span className="font-medium text-white">{m.name}</span>
                </td>
                <td className="p-4 text-gray-400">{m.email}</td>
                <td className="p-4 text-center">
                  <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">
                    {m.language?.toUpperCase() || '-'} {m.country ? `/ ${m.country}` : ''}
                  </span>
                </td>
                <td className="p-4 text-center text-gray-400">
                  {new Date(m.created_at * 1000).toLocaleDateString('tr-TR')}
                </td>
                <td className="p-4 text-center text-gray-400">
                  {new Date(m.last_login_at * 1000).toLocaleDateString('tr-TR')}
                </td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-xs">
                    {m.login_count}
                  </span>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Henüz üye kaydı bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
