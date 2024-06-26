const postsRender = (stats, elements, i18ni) => {
  elements.posts.textContent = '';
  if (stats.feedStats.post.length > 0) {
    const divBorder = document.createElement('div');
    divBorder.className = 'card border-0';
    const divBody = document.createElement('div');
    divBody.className = 'card-body';
    const h2Title = document.createElement('h2');
    h2Title.className = 'card-title h4';
    h2Title.textContent = i18ni.t('posts');
    const ulList = document.createElement('ul');
    ulList.className = 'list-group border-0 rounded-0';
    divBody.append(h2Title);
    divBorder.append(divBody);
    divBorder.append(ulList);
    elements.posts.append(divBorder);
    const ulEl = elements.posts.querySelector('ul');
    stats.feedStats.post.forEach((postItem) => {
      const liEl = document.createElement('li');
      liEl.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
      const aEl = document.createElement('a');
      aEl.href = postItem.link;
      aEl.className = postItem.fw;
      aEl.dataset.id = postItem.id;
      aEl.target = '_blank';
      aEl.rel = 'noopener noreferrer';
      aEl.textContent = postItem.title;
      const buttonPrimary = document.createElement('button');
      buttonPrimary.type = 'button';
      buttonPrimary.className = 'btn btn-outline-primary btn-sm';
      buttonPrimary.dataset.id = postItem.id;
      buttonPrimary.dataset.bsToggle = 'modal';
      buttonPrimary.dataset.bsTarget = '#modal';
      buttonPrimary.textContent = i18ni.t('buttonText');
      liEl.append(aEl);
      liEl.append(buttonPrimary);

      const liButton = liEl.querySelector('.btn');
      liButton.addEventListener('click', (e) => {
        const idElement = e.target.previousSibling.getAttribute('data-id');
        const idPost = stats.feedStats.post.find((element) => element.id === Number(idElement));
        elements.modalTitle.textContent = idPost.title;
        elements.modalBody.textContent = idPost.description;
        elements.modalRead.href = idPost.link;
        idPost.fw = 'fw-normal';
        postsRender(stats, elements, i18ni);
      });
      ulEl.append(liEl);
    });
  }
};

export default postsRender;
