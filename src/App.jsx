import { useState, useEffect } from 'react';
import { useNetflixData } from './hooks/useNetflixData';
import { backdropUrl, posterUrl } from './api/omdb';

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#" className="nav-logo">NETFLIX</a>
      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#">TV Shows</a>
        <a href="#">Movies</a>
        <a href="#">New & Popular</a>
        <a href="#">My List</a>
      </div>
    </nav>
  );
}

function Hero({ movie }) {
  if (!movie) return null;
  const backdrop = backdropUrl(movie.backdrop_path);
  return (
    <section className="hero">
      <div className="hero-backdrop">
        {backdrop && <img src={backdrop} alt="" />}
      </div>
      <div className="hero-content">
        <h1 className="hero-title">{movie.title}</h1>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-actions">
          <button type="button" className="btn btn-primary">▶ Play</button>
          <button type="button" className="btn btn-secondary">ℹ More Info</button>
        </div>
      </div>
    </section>
  );
}

function MovieCard({ movie }) {
  const poster = posterUrl(movie.poster_path);
  return (
    <div className="movie-card">
      {poster ? (
        <img src={poster} alt={movie.title} loading="lazy" />
      ) : (
        <div className="placeholder">{movie.title}</div>
      )}
    </div>
  );
}

function Row({ title, movies }) {
  if (!movies?.length) return null;
  return (
    <div className="row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        <div className="row-inner">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LoadingHero() {
  return (
    <div className="loading-hero">
      <div className="loading-spinner" aria-hidden />
    </div>
  );
}

export default function App() {
  const { rows, heroMovie, loading, error } = useNetflixData();

  return (
    <>
      <Nav />
      {error && (
        <div className="error-banner" role="alert">
          {error}. Check that VITE_OMDB_API_KEY in .env is set to a valid OMDB API key.
        </div>
      )}
      {loading && <LoadingHero />}
      {!loading && heroMovie && <Hero movie={heroMovie} />}
      {!loading && rows.length > 0 && (
        <section className="rows-section">
          {rows.map((row) => (
            <Row key={row.title} title={row.title} movies={row.movies} />
          ))}
        </section>
      )}
    </>
  );
}
