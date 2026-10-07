export interface Wallpaper {
  id: string;
  fileName?: string;
  imageUrl?: string;
  label: string;
  emoji: string;
  isCustom?: boolean;
}

export interface AppConfig {
  adsEnabled: boolean;
  bannerAdUnitId: string;
  ramazanMode: boolean;
  prayerApiUrl: string;
  quranApiUrl: string;
  audioCdnUrl: string;
  serverApiUrl?: string;
  deletedWallpaperIds: string[];
  customWallpapers: Wallpaper[];
}

export interface AdminUser {
  name: string;
  email: string;
  picture: string;
}

export type TabKey = 'overview' | 'wallpapers' | 'apis' | 'ads' | 'members';
