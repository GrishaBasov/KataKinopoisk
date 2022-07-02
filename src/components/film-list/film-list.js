import './film-list.css';
import FilmInfo from '../film-info';
import React, { Component } from 'react';

export default class FilmList extends Component {
  makeFilmList = (data, sessionId) => {
    return data.map((item) => {
      const { id, ...itemProps } = item;
      return <FilmInfo sessionId={sessionId} key={id} id={id} {...itemProps} />;
    });
  };

  render() {
    const { data, sessionId, pagination } = this.props;

    const elements = this.makeFilmList(data, sessionId);

    if (elements.length === 0) {
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
