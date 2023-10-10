import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import createMarkup from './create-markup';
import './styles.css';

const lightbox = new SimpleLightbox('.gallery a', {
  close: false,
  showCounter: false,
});

const optionsObserver = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};

const API_KEY = '39909417-bccdaa8191a89f04b004c69e8';
const BASE_URL = 'https://pixabay.com/api/';
const ENDPOINT = 'image_type=photo&orientation=horizontal&safesearch=true';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  target: document.querySelector('.js-guard'),
};

refs.form.addEventListener('submit', onSubmit);

let observer = new IntersectionObserver(observerScroll, optionsObserver);
let searchQuery;
let currentPage = 1;

function observerScroll(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

      getTrending()
        .then(resp => {
          Notiflix.Notify.info(
            `Hooray! We found ${resp.data.totalHits - currentPage * 40} images.`
          );

          gallery.insertAdjacentHTML('beforeend', createMarkup(resp.data.hits));
          lightbox.refresh();
          const { height: cardHeight } =
            gallery.firstElementChild.getBoundingClientRect();

          window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
          });

          if (currentPage * 40 >= resp.data.totalHits) {
            observer.unobserve(target);
          }
        })
        .catch(err => console.log(err));
    }
  });
}

async function onSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  searchQuery = refs.form.elements.searchQuery.value;
  if (searchQuery.trim() === '') {
    return Notiflix.Notify.warning('Enter something');
  }

  const response = await getTrending();
  const dataArray = response.data.hits;

  if (dataArray.length === 0) {
    return Notiflix.Notify.failure(
      '"Sorry, there are no images matching your search query. Please try again."'
    );
  }
  refs.gallery.innerHTML = createMarkup(dataArray);
  lightbox.refresh();
  refs.form.reset();
}

function getTrending() {
  const params = new URLSearchParams({
    key: API_KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    per_page: 40,
    page: currentPage,
  });
  return axios.get(`${BASE_URL}?${params}`);
}

// const getImage = async searchWord => {
//   const resp = await fetch(
//     `${BASE_URL}?${API_KEY}&${ENDPOINT}&q=${searchWord}`
//   );
//   const data = await resp.json();
//   return data;
// };
// getImage('cat').then(data => console.log(data));
