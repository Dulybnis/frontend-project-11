const feedsRender = (stats, elements, i18ni) => {
  elements.feeds.textContent = '';
  if (stats.feedStats.feed.length > 0) {
    const divBorder = document.createElement('div');
    divBorder.className = 'card border-0';
    const divBody = document.createElement('div');
    divBody.className = 'card-body';
    const h2Title = document.createElement('h2');
    h2Title.className = 'card-title h4';
    h2Title.textContent = i18ni.t('feeds');
    const ulList = document.createElement('ul');
    ulList.className = 'list-group border-0 rounded-0';
    divBody.append(h2Title);
    divBorder.append(divBody);
    divBorder.append(ulList);
    elements.feeds.append(divBorder);

    const ulEl = elements.feeds.querySelector('ul');      
    stats.feedStats.feed.forEach((feedItem) => {
      const liEl = document.createElement('li');
      liEl.className = 'list-group-item border-0 border-end-0';
      const h3El = document.createElement('h3');
      h3El.className = 'h6 m-0';
      h3El.textContent = feedItem.title;
      const pEl = document.createElement('p');
      pEl.className = 'm-0 small text-black-50';
      pEl.textContent = feedItem.description;
      liEl.append(h3El);
      liEl.append(pEl);
      ulEl.append(liEl);
    });
  elements.feeds.append(ulEl);
  }
};

export default feedsRender;
