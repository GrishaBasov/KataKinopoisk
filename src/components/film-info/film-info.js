import React, { Component } from 'react';
import Rating from '../Rate';

import './film-info.css';

import { format } from 'date-fns';
import SwapiService from '../../services';
import { GenresConsumer } from '../genres-context/genres-context';

export default class FilmInfo extends Component {
  id = 100;

  swapiService = new SwapiService();

  rateFilm = (value) => {
    const { id, sessionId } = this.props;
    localStorage.setItem(id, value);
    this.swapiService.rateFilm(id, value, sessionId);
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

  render() {
    const { id, name, date, description, posterPath, vote_average, genresId } =
      this.props;

    let voteClassName = 'vote-average';
    if (vote_average > 0 && vote_average < 3) {
      voteClassName += ' low';
    }
    if (vote_average > 3 && vote_average < 5) {
      voteClassName += ' low-middle';
    }
    if (vote_average > 5 && vote_average < 7) {
      voteClassName += ' middle';
    }
    if (vote_average > 7) {
      voteClassName += ' high';
    }

    return (
      <div key={id} className='wrapper'>
        <img
          alt='movie'
          className='movie'
          src={`https://image.tmdb.org/t/p/w500/${posterPath}`}
        />

        <div className='main-info'>
          <div className='header-info'>
            <h5 className='header'>{name}</h5>
            <div className={voteClassName}>{vote_average}</div>
          </div>
          <div className='date'>{format(new Date(date), 'MMM dd, yyyy')}</div>
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
          <div className='rating'>
            <Rating id={id} rateFilm={this.rateFilm} />
          </div>
        </div>
      </div>
    );
  }
}
