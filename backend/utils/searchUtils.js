function parsePage(value) {
  const page = parseInt(value, 10);
  return page > 0 ? page : 1;
}

function parseRating(value) {
  if (!value) return null;
  const rating = Number(value);
  return Number.isFinite(rating) ? rating : null;
}

function normalizeType(value) {
  if (!value) return 'all';
  const lower = String(value).toLowerCase();
  if (lower === 'movie' || lower === 'movies') return 'movie';
  if (lower === 'tv' || lower === 'tv show' || lower === 'tv shows') return 'tv';
  return 'all';
}

function getPrimaryGenre(genreIds, genreMap) {
  if (!genreIds || !genreIds.length) return '';

  for (let i = 0; i < genreIds.length; i += 1) {
    if (genreMap[genreIds[i]]) {
      return genreMap[genreIds[i]];
    }
  }

  return '';
}

function mapSearchItem(item, genreMap) {
  const genreIds = item.genre_ids || [];

  return {
    tmdbId: item.id,
    title: item.title || item.name,
    mediaType: item.media_type,
    overview: item.overview,
    releaseDate: item.release_date || item.first_air_date,
    rating: item.vote_average,
    popularity: item.popularity || 0,
    genreIds,
    genre: getPrimaryGenre(genreIds, genreMap),
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
  };
}

function mapDiscoverItem(item, mediaType, genreMap) {
  const genreIds = item.genre_ids || [];

  return {
    tmdbId: item.id,
    title: item.title || item.name,
    mediaType,
    overview: item.overview,
    releaseDate: item.release_date || item.first_air_date,
    rating: item.vote_average,
    popularity: item.popularity || 0,
    genreIds,
    genre: getPrimaryGenre(genreIds, genreMap),
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
  };
}

function resolveGenreId(genreValue, genreData) {
  if (!genreValue) return null;

  const asNumber = Number(genreValue);
  if (Number.isFinite(asNumber) && genreData.byId[asNumber]) {
    return asNumber;
  }

  return genreData.byName[String(genreValue).toLowerCase()] || null;
}

function buildDiscoverParams(apiKey, page, genreId, minRating) {
  const params = {
    api_key: apiKey,
    language: 'en-US',
    page,
    sort_by: 'popularity.desc',
    include_adult: false,
  };

  if (genreId) params.with_genres = genreId;
  if (minRating) params['vote_average.gte'] = minRating;

  return params;
}

function applyResultFilters(results, type, genreId, minRating) {
  return results.filter((item) => {
    if (type === 'movie' && item.mediaType !== 'movie') return false;
    if (type === 'tv' && item.mediaType !== 'tv') return false;
    if (genreId && (!item.genreIds || item.genreIds.indexOf(genreId) === -1)) return false;
    if (minRating && (item.rating || 0) < minRating) return false;
    return true;
  });
}

function normalizeContentType(value) {
  const lower = String(value || '').toLowerCase();
  if (lower === 'movie' || lower === 'movies') return 'movie';
  if (lower === 'tv' || lower === 'tvshow' || lower === 'tvshows') return 'tv';
  return null;
}

function mapContentDetail(data, mediaType) {
  const title = data.title || data.name || '';
  const date = data.release_date || data.first_air_date || '';
  let runtime = '';

  if (data.runtime) {
    runtime = data.runtime + ' min';
  } else if (data.episode_run_time && data.episode_run_time.length) {
    runtime = data.episode_run_time[0] + ' min/ep';
  }

  return {
    tmdbId: data.id,
    type: mediaType,
    title,
    year: date ? date.substring(0, 4) : '',
    rating: data.vote_average ? Number(data.vote_average.toFixed(1)) : null,
    runtime,
    overview: data.overview || 'No description available.',
    poster: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null,
    backdrop: data.backdrop_path
      ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
      : null,
    genres: (data.genres || []).map((genre) => genre.name),
  };
}

module.exports = {
  parsePage,
  parseRating,
  normalizeType,
  getPrimaryGenre,
  mapSearchItem,
  mapDiscoverItem,
  resolveGenreId,
  buildDiscoverParams,
  applyResultFilters,
  normalizeContentType,
  mapContentDetail,
};
