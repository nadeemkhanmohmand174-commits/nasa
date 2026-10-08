import { describe, it, expect } from 'vitest';
import { normalizeApod } from '@/lib/nasa/normalizers/apod';
import { normalizeMarsPhoto } from '@/lib/nasa/normalizers/mars';
import { normalizeEpic } from '@/lib/nasa/normalizers/epic';

describe('normalizers', () => {
  describe('normalizeApod', () => {
    it('normalizes an image APOD', () => {
      const result = normalizeApod({
        date: '2026-10-03',
        title: 'Test Galaxy',
        explanation: 'A beautiful galaxy.',
        url: 'https://example.com/image.jpg',
        hdurl: 'https://example.com/hd.jpg',
        media_type: 'image',
        copyright: 'NASA',
      });
      expect(result.id).toBe('apod_2026-10-03');
      expect(result.source).toBe('apod');
      expect(result.kind).toBe('image');
      expect(result.title).toBe('Test Galaxy');
      expect(result.fullUrl).toBe('https://example.com/hd.jpg');
      expect(result.citations).toHaveLength(2);
    });

    it('normalizes a video APOD', () => {
      const result = normalizeApod({
        date: '2026-10-02',
        title: 'Test Video',
        explanation: 'A video.',
        url: 'https://youtube.com/watch?v=123',
        thumbnail_url: 'https://img.youtube.com/123.jpg',
        media_type: 'video',
      });
      expect(result.kind).toBe('video');
      expect(result.thumbUrl).toBe('https://img.youtube.com/123.jpg');
    });
  });

  describe('normalizeMarsPhoto', () => {
    it('normalizes a Mars photo', () => {
      const result = normalizeMarsPhoto({
        id: 12345,
        sol: 1000,
        camera: { id: 1, name: 'MAST', rover_id: 5, full_name: 'Mast Camera' },
        img_src: 'https://mars.nasa.gov/photo.jpg',
        earth_date: '2026-01-15',
        rover: { id: 5, name: 'Curiosity', landing_date: '2012-08-06', launch_date: '2011-11-26', status: 'active', max_sol: 4000, max_date: '2026-01-15', total_photos: 500000, cameras: ['MAST'] },
      });
      expect(result.id).toBe('mars_12345');
      expect(result.source).toBe('mars');
      expect(result.metadata.sol).toBe(1000);
      expect(result.metadata.camera_name).toBe('MAST');
    });
  });

  describe('normalizeEpic', () => {
    it('normalizes an EPIC image', () => {
      const result = normalizeEpic({
        identifier: 'epic_1b2c3d',
        caption: 'Earth from DSCOVR',
        image: 'epic_image_001',
        date: '2026-10-01 12:00:00',
        centroid_coordinates: { lat: 10.5, lon: -20.3 },
        dscovr_j2000_position: { x: 1, y: 2, z: 3 },
        lunar_j2000_position: { x: 4, y: 5, z: 6 },
        sun_j2000_position: { x: 7, y: 8, z: 9 },
        attitude_quaternions: [1, 0, 0, 0],
      });
      expect(result.id).toBe('epic_epic_1b2c3d');
      expect(result.source).toBe('epic');
      expect(result.fullUrl).toContain('epic.gsfc.nasa.gov');
      expect(result.metadata.centroid_lat).toBe(10.5);
    });
  });
});
