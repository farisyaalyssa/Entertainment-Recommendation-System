// ── DATA ──────────────────────────────────────
// tmdbId is used to navigate to content-detail.html
const data = [
  {
    id: 1,
    tmdbId: 557,
    type: "Movie",
    title: "Spider-Man: Homecoming",
    genre: "Action",
    rating: 8,
    poster: "https://upload.wikimedia.org/wikipedia/en/f/f9/Spider-Man_Homecoming_poster.jpg"
  },
  {
    id: 2,
    tmdbId: 11036,
    type: "Movie",
    title: "The Notebook",
    genre: "Romance",
    rating: 7,
    poster: "https://upload.wikimedia.org/wikipedia/en/8/86/Posternotebook.jpg"
  },
  {
    id: 3,
    tmdbId: 1668,
    type: "TV Show",
    title: "Friends",
    genre: "Comedy",
    rating: 9,
    poster: "https://upload.wikimedia.org/wikipedia/en/d/d6/Friends_season_one_cast.jpg"
  },
  {
    id: 4,
    tmdbId: 27205,
    type: "Movie",
    title: "Inception",
    genre: "Sci-Fi",
    rating: 9,
    poster: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
  },
  {
    id: 5,
    tmdbId: 157336,
    type: "Movie",
    title: "Interstellar",
    genre: "Sci-Fi",
    rating: 9,
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
  },
  {
    id: 6,
    tmdbId: 155,
    type: "Movie",
    title: "The Dark Knight",
    genre: "Action",
    rating: 9,
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
  },
  {
    id: 7,
    tmdbId: 438631,
    type: "Movie",
    title: "Dune",
    genre: "Sci-Fi",
    rating: 8,
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklpcvkC173QCnEh3w0VBgX.jpg"
  }
];

// ── SEARCH FUNCTION ────────────────────────────
function search() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const type = document.getElementById("type").value;
  const genre = document.getElementById("genre").value;
  const rating = document.getElementById("rating").value;

  const filtered = data.filter(item =>
    item.title.toLowerCase().includes(text) &&
    (type === "" || item.type === type) &&
    (genre === "" || item.genre === genre) &&
    (rating === "" || item.rating >= Number(rating))
  );

  // show results count
  const meta = document.getElementById("results-meta");
  if (text || type || genre || rating) {
    meta.textContent = filtered.length + " result" + (filtered.length !== 1 ? "s" : "") + " found";
  } else {
    meta.textContent = "";
  }

  display(filtered);
}

// ── CLEAR FILTERS ──────────────────────────────
function clearFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("type").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("rating").value = "";
  document.getElementById("results-meta").textContent = "";
  display(data);
}

// ── DISPLAY RESULTS ────────────────────────────
function display(list) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (list.length === 0) {
    results.innerHTML = '<p class="no-results">No results found. Try a different search.</p>';
    return;
  }

  list.forEach(item => {
    const avg = getAverage(item.id);

    // determine content type for TMDB URL
    const contentType = item.type === "TV Show" ? "tv" : "movie";

    const div = document.createElement("div");
    div.className = "card search-card";

    div.innerHTML = `
      <img
        class="poster"
        src="${item.poster}"
        alt="${item.title}"
        onclick="window.location.href='content-detail.html?id=${item.tmdbId}&type=${contentType}'"
        style="cursor:pointer;"
      >
      <div class="card-content">
        <div class="search-card-header">
          <div>
            <h3 onclick="window.location.href='content-detail.html?id=${item.tmdbId}&type=${contentType}'" style="cursor:pointer;">${item.title}</h3>
            <span class="search-type-tag">${item.type}</span>
          </div>
          <span class="search-rating-badge">★ ${item.rating}</span>
        </div>

        <p class="search-genre">${item.genre}</p>
        <p><strong style="color:#aaa; font-size:12px;">Avg User Rating:</strong> <span style="color:#F63049; font-size:12px;">${avg}</span></p>

        <!-- Rate -->
        <div class="search-actions">
          <select id="rate-${item.id}">
  <option value="10">10★</option>
  <option value="9">9★</option>
  <option value="8">8★</option>
  <option value="7">7★</option>
  <option value="6">6★</option>
  <option value="5">5★</option>
  <option value="4">4★</option>
  <option value="3">3★</option>
  <option value="2">2★</option>
  <option value="1">1★</option>
</select>
          <button onclick="addRating(${item.id})">Rate</button>
          <button class="btn-details" onclick="window.location.href='content-detail.html?id=${item.tmdbId}&type=${contentType}'">View Details</button>
        </div>

        <!-- Review -->
        <textarea id="review-${item.id}" placeholder="Write your review..."></textarea>
        <button onclick="addReview(${item.id})">Submit Review</button>

        <!-- Existing reviews -->
        <div class="existing-reviews">
          ${getReviews(item.id).map(r => `<p class="existing-review">${r}</p>`).join("")}
        </div>
      </div>
    `;

    results.appendChild(div);
  });
}

// ── ADD RATING ─────────────────────────────────
function addRating(id) {
  const val = Number(document.getElementById(`rate-${id}`).value);
  let ratings = JSON.parse(localStorage.getItem(`ratings-${id}`)) || [];
  ratings.push(val);
  localStorage.setItem(`ratings-${id}`, JSON.stringify(ratings));
  search();
}

// ── GET AVERAGE RATING ─────────────────────────
function getAverage(id) {
  let ratings = JSON.parse(localStorage.getItem(`ratings-${id}`)) || [];
  if (ratings.length === 0) return "No ratings yet";
  let avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return avg.toFixed(1) + " / 5";
}

// ── ADD REVIEW ─────────────────────────────────
function addReview(id) {
  const text = document.getElementById(`review-${id}`).value;
  if (!text) {
    alert("Write something first");
    return;
  }
  let reviews = JSON.parse(localStorage.getItem(`reviews-${id}`)) || [];
  reviews.push(text);
  localStorage.setItem(`reviews-${id}`, JSON.stringify(reviews));
  search();
}

// ── GET REVIEWS ────────────────────────────────
function getReviews(id) {
  return JSON.parse(localStorage.getItem(`reviews-${id}`)) || [];
}

// ── ON PAGE LOAD ───────────────────────────────
window.onload = function() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (query) {
    document.getElementById('searchInput').value = query;
    search();
  } else {
    display(data);
  }
}