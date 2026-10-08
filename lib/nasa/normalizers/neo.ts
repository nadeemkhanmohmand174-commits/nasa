import type { MediaAsset, NeoSummary } from '@/types';
import { type neoFeedSchema, type neoLookupSchema } from '@/lib/nasa/client';
import { z } from 'zod';

type NeoFeedResponse = z.infer<typeof neoFeedSchema>;
type NeoLookupResponse = z.infer<typeof neoLookupSchema>;

/** Extract a flat list of NEO summaries from a feed response */
export function extractNeoSummaries(feed: NeoFeedResponse): NeoSummary[] {
  const summaries: NeoSummary[] = [];
  for (const [date, neos] of Object.entries(feed.near_earth_objects)) {
    for (const neo of neos) {
      const approach = neo.close_approach_data[0];
      summaries.push({
        id: neo.id,
        name: neo.name,
        absolute_magnitude_h: neo.absolute_magnitude_h,
        estimated_diameter_min_km: neo.estimated_diameter.kilometers.estimated_diameter_min,
        estimated_diameter_max_km: neo.estimated_diameter.kilometers.estimated_diameter_max,
        is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
        close_approach_date: approach?.close_approach_date ?? date,
        relative_velocity_kph: parseFloat(approach?.relative_velocity.kilometers_per_hour ?? '0'),
        miss_distance_km: parseFloat(approach?.miss_distance.kilometers ?? '0'),
        orbiting_body: approach?.orbiting_body ?? 'Earth',
        nasa_jpl_url: neo.nasa_jpl_url,
      });
    }
  }
  return summaries;
}

/** Normalize a NEO summary into MediaAsset */
export function normalizeNeo(summary: NeoSummary): MediaAsset {
  return {
    id: `neo_${summary.id}`,
    nativeId: summary.id,
    source: 'neo',
    kind: 'dataset',
    title: summary.name,
    description: `Near-Earth Object ${summary.name} (${summary.id}). Estimated diameter: ${summary.estimated_diameter_min_km.toFixed(3)}–${summary.estimated_diameter_max_km.toFixed(3)} km. Absolute magnitude: ${summary.absolute_magnitude_h}. ${summary.is_potentially_hazardous ? 'Classified as potentially hazardous.' : 'Not classified as hazardous.'} Closest approach on ${summary.close_approach_date} at ${summary.miss_distance_km.toFixed(0)} km traveling ${summary.relative_velocity_kph.toFixed(0)} km/h relative to ${summary.orbiting_body}.`,
    thumbUrl: '',
    previewUrl: '',
    fullUrl: '',
    downloadUrl: undefined,
    date: summary.close_approach_date,
    credit: 'NASA/JPL/Caltech CNEOS',
    center: 'JPL',
    keywords: ['neo', 'asteroid', summary.is_potentially_hazardous ? 'hazardous' : 'safe'],
    metadata: {
      absolute_magnitude_h: summary.absolute_magnitude_h,
      estimated_diameter_min_km: summary.estimated_diameter_min_km,
      estimated_diameter_max_km: summary.estimated_diameter_max_km,
      is_potentially_hazardous: summary.is_potentially_hazardous,
      close_approach_date: summary.close_approach_date,
      relative_velocity_kph: summary.relative_velocity_kph,
      miss_distance_km: summary.miss_distance_km,
      orbiting_body: summary.orbiting_body,
    },
    citations: [
      { label: 'NASA JPL Small-Body Database', url: summary.nasa_jpl_url },
      { label: 'CNEOS NEO Earth Close Approaches', url: 'https://cneos.jpl.nasa.gov/ca/' },
    ],
  };
}

/** Normalize a NEO lookup response into MediaAsset */
export function normalizeNeoLookup(lookup: NeoLookupResponse): MediaAsset {
  const approach = lookup.close_approach_data[0];
  return {
    id: `neo_${lookup.id}`,
    nativeId: lookup.id,
    source: 'neo',
    kind: 'dataset',
    title: lookup.name,
    description: `Near-Earth Object ${lookup.name} (designation: ${lookup.designation}). ${lookup.is_potentially_hazardous_asteroid ? 'This object is classified as potentially hazardous.' : 'This object is not classified as potentially hazardous.'} ${lookup.orbital_data ? `Orbital period: ${lookup.orbital_data.orbital_period} days. Eccentricity: ${lookup.orbital_data.eccentricity}.` : ''}`,
    thumbUrl: '',
    previewUrl: '',
    fullUrl: '',
    downloadUrl: undefined,
    date: approach?.close_approach_date ?? new Date().toISOString().split('T')[0]!,
    credit: 'NASA/JPL/Caltech CNEOS',
    center: 'JPL',
    keywords: ['neo', 'asteroid', lookup.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe'],
    metadata: {
      designation: lookup.designation,
      absolute_magnitude_h: lookup.absolute_magnitude_h,
      estimated_diameter_min_km: lookup.estimated_diameter.kilometers.estimated_diameter_min,
      estimated_diameter_max_km: lookup.estimated_diameter.kilometers.estimated_diameter_max,
      is_potentially_hazardous: lookup.is_potentially_hazardous_asteroid,
      close_approach_date: approach?.close_approach_date ?? '',
      relative_velocity_kph: parseFloat(approach?.relative_velocity.kilometers_per_hour ?? '0'),
      miss_distance_km: parseFloat(approach?.miss_distance.kilometers ?? '0'),
      orbiting_body: approach?.orbiting_body ?? '',
      ...(lookup.orbital_data
        ? {
            orbit_id: lookup.orbital_data.orbit_id,
            orbit_determination_date: lookup.orbital_data.orbit_determination_date,
            first_observation_date: lookup.orbital_data.first_observation_date,
            last_observation_date: lookup.orbital_data.last_observation_date,
            semi_major_axis: lookup.orbital_data.semi_major_axis,
            eccentricity: lookup.orbital_data.eccentricity,
            inclination: lookup.orbital_data.inclination,
            orbital_period: lookup.orbital_data.orbital_period,
          }
        : {}),
    },
    citations: [
      { label: 'NASA JPL Small-Body Database', url: lookup.nasa_jpl_url },
      { label: 'CNEOS', url: 'https://cneos.jpl.nasa.gov/' },
    ],
  };
}
