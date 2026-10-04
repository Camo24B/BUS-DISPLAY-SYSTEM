const $ = id => document.getElementById(id);


// ===============================
// BUTTON SOUND
// ===============================

const buttonSound = new Audio('musheran-beep-313342.mp3');

buttonSound.volume = 0.5;

function playButtonSound(){
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
}


// ===============================
// DEFAULT DESTINATION CODES
// ===============================

const defaults = {

  '001': {
    route: '',
    dest: 'Not in Service',
    via: ''
  },

  '501': {
    route: '',
    dest: 'Driver Training',
    via: ''
  },

  '503': {
    route: '',
    dest: 'Tram Replacement',
    via: ''
  },

  '504': {
    route: '',
    dest: 'Rail Replacement',
    via: ''
  },

  '510': {
    route: '',
    dest: 'Football P&R',
    via: ''
  },

  '511': {
    route: '',
    dest: 'Shuttle Bus',
    via: ''
  },

  '512': {
    route: '',
    dest: 'Goose Fair',
    via: ''
  },

  '521': {
    route: '',
    dest: 'TRAVEL SAFE',
    via: ''
  },

  '522': {
    route: '',
    dest: 'Safety Zone',
    via: ''
  },

  '523': {
    route: '',
    dest: 'Police Operation',
    via: ''
  }

};


// ===============================
// LOAD CUSTOM DESTINATIONS
// ===============================

let custom = {};

try {

  custom = JSON.parse(
    localStorage.getItem('busDestCodes') || '{}'
  );

} catch(e) {

  custom = {};

}


let entered = '';


// ===============================
// DISPLAY ENTERED CODE
// ===============================

function showCode(){

  $('codeValue').textContent =
    entered.padEnd(3, '-');

}


// ===============================
// UPDATE DESTINATION BOARD
// ===============================

function updateBoard(code, route, dest, via = ''){

  const text =
    (dest + (via ? ' VIA ' + via : ''))
    .toUpperCase();

  ['f', 's', 'r'].forEach(p => {

    $(p + 'Route').textContent =
      route.toUpperCase();

    $(p + 'Dest').textContent =
      text;

  });

  $('activeCode').textContent =
    'CODE ' + code;

  $('status').textContent =
    'Destination loaded · ' +
    route + ' ' +
    dest;

  $('feedback').textContent =
    'Loaded code ' + code +
    '. Enter another code to change destination.';

}


// ===============================
// ENTER DESTINATION CODE
// ===============================

function enterCode(){

  if(entered.length !== 3){

    $('feedback').textContent =
      'Enter a 3-digit destination code first.';

    return;
  }

  const item =
    custom[entered] ||
    defaults[entered];

  if(!item){

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


// ===============================
// NUMBER KEYPAD
// ===============================

document.querySelectorAll('[data-key]').forEach(btn => {

  btn.addEventListener('click', () => {

    playButtonSound();

    if(entered.length < 3){

      entered += btn.dataset.key;

      showCode();

    }

  });

});


// ===============================
// CLEAR BUTTON
// ===============================

$('clear').addEventListener('click', () => {

  playButtonSound();

  entered = '';

  showCode();

  $('feedback').textContent =
    'Code cleared.';

});


// ===============================
// BACKSPACE BUTTON
// ===============================

$('back').addEventListener('click', () => {

  playButtonSound();

  entered =
    entered.slice(0, -1);

  showCode();

});


// ===============================
// ENTER BUTTON
// ===============================

$('enter').addEventListener('click', () => {

  playButtonSound();

  enterCode();

});


// ===============================
// COMPUTER KEYBOARD
// ===============================

document.addEventListener('keydown', e => {

  if(/^\d$/.test(e.key) && entered.length < 3){

    entered += e.key;

    showCode();

  }

  else if(e.key === 'Backspace'){

    entered =
      entered.slice(0, -1);

    showCode();

  }

  else if(e.key === 'Enter'){

    enterCode();

  }

});


// ===============================
// DISPLAY DESTINATION LIST
// ===============================

function renderCodes(){

  const list = $('codeList');

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


    // Destination name

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


    // ===========================
    // CUSTOM DESTINATION BUTTONS
    // ===========================

    if(custom[code]){


      // EDIT BUTTON

      const edit =
        document.createElement('button');

      edit.textContent =
        'EDIT';


      edit.addEventListener('click', () => {

        playButtonSound();


        // Load destination into form

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


        // Scroll to form

        $('newCode').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

      });


      row.appendChild(edit);


      // =========================
      // DELETE BUTTON
      // =========================

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
          code +
          '.';

      });


      row.appendChild(del);

    }


    list.appendChild(row);

  });

}


// ===============================
// SAVE / ADD DESTINATION
// ===============================

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


  // Validate

  if(
    !/^\d{3}$/.test(code) ||
    !route ||
    !dest
  ){

    $('feedback').textContent =
      'Enter a 3-digit code, route number and destination.';

    return;

  }


  // Save custom destination

  custom[code] = {
    route,
    dest,
    via
  };


  // Save to browser storage

  localStorage.setItem(
    'busDestCodes',
    JSON.stringify(custom)
  );


  // Load destination

  entered = code;

  showCode();


  updateBoard(
    code,
    route,
    dest,
    via
  );


  // Refresh list

  renderCodes();


  // Clear form

  $('newCode').value = '';

  $('newRoute').value = '';

  $('newDest').value = '';

  $('newVia').value = '';

});


// ===============================
// START
// ===============================

showCode();

renderCodes();
