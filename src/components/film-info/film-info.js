import React, { Component } from 'react';
import Rating from '../Rate';

import './film-info.css';

import { GenresConsumer } from '../genres-context/genres-context';
import TmdbService from '../../services';
import { format } from 'date-fns';

export default class FilmInfo extends Component {
  id = 100;

  tmdbService = new TmdbService();

  rateFilm = (value) => {
    const { id, sessionId } = this.props;
    localStorage.setItem(id, value);
    this.tmdbService.rateFilm(id, value, sessionId);
  };

  makeGenresList = (arr) => {
    return arr.map((item) => {
      return (
        <span key={this.id++} className='genres-box'>
          {item}
        </span>
      );
    });
  };

  formatTime = (date) => {
    if (date.length !== 0) {
      return format(new Date(date), 'MMM dd, yyyy');
    } else {
      return null;
    }
  };

  render() {
    const { id, name, description, posterPath, vote_average, genresId, date } =
      this.props;

    let voteClassName = 'vote-average';
    if (vote_average >= 0 && vote_average <= 3) {
      voteClassName += ' low';
    }
    if (vote_average > 3 && vote_average <= 5) {
      voteClassName += ' low-middle';
    }
    if (vote_average > 5 && vote_average <= 7) {
      voteClassName += ' middle';
    }
    if (vote_average > 7) {
      voteClassName += ' high';
    }

    let ratingStars = 'rating';

    if (vote_average === 0) {
      ratingStars += ' display-none';
    }

    let poster = (
      <img
        alt='movie'
        className='movie'
        src={`https://image.tmdb.org/t/p/w500/${posterPath}`}
      />
    );

    if (!posterPath) {
      poster = <div className='no-poster'>Обложка не найдена</div>;
    }

    return (
      <div key={id} className='wrapper'>
        {poster}
        <div className='main-info'>
          <div className='header-info'>
            <h5 className='header'>{name}</h5>
            <div className={voteClassName}>{vote_average}</div>
          </div>
          <div className='date'>{this.formatTime(date)}</div>
          <GenresConsumer>
            {(genres) => {
              let arr = [];
              genresId.forEach((itemId) => {
                genres.forEach((item) => {
                  if (item.id === itemId) {
                    arr.push(item.name);
                  }
                });
              });
              const elements = this.makeGenresList(arr);
              return <div className='genres'>{elements}</div>;
            }}
          </GenresConsumer>
          <div className='description'>{description}</div>
          <div className={ratingStars}>
            <Rating id={id} rateFilm={this.rateFilm} />
          </div>
        </div>
      </div>
    );
  }
}
