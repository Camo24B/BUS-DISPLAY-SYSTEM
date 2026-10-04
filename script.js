const $ = id => document.getElementById(id);


/* =========================================================
   BUTTON SOUND
========================================================= */

const buttonSound = new Audio('musheran-beep-313342.mp3');
buttonSound.volume = 0.5;

function playButtonSound() {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}


/* =========================================================
   DEFAULT DESTINATION CODES
========================================================= */

const defaults = {

  '001': {
    route: '',
    dest: 'Not in Service',
    via: '',
    page3: ''
  },

  '501': {
    route: '',
    dest: 'Driver Training',
    via: '',
    page3: ''
  },

  '503': {
    route: '',
    dest: 'Tram Replacement',
    via: '',
    page3: ''
  },

  '504': {
    route: '',
    dest: 'Rail Replacement',
    via: '',
    page3: ''
  },

  '510': {
    route: '',
    dest: 'Football P&R',
    via: '',
    page3: ''
  },

  '511': {
    route: '',
    dest: 'Shuttle Bus',
    via: '',
    page3: ''
  },

  '512': {
    route: '',
    dest: 'Goose Fair',
    via: '',
    page3: ''
  },

  '521': {
    route: '',
    dest: 'TRAVEL SAFE',
    via: '',
    page3: ''
  },

  '522': {
    route: '',
    dest: 'Safety Zone',
    via: '',
    page3: ''
  },

  '523': {
    route: '',
    dest: 'Police Operation',
    via: '',
    page3: ''
  }

};


/* =========================================================
   CUSTOM DESTINATIONS
========================================================= */

let custom = {};

try {

  custom =
    JSON.parse(
      localStorage.getItem('busDestCodes') || '{}'
    );

} catch (e) {

  custom = {};

}


let entered = '';


/* =========================================================
   DISPLAY TIMER
========================================================= */

let displayTimer = null;


/*
   1 = Route + Destination
   2 = VIA
   3 = Page 3
*/

let currentPage = 1;


/* =========================================================
   CURRENT DISPLAY DATA
========================================================= */

window.currentRouteText = '';
window.currentDestText = '';
window.currentViaText = '';
window.currentPage3Text = '';


/* =========================================================
   SHOW CODE
========================================================= */

function showCode() {

  $('codeValue').textContent =
    entered.padEnd(3, '-');

}


/* =========================================================
   SET UP SCROLLING
========================================================= */

function setupScrolling(element) {

  if (!element) return null;


  element.classList.remove(
    'scrolling'
  );


  element.style.removeProperty(
    '--scroll-distance'
  );

  element.style.removeProperty(
    '--scroll-time'
  );


  element.style.transform =
    'translateX(0)';


  const availableWidth =
    element.clientWidth;

  const textWidth =
    element.scrollWidth;


  if (
    textWidth <=
    availableWidth + 2
  ) {

    return null;

  }


  const distance =
    textWidth -
    availableWidth;


  const scrollDistance =
    distance + 25;


  const scrollTime =
    Math.max(
      7,
      Math.min(
        18,
        scrollDistance / 25
      )
    );


  element.style.setProperty(
    '--scroll-distance',
    scrollDistance + 'px'
  );


  element.style.setProperty(
    '--scroll-time',
    scrollTime + 's'
  );


  element.classList.add(
    'scrolling'
  );


  return scrollTime * 1000;

}


/* =========================================================
   CHECK CURRENT PAGE FOR SCROLLING
========================================================= */

function getScrollTime() {

  const elements = [

    $('fDest'),
    $('sDest'),
    $('rDest')

  ];


  let longestTime = 0;


  elements.forEach(element => {

    if (!element) return;


    const availableWidth =
      element.clientWidth;


    const textWidth =
      element.scrollWidth;


    if (
      textWidth >
      availableWidth + 2
    ) {

      const distance =
        textWidth -
        availableWidth;


      const scrollDistance =
        distance + 25;


      const scrollTime =
        Math.max(
          7,
          Math.min(
            18,
            scrollDistance / 25
          )
        );


      longestTime =
        Math.max(
          longestTime,
          scrollTime * 1000
        );

    }

  });


  return longestTime;

}


