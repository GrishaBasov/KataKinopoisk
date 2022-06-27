export default class SwapiService {
  async getResource(searchInput) {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=3c514dc79b590afda05cd35907b9c661&language=en-US&query=${searchInput}&page=1&include_adult=false`
    );

    if (!res.ok) {
      throw new Error(`Could not fetch received ${res.status}`);
    }
    const dataObject = await res.json();
    return dataObject.results;
  }

  async createGuestSession() {
    const res = await fetch(
      'https://api.themoviedb.org/3/authentication/guest_session/new?api_key=3c514dc79b590afda05cd35907b9c661'
    );

    if (!res.ok) {
      throw new Error(`Could not fetch received ${res.status}`);
    }
    // eslint-disable-next-line no-return-await
    return await res.json();
  }

  async rateFilm(id, value, sessionId) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/rating?api_key=3c514dc79b590afda05cd35907b9c661&guest_session_id=${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          value,
        }),
      }
    );

    return await res.json();
  }

  async getRated(sessionId) {
    const res = await fetch(
      `
https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=3c514dc79b590afda05cd35907b9c661&language=en-US&sort_by=created_at.asc`
    );
    const dataObject = await res.json();
    return dataObject.results;
  }

  async getGenres() {
    const res = await fetch(
      'https://api.themoviedb.org/3/genre/movie/list?api_key=3c514dc79b590afda05cd35907b9c661&language=en-US'
    );
    const dataObject = await res.json();
    return dataObject.genres;
  }
}
