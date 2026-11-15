new Swiper(".mixes-swiper", {
  loop: true,
  spaceBetween: 24,
  slidesPerView: 1,
  autoplay: {
    delay: 3500,
    pauseOnMouseEnter: true,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".mixes-pagination",
    clickable: true,
  },
  navigation: {
    prevEl: ".mixes-prev",
    nextEl: ".mixes-next",
  },
  a11y: {
    prevSlideMessage: "Попередній мікс",
    nextSlideMessage: "Наступний мікс",
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

Fancybox.bind("[data-fancybox='coffee-gallery']", {
  Carousel: {
    Transition: "fade",
  },
  Images: {
    Panzoom: {
      maxScale: 3,
    },
  },
});

new Typed("#typed-text", {
  strings: [
    "Створи свій ідеальний кавовий мікс.",
    "Обирай пропорції сортів.",
    "Свіжа кава з доставкою до дверей.",
  ],
  typeSpeed: 50,
  backSpeed: 30,
  backDelay: 1500,
  loop: true,
});
