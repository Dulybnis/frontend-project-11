import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/index.js';
import render from './render/render.js';
import feedsRender from './render/feedsRender.js';
import postsRender from './render/postRender.js';
import progressRender from './render/progressRender.js';

export default () => {
  const stats = {
    language: 'ru',
    urls: [],
    status: '',
    refresh: 'off',
    processed: 'finish',
    feedStats: {
      lastFeedId: 0,
      lastPostId: 0,
      feed: [],
      post: [],
    },
  };

  const i18ni = i18n;
  i18ni.init({
    lng: stats.language,
    debug: false,
    resources,
  });

  const elements = {
    header: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    input: document.querySelector('#url-input'),
    form: document.querySelector('.rss-form'),
    formButton: document.querySelector('.rss-form .btn'),
    underText: document.querySelector('.text-muted'),
    modalRead: document.querySelector('.modal-footer .btn-primary'),
    modalClose: document.querySelector('.modal-footer .btn-secondary'),
    pText: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
  };

  elements.input.nextElementSibling.textContent = i18ni.t('inputText');
  elements.header.textContent = i18ni.t('h1');
  elements.lead.textContent = i18ni.t('displayText');
  elements.form.querySelector('button').textContent = i18ni.t('buttomText');
  elements.underText.textContent = i18ni.t('underFormText');
  elements.modalRead.textContent = i18ni.t('modalRead');
  elements.modalClose.textContent = i18ni.t('modalClose');

  // для привязки двух языков сделал через Error('RSS already exists')
  /* yup.setLocale({
    mixed: {
      default: 'Поле не валидно',
    },
    string: { url: 'Ссылка должна быть валидным URL'},
  }); */

  const schema = yup.string().url().nullable();

  const watchedSubmit = onChange(stats, () => {
    render(stats, elements, i18ni);
  });

  const watchedFeedState = onChange(stats.feedStats.feed, () => {
    feedsRender(stats, elements, i18ni);
  });

  const watchedPostState = onChange(stats.feedStats.post, () => {
    postsRender(stats, elements, i18ni);
  });

  const watchedProgress = onChange(stats, () => {
    progressRender(elements, stats);
  });

  function parseRSS(rss) {
    return new Promise((resolve, reject) => {
      const parser = new DOMParser();
      const parsingRSS = parser.parseFromString(rss, 'application/xml');
      const parsererrors = parsingRSS.querySelector('parsererror');
      if (parsererrors !== null) {
        const error = parsererrors.tagName;
        throw new Error(error);
      } else {
        const channel = parsingRSS.querySelector('channel');
        if (channel) {
          resolve(channel);
        } else {
          reject(new Error('channel is null'));
        }
      }
    });
  }

  const postsAdd = (channel) => {
    const ownTitle = stats.feedStats.post.map((post) => post.title);
    const newPostStats = [];
    channel.querySelectorAll('item').forEach((item) => {
      const title = item.querySelector('title').textContent;
      if (!ownTitle.includes(title)) {
        stats.feedStats.lastPostId += 1;
        newPostStats.push({
          id: stats.feedStats.lastPostId,
          feedId: stats.feedStats.lastFeedId,
          title: item.querySelector('title').textContent,
          description: item.querySelector('description').textContent,
          link: item.querySelector('link').textContent,
          fw: 'fw-bold',
        });
      }
    });
    if (newPostStats.length > 0) {
      watchedPostState.unshift(...newPostStats);
    }
  };

  const feedAdd = (channel) => {
    stats.feedStats.lastFeedId += 1;
    const newFeedStats = {
      id: stats.feedStats.lastFeedId,
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      link: channel.querySelector('link').textContent,
    };
    postsAdd(channel);
    watchedFeedState.push(newFeedStats);
  };

  const makeURL = (url) => {
    const newUrl = new URL('https://allorigins.hexlet.app/get');
    newUrl.searchParams.set('disableCache', 'true');
    newUrl.searchParams.set('url', url);
    return newUrl;
  };

  function getRSS(url) {
    return new Promise((resolve, reject) => {
      axios.get(makeURL(url).href)
        .then((rss) => resolve(rss))
        .catch(() => reject(new Error('network error')));
    });
  }

  const refresh = () => {
    if (stats.urls.length > 0) {
      stats.urls.forEach((url) => {
        getRSS(url)
          .then((rss) => parseRSS(rss.data.contents))
          .then((channel) => postsAdd(channel));
      });
    }
    setTimeout(() => {
      refresh();
    }, 5000);
  };

  function addRSS(channel, url) {
    return new Promise((resolve, reject) => {
      if (!stats.urls.includes(url)) {
        stats.status = 'text.rssAdded';
        elements.input.value = '';
        elements.input.focus();
        watchedSubmit.urls.push(url);
        feedAdd(channel);
        if (stats.refresh === 'off') {
          stats.refresh = 'on';
          refresh();
        }
        resolve();
      } else {
        reject(new Error('RSS already exists'));
      }
    });
  }

  const addUrl = (url) => {
    watchedProgress.processed = 'in progress';
    watchedSubmit.status = 'text.URLview';
    schema.validate(url)
      .then((validateUrl) => getRSS(validateUrl))
      .then((rss) => parseRSS(rss.data.contents))
      .then((channel) => addRSS(channel, url))
      .catch((e) => {
        watchedSubmit.status = `text.${e.message}`;
      })
      .then(() => { watchedProgress.processed = 'finish'; });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    addUrl(elements.input.value);
  });
};
