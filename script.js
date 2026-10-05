const weddingDate = new Date('2027-01-09T14:00:00-05:00');

function tick() {
  const now = new Date();
  let d = Math.max(0, weddingDate - now);

  const days = Math.floor(d / 86400000);
  d %= 86400000;

  const hours = Math.floor(d / 3600000);
  d %= 3600000;

  const minutes = Math.floor(d / 60000);
  const seconds = Math.floor((d % 60000) / 1000);

  [
    ['days', days],
    ['hours', hours],
    ['minutes', minutes],
    ['seconds', seconds]
  ].forEach(([id, value]) => {
    const el = document.getElementById(id);

    if (el) {
      el.textContent = String(value).padStart(2, '0');
    }
  });
}

tick();
setInterval(tick, 1000);


// ==========================================
// MENÚ MÓVIL
// ==========================================

const menuBtn = document.querySelector('.menu-btn');
const menu = document.querySelector('.menu');

if (menuBtn && menu) {

  menuBtn.addEventListener('click', () => {

    const open = menu.classList.toggle('open');

    menuBtn.setAttribute('aria-expanded', open);

  });

  menu.querySelectorAll('a').forEach(a => {

    a.addEventListener('click', () => {
      menu.classList.remove('open');
    });

  });

}


// ==========================================
// ANIMACIONES
// ==========================================

const io = new IntersectionObserver(

  entries => entries.forEach(entry => {

    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }

  }),

  {
    threshold: 0.12
  }

);

document
  .querySelectorAll('.reveal')
  .forEach(el => io.observe(el));


// ==========================================
// RSVP REAL
// GOOGLE SHEETS + APPS SCRIPT
// ==========================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbxrkAm4OFH26KCNLQj2BkSg5tNXGbpF6XnNY14qRGBUZQyCJKPPFs-S0MXK8ICb9Hfu/exec';


// Elementos del formulario

const code =
  document.getElementById('inviteCode');

const lookup =
  document.getElementById('lookupBtn');

const panel =
  document.getElementById('invitePanel');

const nameEl =
  document.getElementById('inviteName');

const capEl =
  document.getElementById('inviteCapacity');

const count =
  document.getElementById('guestCount');

const attendance =
  document.getElementById('attendance');

const countWrap =
  document.getElementById('guestCountWrap');

const status =
  document.getElementById('formStatus');

const form =
  document.getElementById('rsvpForm');

const message =
  document.getElementById('message');


let activeInvite = null;


// ==========================================
// MENSAJES DEL RSVP
// ==========================================

function showStatus(text) {

  if (status) {
    status.textContent = text;
  }

}


// ==========================================
// BUSCAR INVITACIÓN
// ==========================================

async function loadInvite(rawCode) {

  const key =
    String(rawCode || '')
      .trim()
      .toUpperCase();


  if (!key) {

    if (panel) {
      panel.hidden = true;
    }

    showStatus(
      'No se encontró el código de esta invitación.'
    );

    return;
  }


  showStatus(
    'Cargando tu invitación…'
  );


  try {

    const response =
      await fetch(
        `${API_URL}?i=${encodeURIComponent(key)}`,
        {
          cache: 'no-store'
        }
      );


    if (!response.ok) {

      throw new Error(
        'Error al consultar la invitación.'
      );

    }


    const data =
      await response.json();


    if (!data.ok) {

      activeInvite = null;

      if (panel) {
        panel.hidden = true;
      }

      showStatus(
        data.error ||
        'Invitación no encontrada.'
      );

      return;
    }


    activeInvite = {

      code:
        data.codigo,

      name:
        data.nombre,

      capacity:
        Number(data.cupos) || 1

    };


    // Guardamos código

    if (code) {

      code.value =
        activeInvite.code;

    }


    // Nombre del invitado

    if (nameEl) {

      nameEl.textContent =
        activeInvite.name;

    }


    // Cupos

    if (capEl) {

      if (activeInvite.capacity === 1) {

        capEl.textContent =
          'Tienes 1 lugar reservado.';

      } else {

        capEl.textContent =
          `Tienen ${activeInvite.capacity} lugares reservados.`;

      }

    }


    // Selector de cantidad

    if (count) {

      count.innerHTML = '';


      for (
        let i = 1;
        i <= activeInvite.capacity;
        i++
      ) {

        count.add(
          new Option(i, i)
        );

      }

    }


    // Mostrar formulario

    if (panel) {

      panel.hidden = false;

    }


    showStatus('');


  } catch (error) {

    console.error(error);


    activeInvite = null;


    if (panel) {

      panel.hidden = true;

    }


    showStatus(
      'No pudimos cargar tu invitación. Intenta nuevamente.'
    );

  }

}


// ==========================================
// BOTÓN BUSCAR
// Compatibilidad con el HTML actual
// ==========================================

if (lookup && code) {

  lookup.addEventListener(
    'click',
    () => {

      loadInvite(
        code.value
      );

    }
  );

}


// ==========================================
// ASISTENCIA
// ==========================================

if (
  attendance &&
  countWrap
) {

  attendance.addEventListener(
    'change',
    () => {

      countWrap.hidden =
        attendance.value === 'no';

    }
  );

}


// ==========================================
// GUARDAR CONFIRMACIÓN
// ==========================================

if (form) {

  form.addEventListener(
    'submit',

    async event => {

      event.preventDefault();


      if (!activeInvite) {

        showStatus(
          'No se ha cargado una invitación válida.'
        );

        return;

      }


      if (
        !attendance ||
        !attendance.value
      ) {

        showStatus(
          'Indícanos si podrás acompañarnos.'
        );

        return;

      }


      const payload = {

        codigo:
          activeInvite.code,

        asistencia:
          attendance.value,

        confirmados:
          attendance.value === 'yes' && count
            ? Number(count.value)
            : 0,

        observaciones:
          message
            ? message.value.trim()
            : ''

      };


      showStatus(
        'Guardando tu confirmación…'
      );


      try {

        const response =
          await fetch(
            API_URL,
            {

              method:
                'POST',

              headers: {

                'Content-Type':
                  'text/plain;charset=utf-8'

              },

              body:
                JSON.stringify(payload)

            }
          );


        if (!response.ok) {

          throw new Error(
            'Error al guardar.'
          );

        }


        const result =
          await response.json();


        if (!result.ok) {

          throw new Error(
            result.error ||
            'Error al guardar.'
          );

        }


        if (
          attendance.value === 'yes'
        ) {

          showStatus(
            '✓ ¡Gracias! Tu asistencia quedó confirmada.'
          );

        } else {

          showStatus(
            '✓ Gracias por avisarnos. Hemos registrado tu respuesta.'
          );

        }


      } catch (error) {

        console.error(error);


        showStatus(
          'No pudimos guardar tu confirmación. Intenta nuevamente.'
        );

      }

    }

  );

}


// ==========================================
// ENLACE PERSONALIZADO
// Ejemplo:
// ?i=WD-001
// ==========================================

const urlCode =
  new URLSearchParams(
    window.location.search
  ).get('i');


if (urlCode) {

  if (code) {

    code.value =
      urlCode.toUpperCase();

  }


  // Cargar automáticamente
  loadInvite(urlCode);


} else {

  if (panel) {

    panel.hidden = true;

  }


  showStatus(
    'Abre el enlace personalizado que recibiste con tu invitación.'
  );

}
