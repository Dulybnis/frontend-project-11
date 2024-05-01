import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';
import axios from 'axios';


export default () => {
  const stats = {
    language: 'ru',
    urls: [],
    status: '',
    isTrue: true,
  };

  const feedStats = {
    lastFeedId: 0,
    lastPostId: 0,
    feed: [],
    post: [],
  };

  const i18ni = i18n;
    i18ni.init({
      lng: stats.language,
      debug: false,
      resources,
  });

  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const pText = document.querySelector('.feedback');
  const h1 = document.querySelector('h1');
  const lead = document.querySelector('.lead');
  const underText = document.querySelector('.text-muted');
  const posts = document.querySelector('.posts');
  const feeds = document.querySelector('.feeds');

  input.nextElementSibling.textContent = i18ni.t('inputText');
  h1.textContent = i18ni.t('h1');
  lead.textContent = i18ni.t('displayText');
  form.querySelector('button').textContent = i18ni.t('buttomText');
  underText.textContent = i18ni.t('underFormText');

  yup.setLocale({
    mixed: {
      default: 'Поле не валидно',
    },
    string: { url: 'Ссылка должна быть валидным URL'},
  });

  const schema = yup.string().url().nullable();

  const render = (isTrue) => {
    pText.textContent = stats.status;
    if (isTrue) {
      input.classList.remove('is-invalid');
      pText.classList.remove('text-danger');
      pText.classList.add('text-success');
    } else {
      input.classList.add('is-invalid');
      pText.classList.remove('text-success');
      pText.classList.add('text-danger');
    }
  };

  const feedsRender = () => {
    feeds.innerHTML = '';
    if (feedStats.feed.length < 1) {
      return
    } else {
      const h2El = document.createElement('div');
      h2El.className = 'card border-0'
      h2El.innerHTML = '<div class="card-body"><h2 class="card-title h4">Фиды</h2></div><ul class="list-group border-0 rounded-0"></ul>';
      feeds.append(h2El);
      const ulEl = feeds.querySelector('ul');
      feedStats.feed.map((feedItem) => {
        const liEl = document.createElement('li');
        liEl.className = 'list-group-item border-0 border-end-0';
        liEl.innerHTML = `<h3 class="h6 m-0">${feedItem.title}</h3><p class="m-0 small text-black-50">${feedItem.description}</p>`
        ulEl.append(liEl) 
      })
    }
  };

  const postsRender = () => {
    posts.innerHTML = '';
    if (feedStats.post.length < 1) {
      return
    } else {
      const h2El = document.createElement('div');
      h2El.className = 'card border-0'
      h2El.innerHTML = '<div class="card-body"><h2 class="card-title h4">Посты</h2></div><ul class="list-group border-0 rounded-0"></ul>';
      posts.append(h2El);
      const ulEl = posts.querySelector('ul');
      feedStats.post.map((postItem) => {
        const liEl = document.createElement('li');
        liEl.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
        liEl.innerHTML = `<a href="${postItem.link}" class="fw-bold" data-id="${postItem.id}" target="_blank" rel="noopener noreferrer">${postItem.title}</a><button type="button" class="btn btn-outline-primary btn-sm" data-id="${postItem.id}" data-bs-toggle="modal" data-bs-target="#modal">Просмотр</button>`
        ulEl.append(liEl);
      })
    }
  };

  const wathedSubmit = onChange(stats, () => {
    render(stats.isTrue);
  });

  const watchedFeedState = onChange(feedStats.feed, () => {
    feedsRender();
  });

  const watchedPostState = onChange(feedStats.post, () => {
    postsRender();
  });

  const parse = (rss) => {
    const parser = new DOMParser();
    const parseRSS = parser.parseFromString(rss, 'application/xml');
    const channel = parseRSS.querySelector('channel');
    if (!channel) {
      throw new Error('channel is null');
    }
      console.log('channel = ', channel);
    feedStats.lastFeedId += 1;
    const newFeedStats = {
      id: feedStats.lastFeedId,
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
      link: channel.querySelector('link').textContent,
    };
    const newPostStats = [];
    channel.querySelectorAll('item').forEach((item) => {
      feedStats.lastPostId += 1;
      newPostStats.push({
        id: feedStats.lastPostId,
        feedId: feedStats.lastFeedId,
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
      });
    });
    
    watchedFeedState.push(newFeedStats);
    watchedPostState.push(...newPostStats);
  };

  const getUrls = (url) => {
    axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
      .then((answer) => {
        console.log('answer is ', answer);
        if (!stats.urls.includes(url)) {
          stats.status = i18ni.t('text.rssAdded');
          stats.isTrue = true;
          input.value = '';
          input.focus();
          wathedSubmit.urls.push(url);
          parse(answer.data.contents);
        } else {
          stats.status = i18ni.t('text.rssAlredy');
          wathedSubmit.isTrue = false;
        }
      })
      .catch((e) => {
        console.log(e);
        console.log(e.message);
        stats.status = i18ni.t(`text.${e.message}`);
        wathedSubmit.isTrue = false;
      })
  };

  const addUrl = (url) => {
    schema.validate(url)
      .then((data) => getUrls(data))
      .catch((e) => {
        stats.isTrue = false;
        wathedSubmit.status = e.message;
      })
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addUrl(input.value)
  })
};