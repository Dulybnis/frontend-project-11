import i18n from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import resources from './locales/index.js';



export default async () => {
  const stats = {
    language: 'ru',
    urls: [],
    status: '',
    isTrue: true,
  };

  const i18ni = i18n;
  await i18ni.init({
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

  const validate = (data) => {
    try {
      schema.validateSync(data);
      return;
    } catch (e) {
      return (e.message);
    }
  };

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

  const wathedSubmit = onChange(stats, () => {
    render(stats.isTrue);
  });

  const addUrl = (url) => {
    if (validate(url)) {
      stats.isTrue = false;
      wathedSubmit.status = validate(url);
    } else {
      if (!stats.urls.includes(url)) {
        stats.status = i18ni.t('text.rssAdded');
        stats.isTrue = true;
        input.value = '';
        input.focus();
        wathedSubmit.urls.push(url);
      } else {
        stats.status = i18ni.t('text.rssAlredy')
        wathedSubmit.isTrue = false;
      }
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addUrl(input.value)
  })
};