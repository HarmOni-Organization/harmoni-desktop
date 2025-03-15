import axios from 'axios';

import type { MediaMetadata } from '../types';

// Track API request timestamps to implement rate limiting
const apiRequestTimestamps = {
  anilist: [] as number[],
  mal: [] as number[],
  tmdb: [] as number[],
};

// Rate limits (requests per minute)
const API_RATE_LIMITS = {
  anilist: 30, // AniList allows 90 requests per minute, but we'll be conservative
  mal: 30,
  tmdb: 30,
};

// Minimum time between requests in ms
const MIN_REQUEST_INTERVAL = 1000;

/**
 * Check if we're within rate limits for the given API
 * @param api The API to check
 * @returns Whether we can make another request
 */
function canMakeRequest(api: 'anilist' | 'mal' | 'tmdb'): boolean {
  const now = Date.now();
  const timestamps = apiRequestTimestamps[api];

  // Remove timestamps older than 1 minute
  const oneMinuteAgo = now - 60000;
  const recentRequests = timestamps.filter((time) => time > oneMinuteAgo);
  apiRequestTimestamps[api] = recentRequests;

  // Check if we're under the rate limit
  return recentRequests.length < API_RATE_LIMITS[api];
}

/**
 * Record a request to the given API
 * @param api The API to record a request for
 */
function recordRequest(api: 'anilist' | 'mal' | 'tmdb'): void {
  apiRequestTimestamps[api].push(Date.now());
}

/**
 * Wait for the rate limit to reset
 * @param api The API to wait for
 * @param retryAfter Optional retry-after time in seconds
 * @returns A promise that resolves when it's safe to make another request
 */
async function waitForRateLimit(
  api: 'anilist' | 'mal' | 'tmdb',
  retryAfter?: number,
): Promise<void> {
  if (retryAfter) {
    // If we have a retry-after header, wait that long
    console.log(
      `Rate limited by ${api}, waiting ${retryAfter} seconds before retrying`,
    );
    await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    return;
  }

  // Otherwise, wait until we're under the rate limit
  const now = Date.now();
  const timestamps = apiRequestTimestamps[api];

  if (timestamps.length === 0) {
    return;
  }

  // Wait for the oldest timestamp to be more than 1 minute ago
  const oneMinuteAgo = now - 60000;
  const oldestTimestamp = timestamps[0];

  if (
    oldestTimestamp > oneMinuteAgo &&
    timestamps.length >= API_RATE_LIMITS[api]
  ) {
    const waitTime = oldestTimestamp + 60000 - now + 1000; // Add 1 second buffer
    console.log(
      `Rate limit for ${api} reached, waiting ${waitTime}ms before retrying`,
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  } else {
    // Always wait a minimum time between requests to be polite
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL));
  }
}

/**
 * Fetch metadata from online sources
 *
 * @param title The title to search for
 * @param source The metadata source to use (anilist, mal, tmdb)
 * @returns The fetched metadata or null if not found
 */
export async function fetchMetadata(
  title: string,
  source: 'anilist' | 'mal' | 'tmdb' = 'anilist',
): Promise<MediaMetadata | null> {
  try {
    // Extract title from filename if needed
    const cleanTitle = extractCleanTitle(title);

    // Choose the appropriate fetcher based on the source
    switch (source) {
      case 'anilist':
        return await fetchFromAniList(cleanTitle);
      case 'mal':
        return await fetchFromMyAnimeList(cleanTitle);
      case 'tmdb':
        return await fetchFromTMDb(cleanTitle);
      default:
        return await fetchFromAniList(cleanTitle);
    }
  } catch (error) {
    console.error('Failed to fetch metadata:', error);
    return null;
  }
}

/**
 * Extract a clean title from a filename
 */
function extractCleanTitle(filename: string): string {
  // Remove file extension
  let title = filename.replace(/\.[^/.]+$/, '');

  // Remove season/episode information
  title = title.replace(/[Ss]\d{1,2}[Ee]\d{1,2}/g, '');
  title = title.replace(/[\s-]+\d{1,3}(?:[\s-]+|$)/g, '');

  // Remove year
  title = title.replace(/\(\d{4}\)/g, '');

  // Clean up title
  title = title
    .replace(/\./g, ' ') // Replace dots with spaces
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim(); // Remove leading/trailing spaces

  return title;
}

/**
 * Fetch metadata from AniList
 *
 * @param title The title to search for
 * @returns The fetched metadata or null if not found
 */
async function fetchFromAniList(title: string): Promise<MediaMetadata | null> {
  try {
    // Check if we're within rate limits
    if (!canMakeRequest('anilist')) {
      await waitForRateLimit('anilist');
    }

    // AniList GraphQL API endpoint
    const url = 'https://graphql.anilist.co';

    // GraphQL query
    const query = `
      query ($search: String) {
        Media (search: $search, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
          }
          bannerImage
          genres
          averageScore
          seasonYear
          studios {
            nodes {
              name
            }
          }
          episodes
        }
      }
    `;

    // Record the request
    recordRequest('anilist');

    // Make the request
    const response = await axios.post(url, {
      query,
      variables: { search: title },
    });

    // Check if we got a result
    if (response.data?.data?.Media) {
      const media = response.data.data.Media;

      // Map AniList data to our metadata format
      return {
        title: media.title.english || media.title.romaji,
        originalTitle: media.title.native,
        synopsis: media.description,
        coverImage: media.coverImage?.large,
        bannerImage: media.bannerImage,
        genres: media.genres,
        rating: media.averageScore ? media.averageScore / 10 : undefined, // Convert to 0-10 scale
        releaseDate: media.seasonYear ? `${media.seasonYear}-01-01` : undefined, // Use January 1st as a placeholder
        studio: media.studios?.nodes?.[0]?.name,
        totalEpisodes: media.episodes,
        anilistId: media.id,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch from AniList:', error);

    // Handle rate limiting
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const retryAfter = parseInt(
        error.response.headers['retry-after'] || '60',
        10,
      );
      await waitForRateLimit('anilist', retryAfter);

      // Try again after waiting
      return fetchFromAniList(title);
    }

    return null;
  }
}

/**
 * Fetch metadata from MyAnimeList
 *
 * Note: This is a placeholder implementation. MyAnimeList requires authentication.
 * In a real implementation, you would need to use their official API with proper authentication.
 *
 * @param title The title to search for
 * @returns The fetched metadata or null if not found
 */
async function fetchFromMyAnimeList(
  title: string,
): Promise<MediaMetadata | null> {
  // Check if we're within rate limits
  if (!canMakeRequest('mal')) {
    await waitForRateLimit('mal');
  }

  // Record the request
  recordRequest('mal');

  // This is a placeholder. In a real implementation, you would use the MyAnimeList API.
  console.log(`Fetching from MyAnimeList: ${title}`);
  return null;
}

/**
 * Fetch metadata from TMDb
 *
 * Note: This is a placeholder implementation. TMDb requires an API key.
 * In a real implementation, you would need to use their official API with a proper API key.
 *
 * @param title The title to search for
 * @returns The fetched metadata or null if not found
 */
async function fetchFromTMDb(title: string): Promise<MediaMetadata | null> {
  // Check if we're within rate limits
  if (!canMakeRequest('tmdb')) {
    await waitForRateLimit('tmdb');
  }

  // Record the request
  recordRequest('tmdb');

  // This is a placeholder. In a real implementation, you would use the TMDb API.
  console.log(`Fetching from TMDb: ${title}`);
  return null;
}
