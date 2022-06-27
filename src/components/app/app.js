import React, { Component } from 'react';
import FilmList from '../film-list';
import { GenresProvider } from '../genres-context/genres-context';
import './app.css';
import SwapiService from '../../services';
import Spinner from '../spinner';
import AlertMessage from '../error-alert';
import NoDataMessage from '../no-data-message';
import SearchField from '../search-field';
import { Pagination, Tabs } from 'antd';
import 'antd/dist/antd.min.css';

const { TabPane } = Tabs;

const pageSize = 6;
let page = '1';

export default class App extends Component {
  // maxId = 100;
  state = {
    data: [],
    genres: '',
    loading: true,
    error: false,
    noData: false,
    totalPage: 0,
    current: 1,
    minIndex: 0,
    maxIndex: 0,
    sessionId: null,
  };

  swapiService = new SwapiService();

  componentDidMount() {
    localStorage.clear();
    this.swapiService.createGuestSession().then((res) => {
      this.setState({
        sessionId: res.guest_session_id,
      });
    });

    this.swapiService.getGenres().then((res) => {
      this.setState({
        genres: res,
      });
    });

    this.setData();
  }

  newSearch = (text) => {
    if (text.length > 0) {
      this.setData(text);
    }
  };

  cut(str) {
    if (str.length < 150) {
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

  cleanData = () => {
    this.setState({
      data: [],
      loading: true,
    });
  };

  setRatedData = () => {
    const sessionId = this.state.sessionId;
    this.cleanData();
    this.swapiService
      .getRated(sessionId)
      .then((res) => {
        res.forEach((item) => {
          const newItem = this.createItem(item);
          this.setState(({ data }) => {
            const newArray = [newItem, ...data];
            return {
              data: newArray,
              noData: false,
              totalPage: data.length / pageSize,
              minIndex: 0,
              maxIndex: pageSize,
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
  };

  setData(filmName = 'batman') {
    this.cleanData();
    this.swapiService
      .getResource(filmName)
      .then((info) => {
        if (info.length === 0) {
          this.setState(() => {
            return {
              noData: true,
            };
          });
        }
        if (info.length !== 0) {
          info.forEach((item) => {
            const newItem = this.createItem(item);
            this.setState(({ data }) => {
              const newArray = [newItem, ...data];
              return {
                data: newArray,
                noData: false,
                totalPage: data.length / pageSize,
                minIndex: 0,
                maxIndex: pageSize,
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

  handleChange = (page) => {
    this.setState({
      current: page,
      minIndex: (page - 1) * pageSize,
      maxIndex: page * pageSize,
    });
  };

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
      this.setRatedData();
    }
    if (key === '1') {
      page = '1';
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

    const { loading, noData, current, data, error } = this.state;

    const pagination = (
      <Pagination
        pageSize={pageSize}
        current={current}
        total={data.length}
        onChange={this.handleChange}
        style={{ bottom: '0px' }}
      />
    );

    const spinner = loading ? <Spinner /> : null;
    const filmList = !loading ? (
      <FilmList
        sessionId={this.state.sessionId}
        data={this.state.data}
        pagination={pagination}
        minIndex={this.state.minIndex}
        maxIndex={this.state.maxIndex}
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
