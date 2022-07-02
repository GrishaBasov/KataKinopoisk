import React, { Component } from 'react';
import FilmList from '../film-list';
import { GenresProvider } from '../genres-context/genres-context';
import './app.css';
import TmdbService from '../../services';
import Spinner from '../spinner';
import AlertMessage from '../error-alert';
import NoDataMessage from '../no-data-message';
import SearchField from '../search-field';
import { Pagination, Tabs } from 'antd';
import 'antd/dist/antd.min.css';

const { TabPane } = Tabs;

let page = '1';

export default class App extends Component {
  state = {
    data: [],
    genres: '',
    loading: true,
    error: false,
    noData: false,
    totalPages: 50,
    sessionId: null,
    filmTitle: 'Batman',
    current: 1,
    search: true,
  };

  tmdbService = new TmdbService();

  componentDidMount() {
    localStorage.clear();
    this.tmdbService.createGuestSession().then((res) => {
      this.setState({
        sessionId: res.guest_session_id,
      });
    });

    this.tmdbService.getGenres().then((res) => {
      this.setState({
        genres: res,
      });
    });

    this.setData(this.state.filmTitle, this.state.current);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.current !== prevState.current) {
      if (this.state.search === true) {
        this.setData();
      } else this.setRatedData();
    }
  }

  newSearch = (text) => {
    if (text.length > 0) {
      this.setState({
        filmTitle: text,
        current: 1,
      });
      this.setData(text);
    }
  };

  cut(str) {
    if (str.length === 0) {
      return 'Description not found';
    }
    if (str.length < 130) {
      return str;
    } else {
      if (str.length < 160) {
        let arr = str.split(' ');
        let arrLastLetter = arr[arr.length - 1].slice(-1);
        if (arr[arr.length - 1] === '...') {
          return arr.join(' ');
        } else if (
          arrLastLetter === '.' ||
          arrLastLetter === '?' ||
          arrLastLetter === ','
        ) {
          arr = arr.slice(0, -1);
          return arr.join(' ') + ' ...';
        } else {
          return str + ' ...';
        }
      } else {
        let arrOfWords = str.split(' ');
        let newString = arrOfWords.slice(0, -1).join(' ');
        return this.cut(newString);
      }
    }
  }

  cleanData = () => {
    this.setState({
      data: [],
      loading: true,
    });
  };

  setRatedData() {
    this.cleanData();
    this.tmdbService
      .getRated(this.state.sessionId, this.state.current)
      .then((res) => {
        let [filmList, totalPages] = res;
        filmList.forEach((item) => {
          const newItem = this.createItem(item);
          this.setState(({ data }) => {
            const newArray = [newItem, ...data];
            return {
              data: newArray,
              noData: false,
              totalPages: totalPages * 10,
            };
          });
        });
      })
      .then(() => {
        this.setState(() => {
          return {
            loading: false,
          };
        });
      })
      .catch((err) => {
        if (err) {
          this.onError();
        }
      });
  }

  setData(text = this.state.filmTitle) {
    this.cleanData();
    this.tmdbService
      .getResource(text, this.state.current)
      .then((res) => {
        let [filmList, totalPages] = res;
        if (filmList.length === 0) {
          this.setState(() => {
            return {
              noData: true,
            };
          });
        } else {
          filmList.forEach((item) => {
            const newItem = this.createItem(item);
            this.setState(({ data }) => {
              const newArray = [newItem, ...data];
              return {
                data: newArray,
                noData: false,
                totalPages: totalPages * 10,
                filmTitle: text,
              };
            });
          });
        }
      })
      .then(() => {
        this.setState(() => {
          return {
            loading: false,
          };
        });
      })
      .catch((err) => {
        if (err) {
          this.onError();
        }
      });
  }

  onError = () => {
    this.setState({
      error: true,
      loading: false,
    });
  };

  createItem(info) {
    return {
      name: info.title,
      date: info.release_date.split('-').join(','),
      genresId: info.genre_ids,
      description: this.cut(info.overview),
      posterPath: info.poster_path,
      id: info.id,
      vote_average: info.vote_average,
      rate: 0,
    };
  }

  onChange = (key) => {
    if (key === '2') {
      page = '2';
      this.setState({
        current: 1,
        search: false,
      });
      this.setRatedData();
    }
    if (key === '1') {
      page = '1';
      this.setState({
        search: true,
        current: 1,
      });
      this.setData();
    }
  };

  render() {
    window.addEventListener('online', () =>
      this.setState({
        error: false,
      })
    );
    window.addEventListener('offline', () => {
      this.setState({
        error: true,
      });
    });

    const { loading, noData, error, totalPages, current } = this.state;

    const pagination = (
      <Pagination
        onChange={(page) => {
          this.setState({ current: page });
        }}
        current={current}
        total={totalPages}
        defaultCurrent={1}
        style={{ bottom: '0px' }}
      />
    );

    const spinner = loading ? <Spinner /> : null;
    const filmList = !loading ? (
      <FilmList
        pagination={pagination}
        sessionId={this.state.sessionId}
        data={this.state.data}
      />
    ) : null;

    const errorMessage = error ? <AlertMessage /> : null;
    const showNoData = noData ? <NoDataMessage /> : null;

    const SearchOrRated = () => (
      <Tabs defaultActiveKey={page} onChange={this.onChange}>
        <TabPane className='search-or-rated' tab='Search' key='1'>
          <SearchField newSearch={this.newSearch} cleanData={this.cleanData} />
          {errorMessage}
          {showNoData}
          {spinner}
          {filmList}
        </TabPane>
        <TabPane tab='Rated' key='2'>
          {showNoData}
          {spinner}
          {filmList}
        </TabPane>
      </Tabs>
    );

    return (
      <GenresProvider value={this.state.genres}>
        <SearchOrRated />
      </GenresProvider>
    );
  }
}
