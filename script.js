const $ = id => document.getElementById(id);

/* BUTTON SOUND */
const buttonSound = new Audio('musheran-beep-313342.mp3');
buttonSound.volume = 0.5;

function playButtonSound() {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}


/* DEFAULT DESTINATION CODES */
const defaults = {
  '001': { route:'', dest:'Not in Service', via:'' },
  '501': { route:'', dest:'Driver Training', via:'' },
  '503': { route:'', dest:'Tram Replacement', via:'' },
  '504': { route:'', dest:'Rail Replacement', via:'' },
  '510': { route:'', dest:'Football P&R', via:'' },
  '511': { route:'', dest:'Shuttle Bus', via:'' },
  '512': { route:'', dest:'Goose Fair', via:'' },
  '521': { route:'', dest:'TRAVEL SAFE', via:'' },
  '522': { route:'', dest:'Safety Zone', via:'' },
  '523': { route:'', dest:'Police Operation', via:'' }
};


/* CUSTOM DESTINATIONS */
let custom = {};

try {
  custom = JSON.parse(localStorage.getItem('busDestCodes') || '{}');
} catch (e) {
  custom = {};
}

let entered = '';


/* DISPLAY TIMER */
let displayTimer = null;
let currentPage = 1;


/* SHOW CODE */
function showCode() {
  $('codeValue').textContent = entered.padEnd(3, '-');
}


/* SET UP SCROLLING */
function setupScrolling(element) {
  if (!element) return null;

  element.classList.remove('scrolling');

  element.style.removeProperty('--scroll-distance');
  element.style.removeProperty('--scroll-time');

  element.style.transform = 'translateX(0)';

  const availableWidth = element.clientWidth;
  const textWidth = element.scrollWidth;

  if (textWidth <= availableWidth + 2) {
    return null;
  }

  const distance = textWidth - availableWidth;
  const scrollDistance = distance + 25;

  const scrollTime = Math.max(
    7,
    Math.min(18, scrollDistance / 25)
  );

  element.style.setProperty(
    '--scroll-distance',
    scrollDistance + 'px'
  );

  element.style.setProperty(
    '--scroll-time',
    scrollTime + 's'
  );

  element.classList.add('scrolling');

  return scrollTime * 1000;
}


/* CHECK CURRENT PAGE FOR SCROLLING */
function getScrollTime() {
  const elements = [
    $('fDest'),
    $('sDest'),
    $('rDest')
  ];

  let longestTime = 0;

  elements.forEach(element => {
    if (!element) return;

    const availableWidth = element.clientWidth;
    const textWidth = element.scrollWidth;

    if (textWidth > availableWidth + 2) {
      const distance = textWidth - availableWidth;
      const scrollDistance = distance + 25;

      const scrollTime = Math.max(
        7,
        Math.min(18, scrollDistance / 25)
      );

      longestTime = Math.max(
        longestTime,
        scrollTime * 1000
      );
    }
  });

  return longestTime;
}


/* SET UP ALL DISPLAYS */
function setupAllScrolling() {
  setupScrolling($('fDest'));
  setupScrolling($('sDest'));
  setupScrolling($('rDest'));
}


/* FADE TO NEXT PAGE */
function fadeToNextPage(viaText) {

  if (displayTimer) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }

  const destinations = [
    $('fDest'),
    $('sDest'),
    $('rDest')
  ];

  /* Start fade out */
  destinations.forEach(element => {
    if (!element) return;

    element.classList.remove('page-fade');

    /* Restart animation */
    void element.offsetWidth;

    element.classList.add('page-fade');
  });


  /*
    Wait until the middle of the fade,
    then change the actual page text.
  */
  setTimeout(() => {

    currentPage = currentPage === 1 ? 2 : 1;

    const routeText = window.currentRouteText || '';
    const destText = window.currentDestText || '';

    ['f', 's', 'r'].forEach(p => {

      const routeElement = $(p + 'Route');
      const destElement = $(p + 'Dest');

      /* Stop any previous scrolling */
      destElement.classList.remove('scrolling');

      destElement.style.removeProperty('--scroll-distance');
      destElement.style.removeProperty('--scroll-time');

      destElement.style.transform = 'translateX(0)';


      /* PAGE 1 */
      if (currentPage === 1) {

        routeElement.textContent = routeText;
        destElement.textContent = destText;

      }

      /* PAGE 2 */
      else {

        routeElement.textContent = '';

        destElement.textContent =
          viaText ? 'VIA ' + viaText : '';
      }
    });

    /*
      Wait for the fade to finish before
      starting the scrolling.
    */
    setTimeout(() => {

      destinations.forEach(element => {
        if (!element) return;

        element.classList.remove('page-fade');
      });

      setupAllScrolling();

      scheduleNextPage(viaText);

    }, 400);

  }, 350);
}


/* START NEXT PAGE TIMER */
function scheduleNextPage(viaText) {

  if (displayTimer) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }

  /*
    If there is no VIA text, stay on Page 1.
  */
  if (!viaText) {
    requestAnimationFrame(() => {
      setupAllScrolling();
    });

    return;
  }


  requestAnimationFrame(() => {

    setupAllScrolling();

    const scrollTime = getScrollTime();

    /*
      If scrolling is needed:
      wait until scrolling finishes.

      If no scrolling:
      show each page for 4 seconds.
    */
    const waitTime =
      scrollTime > 0
        ? scrollTime + 500
        : 4000;


    displayTimer = setTimeout(() => {

      fadeToNextPage(viaText);

    }, waitTime);

  });
}


