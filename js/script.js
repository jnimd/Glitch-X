// --- LOADING SCREEN LOGIC ---
document.addEventListener("DOMContentLoaded", function () {
  const loadingScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');
  const LOADING_DURATION_MS = 3000; // Loading time set to 3 seconds

  // Set a timeout to hide the loading screen and show the main content
  setTimeout(() => {
    // 1. Start the fade-out animation for the loading screen (CSS transition)
    loadingScreen.classList.add('fade-out');

    // 2. After the fade-out transition is complete, hide it completely
    loadingScreen.addEventListener('transitionend', function handler() {
      // Hide the loading screen element
      loadingScreen.style.display = 'none';

      // 3. Show the main content by removing the 'hidden' class
      mainContent.classList.remove('hidden');

      // Remove the listener to prevent multiple executions
      loadingScreen.removeEventListener('transitionend', handler);
    });

  }, LOADING_DURATION_MS);
});

// (Your existing Swiper and other code should be below this new code)


// Swiper instance for the "Projects" section
var swiperProjects = new Swiper("#projects-swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 1.5,
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 100,
    modifier: 4,
    slideShadows: false
  },
  loop: true,
  navigation: {
    nextEl: ".projects-next",
    prevEl: ".projects-prev"
  },
  pagination: {
    el: ".projects-pagination",
    clickable: true
  },
  keyboard: {
    enabled: true
  },
  mousewheel: {
    thresholdDelta: 70
  },
  breakpoints: {
    320: {
      slidesPerView: 1.5,
      coverflowEffect: {
        stretch: 20
      }
    },
    560: {
      slidesPerView: 2.5
    },
    768: {
      slidesPerView: 3
    },
    1024: {
      slidesPerView: 3
    }
  }
});

// Swiper instance for the "Future Updates" section
var swiperUpdates = new Swiper("#updates-swiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 1.2, // This value is changed to show 1.2 slides for a slightly larger look
  coverflowEffect: {
    rotate: 0,
    stretch: 0,
    depth: 100,
    modifier: 4,
    slideShadows: false
  },
  loop: true,
  navigation: {
    nextEl: ".updates-next",
    prevEl: ".updates-prev"
  },
  pagination: {
    el: ".updates-pagination",
    clickable: true
  },
  keyboard: {
    enabled: true
  },
  mousewheel: {
    thresholdDelta: 70
  },
  breakpoints: {
    320: {
      slidesPerView: 1.2, // This value is changed to show 1.2 slides
      coverflowEffect: {
        stretch: 20
      }
    },
    560: {
      slidesPerView: 1.2 // This value is changed to show 1.2 slides
    },
    768: {
      slidesPerView: 1.2, // This value is changed to show 1.2 slides
    },
    1024: {
      slidesPerView: 1.2
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const projectUrl = 'borg.html';
  const logoUrl = 'images/borgexelogo.png'; // මෙතන ඔයාගේ logo file එකේ path එක දාන්න

  // Search input එකට අදාල event listener එක
  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();

    // "G" අකුරෙන් පටන් ගන්නා ඕනෑම text එකක් සඳහා suggestion එක පෙන්වන්න
    if (query.startsWith('g')) {
      searchResults.innerHTML = `
                <a href="${projectUrl}" class="search-result-item">
                    <img src="${logoUrl}" alt="Glitch Borg Logo" class="result-logo">
                    <span>GLITCH BORG - PC Optimizer</span>
                </a>
            `;
      searchResults.style.display = 'flex';
    } else {
      // වෙනත් දෙයක් type කරද්දී suggestion එක සඟවන්න
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
    }
  });

  // Enter key එක press කරද්දී අදාල page එකට redirect කරන්න
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const query = searchInput.value.toLowerCase();
      if (query.startsWith('g')) {
        window.location.href = projectUrl;
      }
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const projectUrl = 'sinhala-converter.html';
  const logoUrl = ''; // මෙතන ඔයාගේ logo file එකේ path එක දාන්න

  // Search input එකට අදාල event listener එක
  searchInput.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();

    // "G" අකුරෙන් පටන් ගන්නා ඕනෑම text එකක් සඳහා suggestion එක පෙන්වන්න
    if (query.startsWith('s')) {
      searchResults.innerHTML = `
                <a href="${projectUrl}" class="search-result-item">
                    <img src="${logoUrl}" alt="Singlish C Logo" class="result-logo">
                    <span>Singlish Converter</span>
                </a>
            `;
      searchResults.style.display = 'flex';
    } else {
      // වෙනත් දෙයක් type කරද්දී suggestion එක සඟවන්න
      searchResults.style.display = 'none';
      searchResults.innerHTML = '';
    }
  });

  // Enter key එක press කරද්දී අදාල page එකට redirect කරන්න
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const query = searchInput.value.toLowerCase();
      if (query.startsWith('g')) {
        window.location.href = projectUrl;
      }
    }
  });
});


