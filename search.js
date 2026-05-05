// DATA
const data = [
  {
    id: 1,
    title: "Spider-Man: Homecoming",
    genre: "Action",
    rating: 8,
    poster: "https://upload.wikimedia.org/wikipedia/en/f/f9/Spider-Man_Homecoming_poster.jpg"
  },
  {
    id: 2,
    title: "The Notebook",
    genre: "Romance",
    rating: 7,
    poster: "https://upload.wikimedia.org/wikipedia/en/8/86/Posternotebook.jpg"
  },
  {
    id: 3,
    title: "Friends",
    genre: "Comedy",
    rating: 9,
    poster: "https://upload.wikimedia.org/wikipedia/en/d/d6/Friends_season_one_cast.jpg"
  }
];

// SEARCH FUNCTION
function search() {
  const text = document.getElementById("searchInput").value.toLowerCase();
  const genre = document.getElementById("genre").value;
  const rating = document.getElementById("rating").value;

  const filtered = data.filter(item =>
    item.title.toLowerCase().includes(text) &&
    (genre === "" || item.genre === genre) &&
    (rating === "" || item.rating >= Number(rating))
  );

  display(filtered);
}

// DISPLAY RESULTS
function display(list) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (list.length === 0) {
    results.innerHTML = "<p>No results found</p>";
    return;
  }

  list.forEach(item => {
    const reviews = getReviews(item.id);
    const avg = getAverage(item.id);

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img class="poster" src="${item.poster}" alt="${item.title}">
      <div class="card-content">
        <h3>${item.title}</h3>
        <p>${item.genre} | Rating: ${item.rating}</p>
        <p><strong>Average User Rating:</strong> ${avg}</p>
        <select id="rate-${item.id}">
          <option value="5">5★</option>
          <option value="4">4★</option>
          <option value="3">3★</option>
          <option value="2">2★</option>
          <option value="1">1★</option>
        </select>
        <button onclick="addRating(${item.id})">Rate</button>
        <br><br>
        <textarea id="review-${item.id}" placeholder="Write your review..."></textarea>
        <button onclick="addReview(${item.id})">Submit Review</button>
        <div>
          ${reviews.map(r => `<p>${r}</p>`).join("")}
        </div>
      </div>
    `;

    results.appendChild(div);
  });
}

// ADD RATING
function addRating(id) {
  const val = Number(document.getElementById(`rate-${id}`).value);
  let ratings = JSON.parse(localStorage.getItem(`ratings-${id}`)) || [];
  ratings.push(val);
  localStorage.setItem(`ratings-${id}`, JSON.stringify(ratings));
  search();
}

// GET AVERAGE RATING
function getAverage(id) {
  let ratings = JSON.parse(localStorage.getItem(`ratings-${id}`)) || [];
  if (ratings.length === 0) return "No ratings yet";
  let avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  return avg.toFixed(1) + " / 5";
}

// ADD REVIEW
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

// GET REVIEWS
function getReviews(id) {
  return JSON.parse(localStorage.getItem(`reviews-${id}`)) || [];
}

// if coming from navbar search, pre-fill and auto search
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