/* SHOW CURRENT PAGE */
function showCurrentPage(viaText) {

  const routeText =
    window.currentRouteText || '';

  const destText =
    window.currentDestText || '';


  ['f', 's', 'r'].forEach(p => {

    const routeElement = $(p + 'Route');
    const destElement = $(p + 'Dest');


    if (currentPage === 1) {

      routeElement.textContent =
        routeText;

      destElement.textContent =
        destText;

    }

    else {

      routeElement.textContent = '';

      destElement.textContent =
        viaText ? 'VIA ' + viaText : '';

    }

  });


  scheduleNextPage(viaText);
}


/* UPDATE BUS DISPLAY */
function updateBoard(code, route, dest, via = '') {

  if (displayTimer) {
    clearTimeout(displayTimer);
    displayTimer = null;
  }


  currentPage = 1;


  const routeText =
    String(route || '').toUpperCase();

  const destText =
    String(dest || '').toUpperCase();

  const viaText =
    String(via || '').toUpperCase();


  window.currentRouteText =
    routeText;

  window.currentDestText =
    destText;


  ['f', 's', 'r'].forEach(p => {

    $(p + 'Route').textContent =
      routeText;

    $(p + 'Dest').textContent =
      destText;

  });


  scheduleNextPage(viaText);


  $('activeCode').textContent =
    'CODE ' + code;


  $('status').textContent =
    'Destination loaded · ' +
    route + ' ' + dest;


  $('feedback').textContent =
    'Loaded code ' + code +
    '. Enter another code to change destination.';
}


/* ENTER CODE */
function enterCode() {

  if (entered.length !== 3) {

    $('feedback').textContent =
      'Enter a 3-digit destination code first.';

    return;
  }


  const item =
    custom[entered] ||
    defaults[entered];


  if (!item) {

    $('feedback').textContent =
      'Code not found. Add it under “Manage destination codes”.';

    return;
  }


  updateBoard(
    entered,
    item.route,
    item.dest,
    item.via || ''
  );
}


/* NUMBER KEYPAD */
document.querySelectorAll('[data-key]').forEach(btn => {

  btn.addEventListener('click', () => {

    playButtonSound();

    if (entered.length < 3) {

      entered += btn.dataset.key;

      showCode();
    }

  });

});


/* CLEAR */
$('clear').addEventListener('click', () => {

  playButtonSound();

  entered = '';


  if (displayTimer) {

    clearTimeout(displayTimer);

    displayTimer = null;
  }


  showCode();


  $('feedback').textContent =
    'Code cleared.';
});


/* BACKSPACE */
$('back').addEventListener('click', () => {

  playButtonSound();

  entered =
    entered.slice(0, -1);

  showCode();

});


/* ENTER BUTTON */
$('enter').addEventListener('click', () => {

  playButtonSound();

  enterCode();

});


/* COMPUTER KEYBOARD */
document.addEventListener('keydown', e => {

  if (/^\d$/.test(e.key) &&
      entered.length < 3) {

    entered += e.key;

    showCode();

  }

  else if (e.key === 'Backspace') {

    entered =
      entered.slice(0, -1);

    showCode();

  }

  else if (e.key === 'Enter') {

    enterCode();

  }

});


/* RENDER DESTINATION LIST */
function renderCodes() {

  const list =
    $('codeList');

  list.innerHTML = '';


  Object.entries({
    ...defaults,
    ...custom
  })

  .sort(([a], [b]) =>
    a.localeCompare(b)
  )

  .forEach(([code, item]) => {

    const row =
      document.createElement('div');

    row.className =
      'code-item';


    const name =
      document.createElement('span');

    name.textContent =
      code +
      ' · ' +
      item.route +
      ' — ' +
      item.dest +
      (item.via
        ? ' via ' + item.via
        : '');

    row.appendChild(name);


    /* CUSTOM CODE CONTROLS */
    if (custom[code]) {

      const edit =
        document.createElement('button');

      edit.textContent =
        'EDIT';


      edit.addEventListener('click', () => {

        playButtonSound();


        $('newCode').value =
          code;

        $('newRoute').value =
          item.route;

        $('newDest').value =
          item.dest;

        $('newVia').value =
          item.via || '';


        $('feedback').textContent =
          'Editing code ' +
          code +
          '. Change the details and press SAVE.';


        $('newCode').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

      });


      row.appendChild(edit);


      /* DELETE */
      const del =
        document.createElement('button');

      del.textContent =
        'DELETE';


      del.addEventListener('click', () => {

        playButtonSound();


        delete custom[code];


        localStorage.setItem(
          'busDestCodes',
          JSON.stringify(custom)
        );


        renderCodes();


        $('feedback').textContent =
          'Deleted destination code ' +
          code + '.';

      });


      row.appendChild(del);
    }


    list.appendChild(row);

  });

}


/* SAVE CUSTOM DESTINATION */
$('save').addEventListener('click', () => {

  playButtonSound();


  const code =
    $('newCode').value.trim();

  const route =
    $('newRoute').value.trim();

  const dest =
    $('newDest').value.trim();

  const via =
    $('newVia').value.trim();


  if (
    !/^\d{3}$/.test(code) ||
    !route ||
    !dest
  ) {

    $('feedback').textContent =
      'Enter a 3-digit code, route number and destination.';

    return;
  }


  custom[code] = {
    route,
    dest,
    via
  };


  localStorage.setItem(
    'busDestCodes',
    JSON.stringify(custom)
  );


  entered = code;

  showCode();


  updateBoard(
    code,
    route,
    dest,
    via
  );


  renderCodes();


  $('newCode').value = '';
  $('newRoute').value = '';
  $('newDest').value = '';
  $('newVia').value = '';

});


/* RESIZE */
window.addEventListener('resize', () => {

  if (displayTimer) {

    clearTimeout(displayTimer);

    displayTimer = null;
  }


  requestAnimationFrame(() => {

    setupAllScrolling();

  });

});


/* START */
showCode();
renderCodes();