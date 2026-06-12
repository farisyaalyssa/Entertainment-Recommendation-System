const {
  parsePage,
  parseRating,
  normalizeType,
  getPrimaryGenre,
  mapSearchItem,
  resolveGenreId,
  buildDiscoverParams,
  applyResultFilters,
} = require('../../utils/searchUtils');

describe('searchUtils', () => {
  it('normalizes page numbers', () => {
    expect(parsePage('3')).toBe(3);
    expect(parsePage('0')).toBe(1);
    expect(parsePage(undefined)).toBe(1);
  });

  it('normalizes media types', () => {
    expect(normalizeType('Movie')).toBe('movie');
    expect(normalizeType('TV Show')).toBe('tv');
    expect(normalizeType('')).toBe('all');
  });

  it('parses minimum ratings', () => {
    expect(parseRating('8')).toBe(8);
    expect(parseRating('')).toBeNull();
    expect(parseRating('abc')).toBeNull();
  });

  it('maps TMDB search items', () => {
    const mapped = mapSearchItem(
      {
        id: 550,
        title: 'Fight Club',
        media_type: 'movie',
        overview: 'Test overview',
        release_date: '1999-10-15',
        vote_average: 8.4,
        genre_ids: [18],
        poster_path: '/abc.jpg',
      },
      { 18: 'Drama' }
    );

    expect(mapped.tmdbId).toBe(550);
    expect(mapped.mediaType).toBe('movie');
    expect(mapped.genre).toBe('Drama');
    expect(mapped.poster).toContain('/abc.jpg');
  });

  it('resolves genre ids by name or number', () => {
    const genreData = {
      byId: { 18: 'Drama' },
      byName: { drama: 18 },
    };

    expect(resolveGenreId('Drama', genreData)).toBe(18);
    expect(resolveGenreId('18', genreData)).toBe(18);
    expect(resolveGenreId('Unknown', genreData)).toBeNull();
  });

  it('builds discover params with optional filters', () => {
    const params = buildDiscoverParams('test-key', 2, 18, 7);

    expect(params.api_key).toBe('test-key');
    expect(params.page).toBe(2);
    expect(params.with_genres).toBe(18);
    expect(params['vote_average.gte']).toBe(7);
  });

  it('filters search results by type, genre, and rating', () => {
    const results = [
      { mediaType: 'movie', genreIds: [18], rating: 8.5 },
      { mediaType: 'tv', genreIds: [18], rating: 8.5 },
      { mediaType: 'movie', genreIds: [28], rating: 6.5 },
    ];

    const filtered = applyResultFilters(results, 'movie', 18, 7);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].mediaType).toBe('movie');
  });

  it('returns the first known genre name', () => {
    expect(getPrimaryGenre([99, 18], { 18: 'Drama' })).toBe('Drama');
    expect(getPrimaryGenre([], {})).toBe('');
  });
});
