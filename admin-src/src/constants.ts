import { Wallpaper, AppConfig } from './types';

export const DEFAULT_WALLPAPERS: Wallpaper[] = [
  { id: "wp_kabe_gece", fileName: "wp_kabe_gece.jpg", label: "Kâbe – Gece", emoji: "🕋", isCustom: false },
  { id: "wp_kabe_gunseti", fileName: "wp_kabe_gunseti.jpg", label: "Kâbe – Gün Batımı", emoji: "🌅", isCustom: false },
  { id: "wp_mescid_nebevi", fileName: "wp_mescid_nebevi.jpg", label: "Mescid-i Nebevî", emoji: "🕌", isCustom: false },
  { id: "wp_fener_dolunay", fileName: "wp_fener_dolunay.jpg", label: "Fener & Dolunay", emoji: "🌕", isCustom: false },
  { id: "wp_istanbul_camii_gunbatimi", fileName: "wp_istanbul_camii_gunbatimi.jpg", label: "İstanbul Camii", emoji: "🌉", isCustom: false },
  { id: "wp_beyaz_cami_hilal", fileName: "wp_beyaz_cami_hilal.jpg", label: "Beyaz Cami & Hilal", emoji: "🌙", isCustom: false },
  { id: "wp_cami_yansima", fileName: "wp_cami_yansima.jpg", label: "Cami – Yansıma", emoji: "💧", isCustom: false },
  { id: "wp_cami_kubbe_ic", fileName: "wp_cami_kubbe_ic.jpg", label: "Cami Kubbesi – İç", emoji: "✨", isCustom: false },
  { id: "wp_dag_cami_gol", fileName: "wp_dag_cami_gol.jpg", label: "Dağ – Cami – Göl", emoji: "🏔️", isCustom: false },
  { id: "wp_bahce_cami", fileName: "wp_bahce_cami.jpg", label: "Bahçe & Cami", emoji: "🌸", isCustom: false },
  { id: "wp_col_hilal_gece", fileName: "wp_col_hilal_gece.jpg", label: "Çöl – Hilal – Gece", emoji: "⭐", isCustom: false },
  { id: "wp_col_hilal_yildiz", fileName: "wp_col_hilal_yildiz.jpg", label: "Çöl – Hilal – Yıldız", emoji: "🌟", isCustom: false },
  { id: "wp_kuran_rahle", fileName: "wp_kuran_rahle.jpg", label: "Kur'an – Rahle", emoji: "📖", isCustom: false },
  { id: "wp_tesbih_mermer", fileName: "wp_tesbih_mermer.jpg", label: "Tesbih – Mermer", emoji: "📿", isCustom: false },
  { id: "wp_seccade_sabah", fileName: "wp_seccade_sabah.jpg", label: "Seccade – Sabah", emoji: "🙏", isCustom: false },
  { id: "wp_namaz_daglarda", fileName: "wp_namaz_daglarda.jpg", label: "Namaz – Dağlarda", emoji: "⛰️", isCustom: false },
  { id: "wp_dua_eller", fileName: "wp_dua_eller.jpg", label: "Dua Eden Eller", emoji: "🤲", isCustom: false },
  { id: "wp_hilal_yesil", fileName: "wp_hilal_yesil.jpg", label: "Hilal – Yeşil", emoji: "🌙", isCustom: false },
  { id: "wp_allah_hat", fileName: "wp_allah_hat.jpg", label: "Allah – Hat Sanatı", emoji: "☪️", isCustom: false },
  { id: "wp_alev_soyut", fileName: "wp_alev_soyut.jpg", label: "Altın Alev – Soyut", emoji: "🔥", isCustom: false }
];

export const INITIAL_CONFIG: AppConfig = {
  adsEnabled: true,
  bannerAdUnitId: "ca-app-pub-1095649040834648/6353100367",
  ramazanMode: false,
  prayerApiUrl: "https://api.aladhan.com/",
  quranApiUrl: "https://api.quran.com/api/v4/",
  audioCdnUrl: "https://download.quranicaudio.com/quran/",
  serverApiUrl: "",
  deletedWallpaperIds: [],
  customWallpapers: []
};