/* =========================================================
   SET UP ALL DISPLAYS
========================================================= */

function setupAllScrolling() {

  setupScrolling(
    $('fDest')
  );

  setupScrolling(
    $('sDest')
  );

  setupScrolling(
    $('rDest')
  );

}


/* =========================================================
   GET NEXT AVAILABLE PAGE
========================================================= */

function getNextPage() {

  /*
     Page 1 → Page 2
  */

  if (
    currentPage === 1 &&
    window.currentViaText
  ) {

    return 2;

  }


  /*
     Page 1 → Page 3
     if there is no VIA.
  */

  if (
    currentPage === 1 &&
    !window.currentViaText &&
    window.currentPage3Text
  ) {

    return 3;

  }


  /*
     Page 2 → Page 3
  */

  if (
    currentPage === 2 &&
    window.currentPage3Text
  ) {

    return 3;

  }


  /*
     Page 2 → Page 1
     if there is no Page 3.
  */

  if (
    currentPage === 2 &&
    !window.currentPage3Text
  ) {

    return 1;

  }


  /*
     Page 3 → Page 1
  */

  if (currentPage === 3) {

    return 1;

  }


  return 1;

}


/* =========================================================
   SHOW PAGE CONTENT
========================================================= */

function displayPage(page) {

  const routeText =
    window.currentRouteText || '';

  const destText =
    window.currentDestText || '';

  const viaText =
    window.currentViaText || '';

  const page3Text =
    window.currentPage3Text || '';


  ['f', 's', 'r'].forEach(p => {

    const routeElement =
      $(p + 'Route');

    const destElement =
      $(p + 'Dest');


    if (!routeElement || !destElement) {
      return;
    }


    /*
       PAGE 1
    */

    if (page === 1) {

      routeElement.textContent =
        routeText;

      destElement.textContent =
        destText;

    }


    /*
       PAGE 2
    */

    else if (page === 2) {

      routeElement.textContent =
        '';

      destElement.textContent =
        viaText;

    }


    /*
       PAGE 3
    */

    else if (page === 3) {

      routeElement.textContent =
        '';

      destElement.textContent =
        page3Text;

    }

  });

}


/* =========================================================
   FADE TO NEXT PAGE
========================================================= */

function fadeToNextPage() {

  if (displayTimer) {

    clearTimeout(displayTimer);

    displayTimer = null;

  }


  const destinations = [

    $('fDest'),
    $('sDest'),
    $('rDest')

  ];


  /*
     START FADE
  */

  destinations.forEach(element => {

    if (!element) return;


    element.classList.remove(
      'page-fade'
    );


    /*
       Restart animation
    */

    void element.offsetWidth;


    element.classList.add(
      'page-fade'
    );

  });


  /*
     CHANGE PAGE IN THE MIDDLE
     OF THE FADE
  */

  setTimeout(() => {

    currentPage =
      getNextPage();


    displayPage(
      currentPage
    );


    /*
       WAIT FOR FADE TO FINISH
    */

    setTimeout(() => {

      destinations.forEach(element => {

        if (!element) return;


        element.classList.remove(
          'page-fade'
        );

      });


      setupAllScrolling();


      scheduleNextPage();

    }, 400);

  }, 350);

}


/* =========================================================
   START NEXT PAGE TIMER
========================================================= */

function scheduleNextPage() {

  if (displayTimer) {

    clearTimeout(displayTimer);

    displayTimer = null;

  }


  /*
     If there is no VIA and no Page 3,
     stay on Page 1.
  */

  if (
    !window.currentViaText &&
    !window.currentPage3Text
  ) {

    requestAnimationFrame(() => {

      setupAllScrolling();

    });

    return;

  }


  requestAnimationFrame(() => {

    setupAllScrolling();


    const scrollTime =
      getScrollTime();


    /*
       Give scrolling time to finish.

       Otherwise display page
       for 4 seconds.
    */

    const waitTime =
      scrollTime > 0
        ? scrollTime + 500
        : 4000;


    displayTimer =
      setTimeout(() => {

        fadeToNextPage();

      }, waitTime);

  });

}


