var currentPage = 1;
var totalPages = 1;

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getDisplayType(mediaType) {
  return mediaType === 'tv' ? 'TV Show' : 'Movie';
}

function getFilterValues() {
  return {
    query: document.getElementById('searchInput').value.trim(),
    type: document.getElementById('type').value,
    genre: document.getElementById('genre').value,
    rating: document.getElementById('rating').value
  };
}

function buildSearchUrl(page) {
  var filters = getFilterValues();
  var params = ['page=' + page];

  if (filters.query) params.push('q=' + encodeURIComponent(filters.query));
  if (filters.type) params.push('type=' + encodeURIComponent(filters.type));
  if (filters.genre) params.push('genre=' + encodeURIComponent(filters.genre));
  if (filters.rating) params.push('rating=' + encodeURIComponent(filters.rating));

  return '/api/search?' + params.join('&');
}

function updateResultsMeta(data) {
  var meta = document.getElementById('results-meta');
  var filters = getFilterValues();
  var label = filters.query
    ? 'results for "' + filters.query + '"'
    : 'popular titles';

  meta.textContent =
    data.totalResults + ' ' + label +
    ' · page ' + data.page + ' of ' + data.totalPages;
}

function showLoadingState() {
  document.getElementById('results').innerHTML = '<p class="no-results">Loading...</p>';
  document.getElementById('pagination').innerHTML = '';
}

function showEmptyState(message) {
  document.getElementById('results-meta').textContent = '';
  document.getElementById('results').innerHTML =
    '<p class="no-results">' + (message || 'No results found.') + '</p>';
  document.getElementById('pagination').innerHTML = '';
}

function display(list) {
  var results = document.getElementById('results');
  results.innerHTML = '';

  if (!list.length) {
    showEmptyState('No results found. Try a different search or filter.');
    return;
  }

  list.forEach(function(item) {
    var contentType = item.mediaType === 'tv' ? 'tv' : 'movie';
    var displayType = getDisplayType(item.mediaType);
    var poster = item.poster || 'https://via.placeholder.com/200x300/1a2d47/F63049?text=No+Poster';
    var ratingText = item.rating ? item.rating.toFixed(1) : 'N/A';
    var detailUrl = 'content-detail.html?id=' + item.tmdbId + '&type=' + contentType;

    var div = document.createElement('div');
    div.className = 'card search-card';

    div.innerHTML =
      '<img class="poster" src="' + poster + '" alt="' + escapeHtml(item.title) + '" ' +
      'onclick="window.location.href=\'' + detailUrl + '\'" style="cursor:pointer;">' +
      '<div class="card-content">' +
      '<div class="search-card-header">' +
      '<div>' +
      '<h3 onclick="window.location.href=\'' + detailUrl + '\'" style="cursor:pointer;">' + escapeHtml(item.title) + '</h3>' +
      '<span class="search-type-tag">' + displayType + '</span>' +
      '</div>' +
      '<span class="search-rating-badge">★ ' + ratingText + '</span>' +
      '</div>' +
      (item.genre ? '<p class="search-genre">' + escapeHtml(item.genre) + '</p>' : '') +
      (item.releaseDate ? '<p class="search-release">' + escapeHtml(item.releaseDate) + '</p>' : '') +
      (item.overview ? '<p class="search-overview">' + escapeHtml(item.overview.substring(0, 160)) + (item.overview.length > 160 ? '...' : '') + '</p>' : '') +
      '<div class="search-actions">' +
      '<button class="btn-details" onclick="window.location.href=\'' + detailUrl + '\'">View Details</button>' +
      '</div>' +
      '</div>';

    results.appendChild(div);
  });
}

function renderPagination(page, pages) {
  var container = document.getElementById('pagination');
  container.innerHTML = '';

  if (pages <= 1) return;

  var prevBtn = document.createElement('button');
  prevBtn.className = 'page-btn';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = page <= 1;
  prevBtn.onclick = function() {
    fetchResults(page - 1);
  };

  var info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = 'Page ' + page + ' of ' + pages;

  var nextBtn = document.createElement('button');
  nextBtn.className = 'page-btn';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = page >= pages;
  nextBtn.onclick = function() {
    fetchResults(page + 1);
  };

  container.appendChild(prevBtn);
  container.appendChild(info);
  container.appendChild(nextBtn);
}

function fetchResults(page) {
  currentPage = page || 1;
  showLoadingState();

  apiPublic(buildSearchUrl(currentPage))
    .then(function(data) {
      totalPages = data.totalPages || 1;
      currentPage = data.page || currentPage;
      updateResultsMeta(data);
      display(data.results || []);
      renderPagination(currentPage, totalPages);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(function(err) {
      showEmptyState(err.message || 'Search failed. Make sure the backend is running.');
    });
}

function search() {
  fetchResults(1);
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('type').value = '';
  document.getElementById('genre').value = '';
  document.getElementById('rating').value = '';
  fetchResults(1);
}

function loadGenres() {
  apiPublic('/api/search/genres')
    .then(function(data) {
      var select = document.getElementById('genre');
      var current = select.value;

      select.innerHTML = '<option value="">All Genres</option>';

      (data.genres || []).forEach(function(genre) {
        var option = document.createElement('option');
        option.value = genre.name;
        option.textContent = genre.name;
        select.appendChild(option);
      });

      if (current) select.value = current;
    })
    .catch(function(err) {
      console.error('Failed to load genres:', err.message);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  loadGenres();

  var searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        search();
      }
    });
  }

  ['type', 'genre', 'rating'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', function() {
        fetchResults(1);
      });
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');

  if (query) {
    document.getElementById('searchInput').value = query;
  }

  fetchResults(1);
});