// Get the menu button and menu container
const menuBtn = document.querySelector('.menu-btn');
const menuContainer = document.querySelector('.menu-container');

// Use a single event listener on the document to manage all menu interactions
document.addEventListener('click', (event) => {
  // Check if the clicked element is the menu button itself or a descendant of it
  const isMenuBtnClicked = menuBtn.contains(event.target);

  // Check if the clicked element is inside the menu container
  const isInsideMenu = menuContainer.contains(event.target);

  // If the menu button was clicked, we toggle the menu's state
  if (isMenuBtnClicked) {
    menuBtn.classList.toggle('active');
    menuContainer.classList.toggle('active');
  }
  // If the menu is open and the click was outside the menu (and not on the button), close it
  else if (menuContainer.classList.contains('active') && !isInsideMenu) {
    menuBtn.classList.remove('active');
    menuContainer.classList.remove('active');
  }
});

// If you want the menu to close when a link is clicked
const menuItems = document.querySelectorAll('.dropdown-menu .menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    menuBtn.classList.remove('active');
    menuContainer.classList.remove('active');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // ===========================================
  // 1. PLAYLIST DEFINITION (ඔබේ විස්තර ඇතුලත් කර ඇත)
  // ===========================================
  const playlist = [
    {
      title: "GlitchX Horizon",
      artist: "Jnim",
      src: "audio/Glitch1.mp3", // ⬅️ ඔබේ පළවෙනි සින්දුවේ path එක
      headerTitle: "GlitchX Gramophone",
      albumArt: "images/your_album_art_1.png" // ⬅️ පලවෙනි සින්දුවේ cover photo eka
    },
    {
      title: "Track 02",
      artist: "Jnim",
      src: "audio/Glitch2.mp3", // ⬅️ ඔබේ දෙවෙනි සින්දුවේ path එක
      headerTitle: "GLITCH X Track",
      albumArt: "images/your_album_art_2.png" // ⬅️ දෙවෙනි සින්දුවේ cover photo eka
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let lastVolume = 0.7; // Default volume 

  // ===========================================
  // 2. HTML Elements Selection
  // ===========================================
  const audio = document.getElementById('background-music');
  const togglePlayBtn = document.getElementById('toggle-play-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');
  const currentTimeSpan = document.getElementById('current-time');
  const durationSpan = document.getElementById('duration');
  const volumeBar = document.getElementById('volume-bar');
  const muteBtn = document.getElementById('mute-btn');
  const headerTitleEl = document.getElementById('header-song-title');
  const currentTitleEl = document.getElementById('current-song-title');
  const currentArtistEl = document.getElementById('current-artist-name');
  const albumArtEl = document.getElementById('player-album-art');


  // ===========================================
  // 3. Core Player Functions
  // ===========================================

  function updatePlayPauseIcon() {
    if (isPlaying) {
      togglePlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      togglePlayBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  }

  function loadTrack(index) {
    const track = playlist[index];

    audio.src = track.src;
    headerTitleEl.textContent = track.headerTitle;
    currentTitleEl.textContent = track.title;
    currentArtistEl.textContent = track.artist;
    albumArtEl.src = track.albumArt;

    audio.load(); // අලුත් track එක browser එකට load කරන්න

    // Time display එක reset කරන්න
    updateTimeDisplay(0, 0);
    progressBar.value = 0;

    // 💡💡💡 AUTOPLAY FIX: Track මාරු කළ පසු, කලින් play වෙමින් තිබ්බේ නම්, නැවත play කරන්න 💡💡💡
    if (isPlaying) {
      audio.play().catch(e => console.warn('Autoplay was prevented by the browser on track change.', e));
    }
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    audio.play().catch(e => console.log('Play failed after track change:', e));
    isPlaying = true;
    updatePlayPauseIcon();
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    audio.play().catch(e => console.log('Play failed after track change:', e));
    isPlaying = true;
    updatePlayPauseIcon();
  }


  // ===========================================
  // 4. Initial Load & Autoplay Logic (Autoplay Start එක මෙන්න)
  // ===========================================

  // 1. Player එක load වෙද්දි පළවෙනි track එක load කරන්න
  loadTrack(currentTrackIndex);

  // 2. 🎯 පළමු වරට play වෙන්න උත්සාහ කිරීම (Autoplay)
  // Browser එකේ autoplay policy එක මේකෙන් bypass කරන්න try කරනවා
  audio.play().then(() => {
    isPlaying = true;
    updatePlayPauseIcon(); // Pause icon එක පෙන්වන්න
  }).catch(error => {
    // Autoplay fail උනොත්, Play icon එක පෙන්වන්න, user click එකක් එනකම් ඉන්න
    isPlaying = false;
    updatePlayPauseIcon();
    console.warn("Autoplay blocked. Waiting for user interaction to start music.");
  });


  // 3. Browser Autoplay Block කළොත්, user click කරපු ගමන් play කරන්න
  document.body.addEventListener('click', function attemptPlay() {
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        updatePlayPauseIcon();
      }).catch(error => {
        console.log("Autoplay still blocked, or an error occurred:", error);
      });
    }
    // පළමු click එකෙන් පසු listener එක ඉවත් කරන්න
    document.body.removeEventListener('click', attemptPlay);
  });

  // ===========================================
  // 5. Event Listeners
  // ===========================================

  // Play/Pause button eka
  togglePlayBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play();
      isPlaying = true;
    }
    updatePlayPauseIcon();
  });

  nextBtn.addEventListener('click', nextTrack);
  prevBtn.addEventListener('click', prevTrack);
  audio.addEventListener('ended', nextTrack);


  // Progress Bar Logic
  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
    updateTimeDisplay(audio.currentTime, audio.duration);
  });

  audio.addEventListener('loadedmetadata', () => {
    updateTimeDisplay(audio.currentTime, audio.duration);
    progressBar.max = audio.duration;
    progressBar.value = audio.currentTime;
  });

  progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  });


  // Volume Control Logic
  audio.volume = 0.7;
  volumeBar.value = 70;

  volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value / 100;
    updateMuteButtonIcon();
    lastVolume = audio.volume;
  });

  muteBtn.addEventListener('click', () => {
    if (audio.volume > 0) { // Mute karanna
      lastVolume = audio.volume;
      audio.volume = 0;
      volumeBar.value = 0;
    } else { // Unmute karanna
      audio.volume = lastVolume > 0 ? lastVolume : 0.7;
      volumeBar.value = audio.volume * 100;
    }
    updateMuteButtonIcon();
  });


  // ===========================================
  // 6. Utility Functions (Time/Volume Display)
  // ===========================================

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updateTimeDisplay(currentTime, duration) {
    currentTimeSpan.textContent = formatTime(currentTime);
    durationSpan.textContent = isNaN(duration) ? '0:00' : formatTime(duration);
  }

  function updateMuteButtonIcon() {
    if (audio.volume === 0) {
      muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else if (audio.volume < 0.5) {
      muteBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
    } else {
      muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  }
  updateMuteButtonIcon();

});
