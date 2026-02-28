const API_BASE = 'https://www.omdbapi.com';

const getApiKey = () => (import.meta.env.VITE_OMDB_API_KEY || '').trim();

/** OMDB returns full image URLs; return as-is. */
export function imageUrl(path) {
  return path && path.startsWith('http') ? path : null;
}

export function backdropUrl(path) {
  return imageUrl(path);
}

export function posterUrl(path) {
  return imageUrl(path);
}

async function fetchOmdb(params = {}) {
  const key = getApiKey();
  const url = new URL(API_BASE);
  url.searchParams.set('apikey', key);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString());
  const data = await res.json().catch(() => ({}));

  if (data.Response === 'False') {
    const msg = data.Error === 'Invalid API key!'
      ? 'Invalid or missing OMDB API key. Set VITE_OMDB_API_KEY in .env.'
      : (data.Error || `OMDB API error: ${res.status}`);
    throw new Error(msg);
  }
  return data;
}

/** Normalize OMDB search item to app shape. */
function toMovie(item, plot = '') {
  return {
    id: item.imdbID,
    title: item.Title,
    overview: plot,
    poster_path: item.Poster,
    backdrop_path: item.Poster,
    year: item.Year,
  };
}

/** Fetch one movie by IMDB ID (full details). */
export async function fetchMovieById(imdbId) {
  const data = await fetchOmdb({ i: imdbId });
  return toMovie(data, data.Plot || '');
}

/** Search movies; returns array of normalized movies. */
export async function searchMovies(query, page = 1) {
  const data = await fetchOmdb({ s: query, type: 'movie', page });
  const list = data.Search || [];
  return list.map((item) => toMovie(item));
}

/** Fetch hero movie and rows for Netflix-style UI. */
export async function fetchNetflixRows() {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('VITE_OMDB_API_KEY is not set in .env');

  const heroId = 'tt3896198';
  const searches = [
    { title: 'Action', query: 'action' },
    { title: 'Comedy', query: 'comedy' },
    { title: 'Drama', query: 'drama' },
    { title: 'Superhero', query: 'superhero' },
  ];

  const [heroData, ...rowResults] = await Promise.all([
    fetchMovieById(heroId),
    ...searches.map(({ query }) => searchMovies(query, 1)),
  ]);

  const rows = searches.map(({ title }, i) => ({
    title,
    movies: rowResults[i] || [],
  }));

  return {
    heroMovie: heroData,
    rows,
  };
}
