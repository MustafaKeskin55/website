import React, { useState } from 'react';
import { UploadCloud, Trash2, RotateCw, ImagePlus, Sparkles, Check, AlertCircle } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpapersTabProps {
  wallpapers: Wallpaper[];
  onDelete: (id: string, label: string) => void;
  onAdd: (wallpaper: Wallpaper) => void;
}

export const WallpapersTab: React.FC<WallpapersTabProps> = ({ wallpapers, onDelete, onAdd }) => {
  const [fileData, setFileData] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('🕌');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emojiList = ['🕌', '🕋', '🌙', '✨', '🌸', '🤲', '📖', '📿', '🌟', '💧', '⛰️', '🔥'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileData(result);
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSource = fileData || imageUrl.trim();

    if (!finalSource) {
      alert('Lütfen bir görsel dosyası seçin veya görsel URL adresi girin!');
      return;
    }

    if (!title.trim()) {
      alert('Lütfen duvar kağıdı için bir isim girin!');
      return;
    }

    setIsSubmitting(true);
    const newWp: Wallpaper = {
      id: `wp_custom_${Date.now()}`,
      imageUrl: finalSource,
      label: title.trim(),
      emoji: emoji.trim() || '✨',
      isCustom: true
    };

    onAdd(newWp);

    // Formu sıfırla
    setFileData('');
    setImageUrl('');
    setTitle('');
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="controls-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        
        {/* Yeni Duvar Kağıdı Ekle Formu */}
        <div className="control-panel">
          <div className="panel-title">
            <span><ImagePlus size={20} /> Yeni Duvar Kağıdı Yükle</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="dropzone"
              onClick={() => document.getElementById('fileUploadInput')?.click()}
            >
              <UploadCloud size={40} className="dropzone-icon" />
              <h4 style={{ fontWeight: 500 }}>Görsel Seçmek İçin Tıklayın veya Sürükleyin</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                Desteklenen formatlar: JPG, PNG, WEBP (Önerilen: 9:16 dikey format)
              </p>
              <input
                type="file"
                id="fileUploadInput"
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Önizleme */}
            {(fileData || imageUrl) && (
              <div className="preview-box">
                <img src={fileData || imageUrl} alt="Önizleme" />
              </div>
            )}

            <div className="input-group">
              <label>Veya Doğrudan Görsel URL'si Girin</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setFileData('');
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '12px' }}>
              <div className="input-group">
                <label>Görsel Başlığı / Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Mescid-i Aksa Hilali"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>İkon / Emoji</label>
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  style={{
                    padding: '12px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}
                >
                  {emojiList.map((em) => (
                    <option key={em} value={em} style={{ background: '#06110D' }}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn"
              style={{ width: '100%', marginTop: '16px' }}
              disabled={isSubmitting}
            >
              <Sparkles size={18} />
              <span>{isSubmitting ? 'Yayına Alınıyor...' : 'Uygulamaya Yayına Al'}</span>
            </button>
          </form>
        </div>

        {/* Duvar Kağıdı Yönetim Kuralları */}
        <div className="control-panel">
          <div className="panel-title">
            <span><Sparkles size={20} /> İşlem Kuralları</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              🗑️ <b>Silme İşlemi:</b> Herhangi bir duvar kağıdı için <b>"Sil"</b> butonuna tıklandığında kimlik sunucuya iletilir ve mobil uygulamada anında gizlenir.
            </p>
            <p style={{ marginBottom: '12px' }}>
              📤 <b>Yükleme İşlemi:</b> Dosya seçerek veya doğrudan HTTPS görsel adresi vererek eklenen yeni görseller doğrudan kullanıcıların telefonundaki seçiciye eklenir.
            </p>
            <p>
              📐 <b>Çözünürlük:</b> Mobil ekranlar için dikey oranlı (9:16) fotoğraflar önerilir.
            </p>
          </div>
        </div>
      </div>

      {/* Aktif Duvar Kağıtları Galerisi */}
      <div className="control-panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-title">
          <span>Telefonda Yayında Olan Duvar Kağıtları ({wallpapers.length})</span>
        </div>

        {wallpapers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Henüz yayında duvar kağıdı bulunmuyor. Yukarıdan yeni görsel yükleyebilirsiniz.
          </div>
        ) : (
          <div className="wallpaper-grid">
            {wallpapers.map((item) => {
              const imgSrc = item.imageUrl || `./wallpapar/${item.fileName}`;
              return (
                <div key={item.id} className="wallpaper-card">
                  <img
                    className="wallpaper-thumb"
                    src={imgSrc}
                    alt={item.label}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('/wallpapar/')) {
                        img.src = `/wallpapar/${item.fileName}`;
                      } else {
                        img.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';
                      }
                    }}
                  />
                  <div className="wallpaper-info">
                    <div className="wallpaper-title-row">
                      <span className="wallpaper-name" title={item.label}>
                        {item.emoji} {item.label}
                      </span>
                      <span
                        className="wallpaper-badge"
                        style={{
                          background: item.isCustom ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)',
                          color: item.isCustom ? 'var(--accent)' : 'var(--gold)'
                        }}
                      >
                        {item.isCustom ? 'Özel' : 'Sistem'}
                      </span>
                    </div>

                    <div className="wallpaper-card-actions">
                      <button
                        className="btn-danger"
                        onClick={() => onDelete(item.id, item.label)}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
