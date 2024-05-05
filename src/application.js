import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import resources from './locales/index.js';

export default () => {
  const stats = {
    language: 'ru',
    urls: [],
    status: '',
    isTrue: true,
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

  const form = document.querySelector('.rss-form');
  const formButton = form.querySelector('.btn');
  const input = document.querySelector('#url-input');
  const pText = document.querySelector('.feedback');
  const h1 = document.querySelector('h1');
  const lead = document.querySelector('.lead');
  const underText = document.querySelector('.text-muted');
  const posts = document.querySelector('.posts');
  const feeds = document.querySelector('.feeds');
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');

  input.nextElementSibling.textContent = i18ni.t('inputText');
  h1.textContent = i18ni.t('h1');
  lead.textContent = i18ni.t('displayText');
  form.querySelector('button').textContent = i18ni.t('buttomText');
  underText.textContent = i18ni.t('underFormText');

  // для привязки двух языков сделал через Error('RSS already exists')
  /* yup.setLocale({
    mixed: {
      default: 'Поле не валидно',
    },
    string: { url: 'Ссылка должна быть валидным URL'},
  }); */

  const schema = yup.string().url().nullable();

  function isNull(url) {
    return new Promise((resolve, reject) => {
      if (url) {
        resolve(url);
      } else {
        reject(new Error('not to be null'));
      }
    });
  }

  const render = () => {
    pText.textContent = stats.status;
    switch (stats.isTrue) {
      case true:
        input.classList.remove('is-invalid');
        pText.classList.remove('text-danger');
        pText.classList.add('text-success');
        break;
      default:
        input.classList.add('is-invalid');
        pText.classList.remove('text-success');
        pText.classList.add('text-danger');
        break;
    }
  };

  const feedsRender = () => {
    feeds.innerHTML = '';
    if (stats.feedStats.feed.length > 0) {
      const h2El = document.createElement('div');
      h2El.className = 'card border-0';
      h2El.innerHTML = '<div class="card-body"><h2 class="card-title h4">Фиды</h2></div><ul class="list-group border-0 rounded-0"></ul>';
      feeds.append(h2El);
      const ulEl = feeds.querySelector('ul');
      stats.feedStats.feed.forEach((feedItem) => {
        const liEl = document.createElement('li');
        liEl.className = 'list-group-item border-0 border-end-0';
        liEl.innerHTML = `<h3 class="h6 m-0">${feedItem.title}</h3><p class="m-0 small text-black-50">${feedItem.description}</p>`;
        ulEl.append(liEl);
      });
    }
  };

  const postsRender = () => {
    posts.innerHTML = '';
    if (stats.feedStats.post.length > 0) {
      const h2El = document.createElement('div');
      h2El.className = 'card border-0';
      h2El.innerHTML = '<div class="card-body"><h2 class="card-title h4">Посты</h2></div><ul class="list-group border-0 rounded-0"></ul>';
      posts.append(h2El);
      const ulEl = posts.querySelector('ul');
      stats.feedStats.post.forEach((postItem) => {
        const liEl = document.createElement('li');
        liEl.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
        liEl.innerHTML = `<a href="${postItem.link}" class="${postItem.fw}" data-id="${postItem.id}" target="_blank" rel="noopener noreferrer">${postItem.title}</a><button type="button" class="btn btn-outline-primary btn-sm" data-id="${postItem.id}" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>`;
        const liButton = liEl.querySelector('.btn');
        liButton.addEventListener('click', (e) => {
          const idElement = e.target.previousSibling.getAttribute('data-id');
          const idPost = stats.feedStats.post.find((element) => {return element.id === Number(idElement)});
          modalTitle.textContent = idPost.title;
          modalBody.textContent = idPost.description;
          idPost.fw = 'fw-normal';
          postsRender();
        });
        ulEl.append(liEl);
      });
    }
  };

  const progressRender = () => {
    if (stats.processed === 'in progress') {
      formButton.setAttribute('disabled', '');
    } else {
      formButton.removeAttribute('disabled');
    }
  };

  const watchedSubmit = onChange(stats, () => {
    render();
  });

  const watchedFeedState = onChange(stats.feedStats.feed, () => {
    feedsRender();
  });

  const watchedPostState = onChange(stats.feedStats.post, () => {
    postsRender();
  });

  const watchedProgress = onChange(stats, () => {
    progressRender();
  });

  function parseRSS(rss) {
    return new Promise((resolve, reject) => {
      const parser = new DOMParser();
      const parsingRSS = parser.parseFromString(rss, 'application/xml');
      const channel = parsingRSS.querySelector('channel');
      if (channel) {
        resolve(channel);
      } else {
        reject(new Error('channel is null'));
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

  function getRSS(url) {
    return new Promise((resolve, reject) => {
      axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
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
        stats.status = i18ni.t('text.rssAdded');
        stats.isTrue = true;
        input.value = '';
        input.focus();
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
    stats.isTrue = true;
    watchedSubmit.status = i18ni.t('text.viewing');
    isNull(url)
      .then((notNullUrl) => schema.validate(notNullUrl))
      .then((validateUrl) => getRSS(validateUrl))
      .then((rss) => parseRSS(rss.data.contents))
      .then((channel) => addRSS(channel, url))
      .catch((e) => {
        stats.isTrue = false;
        watchedSubmit.status = i18ni.t(`text.${e.message}`);
      })
      .then(() => {watchedProgress.processed = 'finish'});
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addUrl(input.value);
  });
};
