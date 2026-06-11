const express = require('express');
const axios = require('axios');

const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';

var genreCache = null;

function getApiKey() {
  return process.env.TMDB_API_KEY;
}

function parsePage(value) {
  var page = parseInt(value, 10);
  return page > 0 ? page : 1;
}

function parseRating(value) {
  if (!value) return null;
  var rating = Number(value);
  return Number.isFinite(rating) ? rating : null;
}

function normalizeType(value) {
  if (!value) return 'all';
  var lower = String(value).toLowerCase();
  if (lower === 'movie' || lower === 'movies') return 'movie';
  if (lower === 'tv' || lower === 'tv show' || lower === 'tv shows') return 'tv';
  return 'all';
}

function getPrimaryGenre(genreIds, genreMap) {
  if (!genreIds || !genreIds.length) return '';

  for (var i = 0; i < genreIds.length; i++) {
    if (genreMap[genreIds[i]]) {
      return genreMap[genreIds[i]];
    }
  }

  return '';
}

function mapSearchItem(item, genreMap) {
  var genreIds = item.genre_ids || [];

  return {
    tmdbId: item.id,
    title: item.title || item.name,
    mediaType: item.media_type,
    overview: item.overview,
    releaseDate: item.release_date || item.first_air_date,
    rating: item.vote_average,
    popularity: item.popularity || 0,
    genreIds: genreIds,
    genre: getPrimaryGenre(genreIds, genreMap),
    poster: item.poster_path
      ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
      : null,
  };
}

function mapDiscoverItem(item, mediaType, genreMap) {
  var genreIds = item.genre_ids || [];

  return {
    tmdbId: item.id,
    title: item.title || item.name,
    mediaType: mediaType,
    overview: item.overview,
    releaseDate: item.release_date || item.first_air_date,
    rating: item.vote_average,
    popularity: item.popularity || 0,
    genreIds: genreIds,
    genre: getPrimaryGenre(genreIds, genreMap),
    poster: item.poster_path
      ? 'https://image.tmdb.org/t/p/w500' + item.poster_path
      : null,
  };
}

async function loadGenres(apiKey) {
  if (genreCache) return genreCache;

  var movieRes = await axios.get(TMDB_BASE + '/genre/movie/list', {
    params: { api_key: apiKey },
  });
  var tvRes = await axios.get(TMDB_BASE + '/genre/tv/list', {
    params: { api_key: apiKey },
  });

  var byId = {};
  var byName = {};
  var list = [];

  movieRes.data.genres.concat(tvRes.data.genres).forEach(function(genre) {
    if (!byId[genre.id]) {
      byId[genre.id] = genre.name;
      byName[genre.name.toLowerCase()] = genre.id;
      list.push({ id: genre.id, name: genre.name });
    }
  });

  list.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });

  genreCache = { byId: byId, byName: byName, list: list };
  return genreCache;
}

function resolveGenreId(genreValue, genreData) {
  if (!genreValue) return null;

  var asNumber = Number(genreValue);
  if (Number.isFinite(asNumber) && genreData.byId[asNumber]) {
    return asNumber;
  }

  return genreData.byName[String(genreValue).toLowerCase()] || null;
}

function buildDiscoverParams(apiKey, page, genreId, minRating) {
  var params = {
    api_key: apiKey,
    language: 'en-US',
    page: page,
    sort_by: 'popularity.desc',
    include_adult: false,
  };

  if (genreId) params.with_genres = genreId;
  if (minRating) params['vote_average.gte'] = minRating;

  return params;
}

async function fetchDiscover(apiKey, mediaType, page, genreId, minRating, genreMap) {
  var endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
  var response = await axios.get(TMDB_BASE + endpoint, {
    params: buildDiscoverParams(apiKey, page, genreId, minRating),
  });

  return {
    results: response.data.results.map(function(item) {
      return mapDiscoverItem(item, mediaType, genreMap);
    }),
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
  };
}

