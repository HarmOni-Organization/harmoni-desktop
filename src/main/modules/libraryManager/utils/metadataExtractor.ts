import type { MediaMetadata } from '../types';

/**
 * Clean up title by removing dots, underscores, and extra spaces
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\./g, ' ') // Replace dots with spaces
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/[-–—]+$/, '') // Remove trailing dashes
    .trim(); // Remove leading/trailing spaces
}

/**
 * Extract metadata from filename
 *
 * Supports various filename formats:
 * - Show.Name.S01E01.mp4
 * - Show Name - S01E01 - Episode Title.mp4
 * - Show Name - 01 - Episode Title.mp4
 * - Show Name - 01.mp4
 * - Movie Name (2021).mp4
 * - Show.Name.1x01.mp4
 * - Show.Name.E01.mp4
 * - Show.Name.EP01.mp4
 * - Show.Name.Episode.01.mp4
 * - Show.Name.101.mp4 (season 1, episode 1)
 */
export function extractMetadataFromFilename(
  filename: string,
): MediaMetadata | null {
  try {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Try to match standard TV show pattern: S01E01
    const seasonEpisodePattern = /[Ss](\d{1,2})[Ee](\d{1,2})/i;
    const seasonEpisodeMatch = nameWithoutExt.match(seasonEpisodePattern);

    if (seasonEpisodeMatch) {
      // Format: Show.Name.S01E01.mp4 or Show Name - S01E01 - Episode Title.mp4
      const season = parseInt(seasonEpisodeMatch[1], 10);
      const episode = parseInt(seasonEpisodeMatch[2], 10);

      // Extract title (everything before S01E01)
      let title = nameWithoutExt.split(seasonEpisodeMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        season,
        episode,
      };
    }

    // Try to match alternative format: 1x01
    const altSeasonEpisodePattern = /(\d{1,2})x(\d{1,2})/i;
    const altSeasonEpisodeMatch = nameWithoutExt.match(altSeasonEpisodePattern);

    if (altSeasonEpisodeMatch) {
      const season = parseInt(altSeasonEpisodeMatch[1], 10);
      const episode = parseInt(altSeasonEpisodeMatch[2], 10);

      // Extract title (everything before 1x01)
      let title = nameWithoutExt.split(altSeasonEpisodeMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        season,
        episode,
      };
    }

    // Try to match E01 or EP01 pattern
    const epPattern = /[Ee][Pp]?(\d{1,3})/i;
    const epMatch = nameWithoutExt.match(epPattern);

    if (epMatch) {
      const episode = parseInt(epMatch[1], 10);

      // Extract title (everything before E01)
      let title = nameWithoutExt.split(epMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        episode,
      };
    }

    // Try to match "Episode 01" or "Episode.01" pattern
    const episodeWordPattern = /[Ee]pisode[.\s-]+(\d{1,3})/i;
    const episodeWordMatch = nameWithoutExt.match(episodeWordPattern);

    if (episodeWordMatch) {
      const episode = parseInt(episodeWordMatch[1], 10);

      // Extract title (everything before Episode 01)
      let title = nameWithoutExt.split(episodeWordMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        episode,
      };
    }

    // Try to match season+episode as 3 digits (101 = S01E01)
    const combinedPattern = /[.\s-](\d)(\d{2})[.\s-]/;
    const combinedMatch = nameWithoutExt.match(combinedPattern);

    if (combinedMatch) {
      const season = parseInt(combinedMatch[1], 10);
      const episode = parseInt(combinedMatch[2], 10);

      // Extract title (everything before the combined number)
      let title = nameWithoutExt.split(combinedMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        season,
        episode,
      };
    }

    // Try to match episode number pattern (Show Name - 01 - Episode Title.mp4 or Show Name - 01.mp4)
    const episodePattern = /[\s-]+(\d{1,3})(?:[\s-]+|$)/;
    const episodeMatch = nameWithoutExt.match(episodePattern);

    if (episodeMatch) {
      const episode = parseInt(episodeMatch[1], 10);

      // Extract title (everything before the episode number)
      let title = nameWithoutExt.split(episodeMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        episode,
      };
    }

    // Try to match movie pattern (Movie Name (2021).mp4)
    const yearPattern = /\((\d{4})\)/;
    const yearMatch = nameWithoutExt.match(yearPattern);

    if (yearMatch) {
      const year = yearMatch[1];

      // Extract title (everything before the year)
      let title = nameWithoutExt.split(yearMatch[0])[0];

      // Clean up title
      title = cleanTitle(title);

      return {
        title,
        releaseDate: `${year}-01-01`, // Use January 1st as a placeholder
      };
    }

    // If no patterns match, just use the filename as the title
    return {
      title: cleanTitle(nameWithoutExt),
    };
  } catch (error) {
    console.error('Failed to extract metadata from filename:', error);
    return null;
  }
}
