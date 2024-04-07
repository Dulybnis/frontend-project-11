import * as yup from 'yup';
import onChange from 'on-change';

export default () => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const pText = document.querySelector('.feedback');

  const schema = yup.string().url().nullable();

  const validate = (data) => {
    try {
      schema.validateSync(data);
      return;
    } catch (e) {
      return e.message;
    }
  };

  const state = {
    urls: [],
    status: '',
    isTrue: true,
  };

    const render = (isTrue) => {
    pText.textContent = state.status;
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

  const wathedSubmit = onChange(state, () => {
    render(state.isTrue);
  });

  const addUrl = (url) => {
    if (validate(url)) {
      state.isTrue = false;
      wathedSubmit.status = validate(url);
    } else {
      if (!state.urls.includes(url)) {
        state.status = 'RSS успешно загружен';
        state.isTrue = true;
        input.value = '';
        input.focus();
        wathedSubmit.urls.push(url);
      } else {
        state.status = 'RSS уже существует';
        wathedSubmit.isTrue = false;
      }
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addUrl(input.value)
  })
};