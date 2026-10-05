// =====================================================
// WALTER & DAYERLIN
// SCRIPT PRINCIPAL
// =====================================================


// =====================================================
// CUENTA REGRESIVA
// =====================================================

const weddingDate =
  new Date('2027-01-09T14:00:00-05:00');


function tick() {

  const now = new Date();

  let d =
    Math.max(
      0,
      weddingDate - now
    );


  const days =
    Math.floor(
      d / 86400000
    );

  d %= 86400000;


  const hours =
    Math.floor(
      d / 3600000
    );

  d %= 3600000;


  const minutes =
    Math.floor(
      d / 60000
    );


  const seconds =
    Math.floor(
      (d % 60000) / 1000
    );


  const values = [
    ['days', days],
    ['hours', hours],
    ['minutes', minutes],
    ['seconds', seconds]
  ];


  values.forEach(
    ([id, value]) => {

      const element =
        document.getElementById(id);

      if (element) {

        element.textContent =
          String(value)
            .padStart(2, '0');

      }

    }
  );

}


tick();

setInterval(
  tick,
  1000
);



// =====================================================
// MENÚ MÓVIL
// =====================================================

const menuBtn =
  document.querySelector(
    '.menu-btn'
  );


const menu =
  document.querySelector(
    '.menu'
  );


if (menuBtn && menu) {

  menuBtn.addEventListener(
    'click',
    () => {

      const open =
        menu.classList.toggle(
          'open'
        );


      menuBtn.setAttribute(
        'aria-expanded',
        open
      );

    }
  );


  menu
    .querySelectorAll('a')
    .forEach(link => {

      link.addEventListener(
        'click',
        () => {

          menu.classList.remove(
            'open'
          );

        }
      );

    });

}



// =====================================================
// ANIMACIONES
// =====================================================

const observer =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (
          entry.isIntersecting
        ) {

          entry.target
            .classList
            .add('visible');

        }

      });

    },

    {
      threshold: 0.12
    }

  );


document
  .querySelectorAll('.reveal')
  .forEach(element => {

    observer.observe(element);

  });



// =====================================================
// GOOGLE APPS SCRIPT
// =====================================================

const API_URL =
  'https://script.google.com/macros/s/AKfycbxrkAm4OFH26KCNLQj2BkSg5tNXGbpF6XnNY14qRGBUZQyCJKPPFs-S0MXK8ICb9Hfu/exec';



// =====================================================
// ELEMENTOS RSVP
// =====================================================

const inviteName =
  document.getElementById(
    'personalInviteName'
  );


const inviteText =
  document.getElementById(
    'personalInviteText'
  );


const rsvpForm =
  document.getElementById(
    'personalRsvpForm'
  );


const attendance =
  document.getElementById(
    'personalAttendance'
  );


const guestCountWrap =
  document.getElementById(
    'personalGuestCountWrap'
  );


const guestCount =
  document.getElementById(
    'personalGuestCount'
  );


const message =
  document.getElementById(
    'personalMessage'
  );


const rsvpStatus =
  document.getElementById(
    'personalRsvpStatus'
  );



let activeInvite = null;



// =====================================================
// MOSTRAR MENSAJE
// =====================================================

function showStatus(text) {

  if (rsvpStatus) {

    rsvpStatus.textContent =
      text;

  }

}



// =====================================================
// OBTENER CÓDIGO DEL LINK
// =====================================================

const params =
  new URLSearchParams(
    window.location.search
  );


const inviteCode =
  String(
    params.get('i') || ''
  )
    .trim()
    .toUpperCase();



// =====================================================
// CARGAR INVITACIÓN
// =====================================================

