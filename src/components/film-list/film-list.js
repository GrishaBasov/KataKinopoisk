import './film-list.css';
import FilmInfo from '../film-info';
import React, { Component } from 'react';

export default class FilmList extends Component {
  makeFilmList = (data, minIndex, maxIndex, sessionId) => {
    return data.map((item, index) => {
      const { id, ...itemProps } = item;

      if (index >= minIndex && index < maxIndex) {
        return (
          <FilmInfo sessionId={sessionId} key={id} id={id} {...itemProps} />
        );
      }
      return null;
    });
  };

  render() {
    const { data, pagination, minIndex, maxIndex, sessionId } = this.props;

    const elements = this.makeFilmList(data, minIndex, maxIndex, sessionId);

    if (elements.length < 6) {
      return (
        <div className='film-list-pagination'>
          <div className='film-list'>{elements}</div>
        </div>
      );
    }

    return (
      <div className='film-list-pagination'>
        <div className='film-list'>{elements}</div>
        <div className='pagination'>{pagination}</div>
      </div>
    );
  }
}
