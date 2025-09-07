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