async function loadInvitation() {


  if (!inviteCode) {

    if (inviteName) {

      inviteName.textContent =
        'Invitación personalizada';

    }


    if (inviteText) {

      inviteText.textContent =
        'Abre el enlace personal que recibiste para consultar tu invitación.';

    }


    showStatus('');

    return;

  }


  if (inviteName) {

    inviteName.textContent =
      'Cargando...';

  }


  showStatus(
    'Consultando tu invitación...'
  );


  try {


    const response =
      await fetch(

        `${API_URL}?i=${encodeURIComponent(inviteCode)}`,

        {
          method: 'GET',
          cache: 'no-store'
        }

      );


    if (!response.ok) {

      throw new Error(
        'No fue posible consultar la invitación.'
      );

    }


    const data =
      await response.json();


    if (!data.ok) {

      throw new Error(
        data.error ||
        'Invitación no encontrada.'
      );

    }



    // Guardamos únicamente lo necesario

    activeInvite = {

      codigo:
        data.codigo,

      nombre:
        data.nombre,

      cupos:
        Number(data.cupos) || 1,

      estado:
        data.estado || 'Pendiente'

    };



    // =================================================
    // MOSTRAR SOLO CABEZA DE INVITACIÓN
    // =================================================

    if (inviteName) {

      inviteName.textContent =
        activeInvite.nombre;

    }



    // =================================================
    // MOSTRAR CUPOS
    // =================================================

    if (inviteText) {


      if (
        activeInvite.cupos === 1
      ) {

        inviteText.textContent =
          'Hemos reservado 1 lugar para esta invitación.';

      }

      else {

        inviteText.textContent =
          `Hemos reservado ${activeInvite.cupos} lugares para esta invitación.`;

      }

    }



    // =================================================
    // CREAR OPCIONES DE ASISTENTES
    // =================================================

    if (guestCount) {


      guestCount.innerHTML = '';


      for (
        let i = 1;
        i <= activeInvite.cupos;
        i++
      ) {


        const option =
          document.createElement(
            'option'
          );


        option.value = i;

        option.textContent = i;


        guestCount.appendChild(
          option
        );

      }

    }



    // Mostrar formulario

    if (rsvpForm) {

      rsvpForm.hidden = false;

    }


    showStatus('');


  }

  catch (error) {


    console.error(error);


    activeInvite = null;


    if (inviteName) {

      inviteName.textContent =
        'Invitación no encontrada';

    }


    if (inviteText) {

      inviteText.textContent =
        'No pudimos consultar esta invitación.';

    }


    if (rsvpForm) {

      rsvpForm.hidden = true;

    }


    showStatus(
      'Verifica que estés utilizando el enlace que recibiste.'
    );

  }

}



// =====================================================
// CAMBIO DE ASISTENCIA
// =====================================================

if (
  attendance &&
  guestCountWrap
) {


  attendance.addEventListener(
    'change',
    () => {


      if (
        attendance.value === 'yes'
      ) {

        guestCountWrap.hidden =
          false;

      }

      else {

        guestCountWrap.hidden =
          true;

      }

    }
  );

}



// =====================================================
// ENVIAR RSVP
// =====================================================

if (rsvpForm) {


  rsvpForm.addEventListener(

    'submit',

    async event => {


      event.preventDefault();



      if (!activeInvite) {

        showStatus(
          'No se encontró una invitación válida.'
        );

        return;

      }



      if (
        !attendance ||
        !attendance.value
      ) {

        showStatus(
          'Selecciona si podrás acompañarnos.'
        );

        return;

      }



      let cantidad = 0;


      if (
        attendance.value === 'yes'
      ) {

        cantidad =
          Number(
            guestCount.value
          ) || 1;

      }



      // =================================================
      // Apps Script actualmente espera
      // números de personas seleccionadas.
      //
      // Como solo mostraremos la cabeza,
      // enviamos 1..cantidad.
      // =================================================

      const seleccionados = [];


      for (
        let i = 1;
        i <= cantidad;
        i++
      ) {

        seleccionados.push(i);

      }



      const payload = {

        codigo:
          activeInvite.codigo,

        seleccionados:
          seleccionados,

        observaciones:
          message
            ? message.value.trim()
            : ''

      };



      showStatus(
        'Guardando tu confirmación...'
      );



      const submitButton =
        rsvpForm.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled =
          true;

      }



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
                JSON.stringify(
                  payload
                )

            }

          );



        if (!response.ok) {

          throw new Error(
            'No fue posible guardar la confirmación.'
          );

        }



        const result =
          await response.json();



        if (!result.ok) {

          throw new Error(
            result.error ||
            'No fue posible guardar la confirmación.'
          );

        }



        // =================================================
        // CONFIRMACIÓN EXITOSA
        // =================================================

        if (
          attendance.value === 'yes'
        ) {


          showStatus(

            cantidad === 1

              ? '✓ ¡Gracias! Hemos registrado 1 asistente.'

              : `✓ ¡Gracias! Hemos registrado ${cantidad} asistentes.`

          );

        }

        else {


          showStatus(
            '✓ Gracias por avisarnos. Hemos registrado que no podrás acompañarnos.'
          );

        }



        // Evitar doble envío accidental

        if (submitButton) {

          submitButton.textContent =
            'Confirmación enviada';

        }



      }

      catch (error) {


        console.error(error);


        showStatus(
          'No pudimos guardar tu confirmación. Intenta nuevamente.'
        );


        if (submitButton) {

          submitButton.disabled =
            false;

        }

      }

    }

  );

}



// =====================================================
// INICIAR RSVP
// =====================================================

loadInvitation();
