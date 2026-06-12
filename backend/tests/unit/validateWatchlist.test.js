const {
  validateAddWatchlistItem,
  validateRemoveWatchlistItem,
} = require('../../middleware/validateWatchlist');
const { runMiddleware } = require('../helpers/middleware');

describe('validateWatchlist middleware', () => {
  it('accepts valid watchlist items', async () => {
    const { req, next } = await runMiddleware(validateAddWatchlistItem, {
      body: {
        tmdbId: 550,
        type: 'movie',
        title: 'Fight Club',
        poster: '',
      },
    });

    expect(next).toHaveBeenCalled();
    expect(req.body.tmdbId).toBe(550);
  });

  it('rejects invalid watchlist types', async () => {
    const { res, next } = await runMiddleware(validateAddWatchlistItem, {
      body: {
        tmdbId: 550,
        type: 'book',
        title: 'Fight Club',
      },
    });

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it('accepts valid watchlist delete params', async () => {
    const { req, next } = await runMiddleware(validateRemoveWatchlistItem, {
      params: { tmdbId: '550' },
      query: { type: 'movie' },
    });

    expect(next).toHaveBeenCalled();
    expect(req.watchlistQuery).toEqual({ tmdbId: 550, type: 'movie' });
  });
});