/* =========================================================
   SHOW CURRENT PAGE
========================================================= */

function showCurrentPage() {

  displayPage(
    currentPage
  );

  scheduleNextPage();

}


/* =========================================================
   UPDATE BUS DISPLAY
========================================================= */

function updateBoard(
  code,
  route,
  dest,
  via = '',
  page3 = ''
) {

  if (displayTimer) {

    clearTimeout(displayTimer);

    displayTimer = null;

  }


  /*
     ALWAYS START ON PAGE 1
  */

  currentPage = 1;


  /*
     ROUTE OPTIONAL
  */

  const routeText =
    String(route || '')
      .trim()
      .toUpperCase();


  /*
     DESTINATION
  */

  const destText =
    String(dest || '')
      .trim()
      .toUpperCase();


  /*
     VIA OPTIONAL

     User types the full text,
     e.g.

     VIA MAPPERLEY
  */

  const viaText =
    String(via || '')
      .trim()
      .toUpperCase();


  /*
     PAGE 3 OPTIONAL
  */

  const page3Text =
    String(page3 || '')
      .trim()
      .toUpperCase();


  /*
     STORE CURRENT DATA
  */

  window.currentRouteText =
    routeText;

  window.currentDestText =
    destText;

  window.currentViaText =
    viaText;

  window.currentPage3Text =
    page3Text;


  /*
     DISPLAY PAGE 1
  */

  displayPage(1);


  /*
     START PAGE TIMER
  */

  scheduleNextPage();


  /*
     ACTIVE CODE
  */

  $('activeCode').textContent =
    'CODE ' + code;


  /*
     STATUS
  */

  $('status').textContent =
    'Destination loaded · ' +
    (
      routeText
        ? routeText + ' '
        : ''
    ) +
    destText;


  /*
     FEEDBACK
  */

  $('feedback').textContent =
    'Loaded code ' +
    code +
    '. Enter another code to change destination.';

}


/* =========================================================
   ENTER CODE
========================================================= */

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

    item.route || '',

    item.dest || '',

    item.via || '',

    item.page3 || ''

  );

}


/* =========================================================
   NUMBER KEYPAD
========================================================= */

document
  .querySelectorAll('[data-key]')
  .forEach(btn => {

    btn.addEventListener(
      'click',
      () => {

        playButtonSound();


        if (
          entered.length < 3
        ) {

          entered +=
            btn.dataset.key;

          showCode();

        }

      }
    );

  });


/* =========================================================
   CLEAR
========================================================= */

$('clear').addEventListener(
  'click',
  () => {

    playButtonSound();


    entered = '';


    if (displayTimer) {

      clearTimeout(
        displayTimer
      );

      displayTimer = null;

    }


    showCode();


    $('feedback').textContent =
      'Code cleared.';

  }
);


/* =========================================================
   BACKSPACE
========================================================= */

$('back').addEventListener(
  'click',
  () => {

    playButtonSound();


    entered =
      entered.slice(0, -1);


    showCode();

  }
);


/* =========================================================
   ENTER BUTTON
========================================================= */

$('enter').addEventListener(
  'click',
  () => {

    playButtonSound();


    enterCode();

  }
);


/* =========================================================
   COMPUTER KEYBOARD
========================================================= */

document.addEventListener(
  'keydown',
  e => {


    /*
       NUMBER
    */

    if (
      /^\d$/.test(e.key) &&
      entered.length < 3
    ) {

      entered += e.key;

      showCode();

    }


    /*
       BACKSPACE
    */

    else if (
      e.key === 'Backspace'
    ) {

      entered =
        entered.slice(0, -1);

      showCode();

    }


    /*
       ENTER
    */

    else if (
      e.key === 'Enter'
    ) {

      enterCode();

    }

  }
);


/* =========================================================
   RENDER DESTINATION LIST
========================================================= */

