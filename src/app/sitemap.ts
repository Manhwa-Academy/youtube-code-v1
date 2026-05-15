import { MetadataRoute } from 'next';
import { db } from '@/db';
import { videos, users, playlists } from '@/db/schema';
import { eq } from 'drizzle-orm';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://youtube-code-v1.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch public videos
  const publicVideos = await db.select({
    id: videos.id,
    updatedAt: videos.updatedAt,
  }).from(videos).where(eq(videos.visibility, 'public'));

  // Fetch all users
  const activeUsers = await db.select({
    id: users.id,
    updatedAt: users.updatedAt,
  }).from(users);

  // Fetch public playlists
  const publicPlaylists = await db.select({
    id: playlists.id,
    updatedAt: playlists.updatedAt,
  }).from(playlists).where(eq(playlists.visibility, 'public'));

  // Define supported locales
  const locales = ['vi', 'en', 'ja', 'ko', 'zh', 'es', 'fr', 'de'];

  const videoEntries: MetadataRoute.Sitemap = [];
  const userEntries: MetadataRoute.Sitemap = [];
  const playlistEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale
  locales.forEach((locale) => {
    publicVideos.forEach((v) => {
      videoEntries.push({
        url: `${BASE_URL}/${locale}/videos/${v.id}`,
        lastModified: v.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    activeUsers.forEach((u) => {
      userEntries.push({
        url: `${BASE_URL}/${locale}/users/${u.id}`,
        lastModified: u.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });

    publicPlaylists.forEach((p) => {
      playlistEntries.push({
        url: `${BASE_URL}/${locale}/playlists/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    });
  });

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...videoEntries,
    ...userEntries,
    ...playlistEntries,
  ];
}
