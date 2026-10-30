import bunnyThumb from './assets/bunny.svg';
import elephantThumb from './assets/elephant.svg';
import blazesThumb from './assets/blazes.svg';
import steelThumb from './assets/steel.svg';
import sintelThumb from './assets/sintel.svg';

export const CHANNELS = [
  { id: 'c1', title: 'Home' },
  { id: 'c2', title: 'Movies' },
  { id: 'c3', title: 'Music' },
  { id: 'c4', title: 'Shows' },
];

export const ROWS_DATA = [
  {
    id: 'row-1',
    title: 'Recommended For You',
    items: [
      {
        id: '1-1',
        title: 'Big Buck Bunny',
        subtitle: '4K Ultra HD • Animation',
        duration: '09:56',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: bunnyThumb,
        badge: '4K HDR',
      },
      {
        id: '1-2',
        title: 'Nature in Motion',
        subtitle: '1080p • Macro Wildlife',
        duration: '10:53',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_flower.mp4',
        thumb: elephantThumb,
        badge: 'Trending',
      },
      {
        id: '1-3',
        title: 'For Bigger Blazes',
        subtitle: 'Chromecast Demo Showcase',
        duration: '00:15',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: blazesThumb,
        badge: 'Top Pick',
      },
      {
        id: '1-4',
        title: 'Tears of Steel',
        subtitle: 'VFX Open Movie Project',
        duration: '12:14',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_flower.mp4',
        thumb: steelThumb,
        badge: 'Award Winner',
      },
      {
        id: '1-5',
        title: 'Sintel - The Dragon',
        subtitle: 'Fantasy / Adventure',
        duration: '14:48',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: sintelThumb,
        badge: 'Popular',
      },
    ],
  },
  {
    id: 'row-2',
    title: 'Trending Now',
    items: [
      {
        id: '2-1',
        title: 'Tears of Steel',
        subtitle: 'VFX Open Movie Project',
        duration: '12:14',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_flower.mp4',
        thumb: steelThumb,
        badge: 'VFX Master',
      },
      {
        id: '2-2',
        title: 'Sintel - The Dragon',
        subtitle: 'Fantasy / Adventure',
        duration: '14:48',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: sintelThumb,
        badge: 'Popular',
      },
      {
        id: '2-3',
        title: 'Big Buck Bunny',
        subtitle: '4K Ultra HD • Animation',
        duration: '09:56',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: bunnyThumb,
        badge: 'Classic',
      },
      {
        id: '2-4',
        title: 'Elephant Dream',
        subtitle: '1080p • Sci-Fi / CGI',
        duration: '10:53',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_flower.mp4',
        thumb: elephantThumb,
        badge: 'Featured',
      },
      {
        id: '2-5',
        title: 'For Bigger Blazes',
        subtitle: 'Chromecast Demo Showcase',
        duration: '00:15',
        videoUrl: 'https://appassets.androidplatform.net/assets/media/sample_bunny.mp4',
        thumb: blazesThumb,
        badge: 'Short',
      },
    ],
  },
];

export const findMediaById = (id) => {
  for (const row of ROWS_DATA) {
    const found = row.items.find((item) => item.id === id);
    if (found) return found;
  }
  return ROWS_DATA[0].items[0];
};

