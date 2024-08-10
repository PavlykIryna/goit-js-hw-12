import { fetchImages } from './js/pixabay-api.js';
import {
  renderImages,
  renderErrorMessage,
  clearGallery,
  toggleLoadMoreButton,
} from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './css/styles.css';

let lightbox;
let currentPage = 1;
let currentQuery = '';
const loader = document.querySelector('#loader');
const loadMoreBtn = document.getElementById('load-more');

document
  .querySelector('#search-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();
    currentQuery = document.getElementById('search-input').value.trim();

    if (currentQuery === '') {
      renderErrorMessage('Search field cannot be empty.');
      return;
    }

    currentPage = 1;
    clearGallery();
    toggleLoadMoreButton(false);
    await loadImages();
  });

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await loadImages();
});

async function loadImages() {
  showLoader();

  try {
    const data = await fetchImages(currentQuery, currentPage);
    if (data.hits.length > 0) {
      renderImages(data.hits);
      refreshLightbox();

      const { height: cardHeight } = document
        .querySelector('.gallery-item')
        .getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      toggleLoadMoreButton(currentPage * 15 < data.totalHits);
      if (currentPage * 15 >= data.totalHits) {
        renderErrorMessage(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      renderErrorMessage(
        'Sorry, there are no images matching your search query. Please try again!'
      );
    }
  } catch (error) {
    renderErrorMessage(error.message);
  } finally {
    hideLoader();
  }
}

function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

function refreshLightbox() {
  if (!lightbox) {
    lightbox = new SimpleLightbox('.gallery-item', {
      captionsData: 'alt',
      captionDelay: 250,
    });
  } else {
    lightbox.refresh();
  }
}