function renderCodes() {

  const list =
    $('codeList');


  list.innerHTML = '';


  Object.entries({

    ...defaults,
    ...custom

  })


  .sort(
    ([a], [b]) =>
      a.localeCompare(b)
  )


  .forEach(
    ([code, item]) => {


      const row =
        document.createElement(
          'div'
        );


      row.className =
        'code-item';


      const name =
        document.createElement(
          'span'
        );


      /*
         BUILD DISPLAY NAME
      */

      let displayName =
        code;


      /*
         ROUTE
      */

      if (item.route) {

        displayName +=
          ' · ' + item.route;

      }


      /*
         DESTINATION
      */

      displayName +=
        ' — ' +
        item.dest;


      /*
         VIA
      */

      if (item.via) {

        displayName +=
          ' ' + item.via;

      }


      /*
         PAGE 3
      */

      if (item.page3) {

        displayName +=
          ' | ' + item.page3;

      }


      name.textContent =
        displayName;


      row.appendChild(
        name
      );


      /* =====================================================
         CUSTOM CODE CONTROLS
      ===================================================== */

      if (custom[code]) {


        /*
           EDIT
        */

        const edit =
          document.createElement(
            'button'
          );


        edit.textContent =
          'EDIT';


        edit.addEventListener(
          'click',
          () => {

            playButtonSound();


            $('newCode').value =
              code;


            $('newRoute').value =
              item.route || '';


            $('newDest').value =
              item.dest || '';


            $('newVia').value =
              item.via || '';


            $('newPage3').value =
              item.page3 || '';


            $('feedback').textContent =
              'Editing code ' +
              code +
              '. Change the details and press SAVE.';


            $('newCode').scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });

          }
        );


        row.appendChild(
          edit
        );


        /*
           DELETE
        */

        const del =
          document.createElement(
            'button'
          );


        del.textContent =
          'DELETE';


        del.addEventListener(
          'click',
          () => {

            playButtonSound();


            delete custom[code];


            localStorage.setItem(
              'busDestCodes',
              JSON.stringify(custom)
            );


            renderCodes();


            $('feedback').textContent =
              'Deleted destination code ' +
              code +
              '.';

          }
        );


        row.appendChild(
          del
        );

      }


      list.appendChild(
        row
      );

    }
  );

}


/* =========================================================
   SAVE CUSTOM DESTINATION
========================================================= */

$('save').addEventListener(
  'click',
  () => {

    playButtonSound();


    /*
       CODE
    */

    const code =
      $('newCode')
        .value
        .trim();


    /*
       ROUTE OPTIONAL
    */

    const route =
      $('newRoute')
        .value
        .trim();


    /*
       DESTINATION REQUIRED
    */

    const dest =
      $('newDest')
        .value
        .trim();


    /*
       VIA OPTIONAL
    */

    const via =
      $('newVia')
        .value
        .trim();


    /*
       PAGE 3 OPTIONAL
    */

    const page3 =
      $('newPage3')
        .value
        .trim();


    /* =====================================================
       VALIDATION
    ===================================================== */

    if (
      !/^\d{3}$/.test(code)
    ) {

      $('feedback').textContent =
        'Enter a 3-digit destination code.';

      return;

    }


    if (!dest) {

      $('feedback').textContent =
        'Enter a destination.';

      return;

    }


    /* =====================================================
       SAVE
    ===================================================== */

    custom[code] = {

      route: route,

      dest: dest,

      via: via,

      page3: page3

    };


    localStorage.setItem(
      'busDestCodes',
      JSON.stringify(custom)
    );


    /*
       LOAD DESTINATION
    */

    entered =
      code;


    showCode();


    updateBoard(

      code,

      route,

      dest,

      via,

      page3

    );


    /*
       UPDATE LIST
    */

    renderCodes();


    /*
       CLEAR FORM
    */

    $('newCode').value =
      '';

    $('newRoute').value =
      '';

    $('newDest').value =
      '';

    $('newVia').value =
      '';

    $('newPage3').value =
      '';

  }
);


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
  'resize',
  () => {

    if (displayTimer) {

      clearTimeout(
        displayTimer
      );

      displayTimer = null;

    }


    requestAnimationFrame(
      () => {

        setupAllScrolling();

      }
    );

  }
);


/* =========================================================
   START
========================================================= */

showCode();

renderCodes();