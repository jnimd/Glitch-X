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