async function fetchTrending(apiKey, page, genreMap) {
  var response = await axios.get(TMDB_BASE + '/trending/all/day', {
    params: {
      api_key: apiKey,
      language: 'en-US',
      page: page,
    },
  });

  return {
    results: response.data.results
      .filter(function(item) {
        return item.media_type === 'movie' || item.media_type === 'tv';
      })
      .map(function(item) {
        return mapSearchItem(item, genreMap);
      }),
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
  };
}

async function fetchBrowseResults(apiKey, type, page, genreId, minRating, genreMap) {
  if (type === 'movie') {
    return fetchDiscover(apiKey, 'movie', page, genreId, minRating, genreMap);
  }

  if (type === 'tv') {
    return fetchDiscover(apiKey, 'tv', page, genreId, minRating, genreMap);
  }

  if (genreId || minRating) {
    var movieData = await fetchDiscover(apiKey, 'movie', page, genreId, minRating, genreMap);
    var tvData = await fetchDiscover(apiKey, 'tv', page, genreId, minRating, genreMap);
    var combined = movieData.results.concat(tvData.results);

    combined.sort(function(a, b) {
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return {
      results: combined,
      page: page,
      totalPages: Math.max(movieData.totalPages, tvData.totalPages),
      totalResults: movieData.totalResults + tvData.totalResults,
    };
  }

  return fetchTrending(apiKey, page, genreMap);
}

function applyResultFilters(results, type, genreId, minRating) {
  return results.filter(function(item) {
    if (type === 'movie' && item.mediaType !== 'movie') return false;
    if (type === 'tv' && item.mediaType !== 'tv') return false;
    if (genreId && (!item.genreIds || item.genreIds.indexOf(genreId) === -1)) return false;
    if (minRating && (item.rating || 0) < minRating) return false;
    return true;
  });
}

router.get('/genres', async (req, res) => {
  try {
    var apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'TMDB API key is not configured on the server',
      });
    }

    var genreData = await loadGenres(apiKey);

    return res.json({
      success: true,
      genres: genreData.list,
    });
  } catch (error) {
    console.error('TMDB genre list error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load genres from TMDB',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    var apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'TMDB API key is not configured on the server',
      });
    }

    var query = req.query.q ? req.query.q.trim() : '';
    var page = parsePage(req.query.page);
    var type = normalizeType(req.query.type);
    var minRating = parseRating(req.query.rating);
    var genreData = await loadGenres(apiKey);
    var genreId = resolveGenreId(req.query.genre, genreData);
    var payload;

    if (query) {
      var searchRes = await axios.get(TMDB_BASE + '/search/multi', {
        params: {
          api_key: apiKey,
          query: query,
          language: 'en-US',
          page: page,
          include_adult: false,
        },
      });

      var searchResults = searchRes.data.results
        .filter(function(item) {
          return item.media_type === 'movie' || item.media_type === 'tv';
        })
        .map(function(item) {
          return mapSearchItem(item, genreData.byId);
        });

      payload = {
        results: applyResultFilters(searchResults, type, genreId, minRating),
        page: searchRes.data.page,
        totalPages: searchRes.data.total_pages,
        totalResults: searchRes.data.total_results,
        mode: 'search',
      };
    } else {
      var browseData = await fetchBrowseResults(apiKey, type, page, genreId, minRating, genreData.byId);
      payload = {
        results: browseData.results,
        page: browseData.page,
        totalPages: browseData.totalPages,
        totalResults: browseData.totalResults,
        mode: 'browse',
      };
    }

    return res.json({
      success: true,
      query: query,
      page: payload.page,
      totalPages: payload.totalPages,
      totalResults: payload.totalResults,
      mode: payload.mode,
      count: payload.results.length,
      results: payload.results,
    });
  } catch (error) {
    console.error('TMDB search error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve search results from TMDB',
    });
  }
});

module.exports = router;
