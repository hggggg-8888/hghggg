const OMDB_API_KEY = 'demo';
const apiUrl = 'https://script.google.com/macros/s/AKfycbz0p8nZq8o0a-IEZLjB-HOppyVGfozGY7_kRvpl8vUF_9ovzPhfLdyR3ivhwyUzGmSwSQ/exec';

const state = {
  movies: [
    {
      title: 'Inception',
      director: 'Christopher Nolan',
      year: '2010',
      plot: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
      rating: '9.0',
      poster: 'https://m.media-amazon.com/images/I/51oD6gU5-XL._AC_.jpg',
    },
    {
      title: 'Spirited Away',
      director: 'Hayao Miyazaki',
      year: '2001',
      plot: 'During her family’s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
      rating: '9.2',
      poster: 'https://m.media-amazon.com/images/I/51pt3Kk6FSL._AC_.jpg',
    },
  ],
  currentIndex: 0,
  flipped: false,
};

const elements = {
  viewCollection: document.getElementById('view-collection'),
  viewManager: document.getElementById('view-manager'),
  collectionSection: document.getElementById('collection-section'),
  managerSection: document.getElementById('manager-section'),
  movieCard: document.getElementById('movie-card'),
  posterImage: document.getElementById('poster-image'),
  movieTitle: document.getElementById('movie-title'),
  backTitle: document.getElementById('back-title'),
  movieDirector: document.getElementById('movie-director'),
  movieYear: document.getElementById('movie-year'),
  movieRating: document.getElementById('movie-rating'),
  moviePlot: document.getElementById('movie-plot'),
  movieList: document.getElementById('movie-list'),
  inputTitle: document.getElementById('input-title'),
  inputDirector: document.getElementById('input-director'),
  inputYear: document.getElementById('input-year'),
  inputPlot: document.getElementById('input-plot'),
  inputRating: document.getElementById('input-rating'),
  autoFill: document.getElementById('auto-fill'),
  saveMovie: document.getElementById('save-movie'),
  managerStatus: document.getElementById('manager-status'),
  jsonOutput: document.getElementById('json-output'),
};

function setManagerStatus(message, type = 'info') {
  elements.managerStatus.textContent = message;
  elements.managerStatus.style.color = type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : '#94a3b8';
}

function renderCurrentMovie() {
  const movie = state.movies[state.currentIndex];
  elements.posterImage.src = movie.poster || 'https://via.placeholder.com/320x460?text=No+Poster';
  elements.posterImage.alt = `${movie.title} 海報`;
  elements.movieTitle.textContent = movie.title;
  elements.backTitle.textContent = movie.title;
  elements.movieDirector.textContent = movie.director || '-';
  elements.movieYear.textContent = movie.year || '-';
  elements.movieRating.textContent = movie.rating || '-';
  elements.moviePlot.textContent = movie.plot || '請至管理頁面新增電影資訊。';
}

function renderMovieList() {
  elements.movieList.innerHTML = '';
  state.movies.forEach((movie, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'movie-tile';
    tile.innerHTML = `<h3>${movie.title}</h3><p>${movie.year || '未知年份'}</p>`;
    tile.addEventListener('click', () => {
      state.currentIndex = index;
      state.flipped = false;
      elements.movieCard.classList.remove('flipped');
      renderCurrentMovie();
    });
    elements.movieList.appendChild(tile);
  });
}

function switchPanel(panel) {
  const isCollection = panel === 'collection';
  elements.collectionSection.classList.toggle('active', isCollection);
  elements.managerSection.classList.toggle('active', !isCollection);
  elements.viewCollection.classList.toggle('active', isCollection);
  elements.viewManager.classList.toggle('active', !isCollection);
}

async function fetchMovieData() {
  const title = elements.inputTitle.value.trim();
  if (!title) {
    setManagerStatus('請先輸入英文片名。', 'error');
    return;
  }

  setManagerStatus('正在呼叫 OMDb API，自動填入資料...');
  try {
    const response = await fetch(`${apiUrl}?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
    const data = await response.json();

    if (data.Response === 'False') {
      throw new Error(data.Error || '找不到電影資料');
    }

    elements.inputDirector.value = data.Director || '';
    elements.inputYear.value = data.Year || '';
    elements.inputPlot.value = data.Plot === 'N/A' ? '' : data.Plot || '';
    setManagerStatus('自動填入完成，請確認資料後儲存。', 'success');
  } catch (error) {
    console.error(error);
    setManagerStatus('自動填入失敗，請手動補上電影資料。', 'error');
  }
}

function saveMovieData() {
  const movie = {
    title: elements.inputTitle.value.trim(),
    director: elements.inputDirector.value.trim(),
    year: elements.inputYear.value.trim(),
    plot: elements.inputPlot.value.trim(),
    rating: elements.inputRating.value.trim() || '-',
    poster: 'https://via.placeholder.com/320x460?text=Poster',
  };

  if (!movie.title) {
    setManagerStatus('英文片名為必填欄位。', 'error');
    return;
  }

  state.movies.push(movie);
  state.currentIndex = state.movies.length - 1;
  state.flipped = false;
  elements.movieCard.classList.remove('flipped');
  renderCurrentMovie();
  renderMovieList();

  const jsonData = JSON.stringify(movie, null, 2);
  elements.jsonOutput.textContent = jsonData;
  console.log('準備送出的電影 JSON：', jsonData);
  setManagerStatus('已準備電影 JSON，可送出至後端或儲存。', 'success');
}

function init() {
  renderCurrentMovie();
  renderMovieList();
  switchPanel('collection');

  elements.viewCollection.addEventListener('click', () => switchPanel('collection'));
  elements.viewManager.addEventListener('click', () => switchPanel('manager'));
  elements.movieCard.addEventListener('click', () => {
    state.flipped = !state.flipped;
    elements.movieCard.classList.toggle('flipped', state.flipped);
  });
  elements.autoFill.addEventListener('click', fetchMovieData);
  elements.saveMovie.addEventListener('click', saveMovieData);
}

init();
