import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


import { refs } from './js/refs'
import { spinnerPlay, spinnerStop } from './js/spinner'
import { PixabayAPI } from './js/pixabayAPI';
import { notifyInit } from './js/notifyInit'
import { createMarkup } from './js/createMarkup';


const modalLightboxGallery = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

spinnerPlay();

window.addEventListener('load', () => {
  console.log('All resources finished loading!');

  spinnerStop();
});

const options = {
  root: null,
  rootMargin: '200px',
};

const observer = new IntersectionObserver(loadMorePhotos, options)

const pixabay = new PixabayAPI();


refs.form.addEventListener('submit', onSubmitClick);

async function onSubmitClick(event) {
    event.preventDefault();

    const {
        elements: { searchQuery },
    } = event.target

    let search_query = searchQuery.value.trim().toLowerCase();
    console.log(search_query);

    if (!search_query) {
        clearPage();
        Notify.info('Enter data to search!', notifyInit);
        refs.gallery.innerHTML = '';
        return;
    }

    pixabay.query = search_query;
    clearPage();

    try {
        spinnerPlay();
        const { hits, totalHits } = await pixabay.getPhotos();
        // console.log("totalHits: ", totalHits);
        // console.log('hits: ', hits);

        if (hits.length === 0) {
            Notify.failure(
                `Sorry, there are no images matching your ${search_query}. Please try again.`,
                notifyInit
            )
            return;
        }
            const markup = createMarkup(hits);
            refs.gallery.insertAdjacentHTML('beforeend', markup);

            pixabay.setTotal(totalHits);
            Notify.success(`Hooray! We found ${totalHits} images.`, notifyInit);
        
        await checkAndAttachObserver();

        modalLightboxGallery.refresh();
        
    } catch (error) {
    Notify.failure(error.message, 'Something went wrong!', notifyInit);

    clearPage();
  } finally {
        spinnerStop();
        refs.input.value = '';
  } 
};

function clearPage() {
    pixabay.resetPage();
    refs.gallery.innerHTML = '';
}

async function checkAndAttachObserver() {
    if (pixabay.hasMorePhotos()) {
        const lastItem = document.querySelector('.js-guard');
        if (lastItem) {
            observer.observe(lastItem);
        } else {
            console.log('No more items to observe.')
        }
    } else {
        Notify.info(
            "We're sorry, but you've reached the end of search results.", notifyInit
        );
    };
}

async function loadMorePhotos(entries, observer) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            pixabay.incrementPage();

            spinnerPlay();

            try {
                spinnerPlay();

                const { hits } = await pixabay.getPhotos();
                const markup = createMarkup(hits);
                refs.gallery.insertAdjacentHTML('beforeend', markup);

                await checkAndAttachObserver();

                modalLightboxGallery.refresh();
            } catch (error) {
                Notify.failure(error.message, 'Something went wrong!', notifyInit);
                clearPage();
            } finally {
                spinnerStop();
            }
        }
    });
};
