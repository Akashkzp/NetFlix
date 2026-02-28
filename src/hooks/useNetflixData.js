import { useState, useEffect } from 'react';
import { fetchNetflixRows } from '../api/omdb';

export function useNetflixData() {
  const [rows, setRows] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchNetflixRows();
        if (cancelled) return;
        setRows(data.rows || []);
        setHeroMovie(data.heroMovie || null);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load from OMDB');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { rows, heroMovie, loading, error };
}
