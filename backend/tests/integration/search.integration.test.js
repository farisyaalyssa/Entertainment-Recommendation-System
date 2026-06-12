jest.mock('axios');

const axios = require('axios');
const request = require('supertest');
const createApp = require('../../app');

const app = createApp();

describe('Search API integration', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/genre/movie/list') || url.includes('/genre/tv/list')) {
        return Promise.resolve({
          data: {
            genres: [{ id: 18, name: 'Drama' }],
          },
        });
      }

      if (url.includes('/search/multi')) {
        return Promise.resolve({
          data: {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
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
            ],
          },
        });
      }

      if (url.includes('/trending/all/day')) {
        return Promise.resolve({
          data: {
            page: 1,
            total_pages: 1,
            total_results: 1,
            results: [
              {
                id: 1396,
                name: 'Breaking Bad',
                media_type: 'tv',
                overview: 'Test show',
                first_air_date: '2008-01-20',
                vote_average: 9.0,
                genre_ids: [18],
                poster_path: '/bb.jpg',
              },
            ],
          },
        });
      }

      return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
  });

  it('returns browse results when no query is provided', async () => {
    const res = await request(app).get('/api/search');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe('browse');
    expect(res.body.results.length).toBeGreaterThan(0);
  });

  it('returns search results for a keyword query', async () => {
    const res = await request(app).get('/api/search?q=fight');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe('search');
    expect(res.body.results[0].title).toBe('Fight Club');
  });

  it('returns available genres', async () => {
    const res = await request(app).get('/api/search/genres');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.genres).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Drama' })])
    );
  });
});
