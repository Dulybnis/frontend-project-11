const progressRender = (elements, stats) => {
    if (stats.processed === 'in progress') {
      elements.formButton.setAttribute('disabled', '');
    } else {
      elements.formButton.removeAttribute('disabled');
    }
  };

  export default progressRender;