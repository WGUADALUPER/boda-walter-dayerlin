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

  let d = Math.max(
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

          menuBtn.setAttribute(
            'aria-expanded',
            'false'
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
let editingConfirmation = false;



// =====================================================
// BOTÓN MODIFICAR
// Lo creamos automáticamente.
// No necesitas cambiar el HTML.
// =====================================================

const modifyButton =
  document.createElement('button');


modifyButton.type = 'button';
modifyButton.className = 'button';
modifyButton.textContent =
  'Modificar confirmación';

modifyButton.hidden = true;


if (rsvpForm) {

  rsvpForm.insertAdjacentElement(
    'afterend',
    modifyButton
  );
}



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
// BOTÓN DE ENVIAR
// =====================================================

function getSubmitButton() {

  if (!rsvpForm) {
    return null;
  }

  return rsvpForm.querySelector(
    'button[type="submit"]'
  );
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
// LLENAR CANTIDAD DE ASISTENTES
// =====================================================

function fillGuestCount(
  cupos,
  selected = 1
) {

  if (!guestCount) {
    return;
  }


  guestCount.innerHTML = '';


  for (
    let i = 1;
    i <= cupos;
    i++
  ) {

    const option =
      document.createElement(
        'option'
      );


    option.value =
      String(i);


    option.textContent =
      String(i);


    if (i === selected) {

      option.selected =
        true;
    }


    guestCount.appendChild(
      option
    );
  }
}



// =====================================================
// PREPARAR FORMULARIO
// =====================================================

function prepareForm(
  attendanceValue = '',
  confirmedCount = 0
) {

  if (!rsvpForm) {
    return;
  }


  rsvpForm.hidden =
    false;


  modifyButton.hidden =
    true;


  const submitButton =
    getSubmitButton();


  if (submitButton) {

    submitButton.disabled =
      false;

    submitButton.textContent =
      editingConfirmation
        ? 'Guardar cambios'
        : 'Confirmar asistencia';
  }


  if (message) {

    message.value =
      activeInvite?.observaciones || '';
  }


  if (!attendance) {
    return;
  }


  attendance.value =
    attendanceValue;


  if (
    attendanceValue === 'yes'
  ) {

    if (guestCountWrap) {

      guestCountWrap.hidden =
        false;
    }


    fillGuestCount(
      activeInvite.cupos,
      confirmedCount > 0
        ? confirmedCount
        : 1
    );
  }

  else {

    if (guestCountWrap) {

      guestCountWrap.hidden =
        true;
    }


    fillGuestCount(
      activeInvite.cupos,
      1
    );
  }
}



// =====================================================
// MOSTRAR CONFIRMACIÓN EXISTENTE
// =====================================================

function showExistingConfirmation() {

  if (!activeInvite) {
    return;
  }


  if (rsvpForm) {

    rsvpForm.hidden =
      true;
  }


  editingConfirmation =
    false;


  const confirmados =
    Number(
      activeInvite.confirmados
    ) || 0;


  if (confirmados > 0) {

    showStatus(

      confirmados === 1

        ? '✓ Tu asistencia está confirmada para 1 persona.'

        : `✓ Tu asistencia está confirmada para ${confirmados} personas.`
    );
  }

  else {

    showStatus(
      '✓ Hemos registrado que no podrás acompañarnos.'
    );
  }


  // Solo puede modificar mientras
  // Apps Script indique que el RSVP está abierto.

  if (
    activeInvite.rsvpAbierto
  ) {

    modifyButton.hidden =
      false;
  }

  else {

    modifyButton.hidden =
      true;


    if (confirmados > 0) {

      showStatus(

        confirmados === 1

          ? '✓ Tu asistencia está confirmada para 1 persona. El período para modificar la confirmación ha finalizado.'

          : `✓ Tu asistencia está confirmada para ${confirmados} personas. El período para modificar la confirmación ha finalizado.`
      );
    }

    else {

      showStatus(
        '✓ Hemos registrado que no podrás acompañarnos. El período para modificar la confirmación ha finalizado.'
      );
    }
  }
}



// =====================================================
// RSVP CERRADO SIN RESPUESTA
// =====================================================

function showClosedWithoutResponse() {

  if (rsvpForm) {

    rsvpForm.hidden =
      true;
  }


  modifyButton.hidden =
    true;


  showStatus(
    'El período de confirmación de asistencia ha finalizado. Gracias por tu comprensión.'
  );
}



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


    if (rsvpForm) {

      rsvpForm.hidden =
        true;
    }


    modifyButton.hidden =
      true;


    showStatus('');

    return;
  }



  if (inviteName) {

    inviteName.textContent =
      'Cargando...';
  }


  if (inviteText) {

    inviteText.textContent =
      '';
  }


  if (rsvpForm) {

    rsvpForm.hidden =
      true;
  }


  modifyButton.hidden =
    true;


  showStatus(
    'Consultando tu invitación...'
  );



  try {


    const response =
      await fetch(

        `${API_URL}?i=${encodeURIComponent(inviteCode)}&t=${Date.now()}`,

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



    // =================================================
    // GUARDAR DATOS
    // =================================================

    activeInvite = {

      codigo:
        String(
          data.codigo || inviteCode
        ),

      nombre:
        String(
          data.nombre ||
          'Invitado'
        ),

      cupos:
        Math.max(
          1,
          Number(data.cupos) || 1
        ),

      estado:
        String(
          data.estado ||
          'Pendiente'
        ),

      confirmados:
        Math.max(
          0,
          Number(data.confirmados) || 0
        ),

      observaciones:
        String(
          data.observaciones || ''
        ),

      respondido:
        data.respondido === true,

      rsvpAbierto:
        data.rsvpAbierto !== false,

      fechaLimite:
        String(
          data.fechaLimite ||
          '9 de diciembre de 2026'
        )

    };



    // =================================================
    // MOSTRAR SOLAMENTE CABEZA DE INVITACIÓN
    // =================================================

    if (inviteName) {

      inviteName.textContent =
        activeInvite.nombre;
    }


    if (inviteText) {

      inviteText.textContent =

        activeInvite.cupos === 1

          ? 'Hemos reservado 1 lugar para esta invitación.'

          : `Hemos reservado ${activeInvite.cupos} lugares para esta invitación.`;
    }



    // =================================================
    // LLENAR SELECTOR
    // =================================================

    fillGuestCount(
      activeInvite.cupos,
      activeInvite.confirmados > 0
        ? activeInvite.confirmados
        : 1
    );



    // =================================================
    // YA RESPONDIÓ
    // =================================================

    if (
      activeInvite.respondido
    ) {

      showExistingConfirmation();

      return;
    }



    // =================================================
    // NO RESPONDIÓ Y YA CERRÓ EL RSVP
    // =================================================

    if (
      !activeInvite.rsvpAbierto
    ) {

      showClosedWithoutResponse();

      return;
    }



    // =================================================
    // PRIMERA CONFIRMACIÓN
    // =================================================

    editingConfirmation =
      false;


    prepareForm(
      '',
      0
    );


    showStatus('');


  }

  catch (error) {


    console.error(
      'Error al cargar invitación:',
      error
    );


    activeInvite =
      null;


    if (inviteName) {

      inviteName.textContent =
        'No pudimos cargar tu invitación';
    }


    if (inviteText) {

      inviteText.textContent =
        'Verifica que estés utilizando el enlace personal que recibiste.';
    }


    if (rsvpForm) {

      rsvpForm.hidden =
        true;
    }


    modifyButton.hidden =
      true;


    showStatus(
      'No fue posible consultar la invitación.'
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


        if (
          guestCount &&
          !guestCount.value
        ) {

          fillGuestCount(
            activeInvite?.cupos || 1,
            1
          );
        }
      }

      else {

        guestCountWrap.hidden =
          true;
      }

    }
  );
}



// =====================================================
// MODIFICAR CONFIRMACIÓN
// =====================================================

modifyButton.addEventListener(
  'click',
  () => {


    if (
      !activeInvite ||
      !activeInvite.rsvpAbierto
    ) {

      return;
    }


    editingConfirmation =
      true;


    const confirmados =
      Number(
        activeInvite.confirmados
      ) || 0;


    prepareForm(

      confirmados > 0
        ? 'yes'
        : 'no',

      confirmados > 0
        ? confirmados
        : 1
    );


    showStatus(
      'Puedes modificar tu respuesta hasta el 9 de diciembre de 2026.'
    );


    if (attendance) {

      attendance.focus();
    }
  }
);



// =====================================================
// ENVIAR / ACTUALIZAR RSVP
// =====================================================

if (rsvpForm) {


  rsvpForm.addEventListener(

    'submit',

    async event => {


      // MUY IMPORTANTE:
      // evita que la página se recargue
      // y pierda ?i=WD-001

      event.preventDefault();



      if (!activeInvite) {

        showStatus(
          'No se encontró una invitación válida.'
        );

        return;
      }



      if (
        !activeInvite.rsvpAbierto
      ) {

        showStatus(
          'El período de confirmación de asistencia ha finalizado.'
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
            guestCount?.value
          ) || 1;


        if (
          cantidad < 1 ||
          cantidad > activeInvite.cupos
        ) {

          showStatus(
            'Selecciona una cantidad válida de asistentes.'
          );

          return;
        }
      }



      // =================================================
      // APPS SCRIPT ESPERA LOS NÚMEROS
      // DE PERSONAS SELECCIONADAS.
      //
      // No mostramos sus nombres.
      // Enviamos 1..cantidad.
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



      const submitButton =
        getSubmitButton();


      if (submitButton) {

        submitButton.disabled =
          true;


        submitButton.textContent =
          editingConfirmation
            ? 'Guardando cambios...'
            : 'Guardando...';
      }


      showStatus(
        editingConfirmation
          ? 'Actualizando tu confirmación...'
          : 'Guardando tu confirmación...'
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


          // Apps Script también controla
          // la fecha límite.

          if (
            result.cerrado
          ) {

            activeInvite.rsvpAbierto =
              false;


            showClosedWithoutResponse();

            return;
          }


          throw new Error(
            result.error ||
            'No fue posible guardar la confirmación.'
          );
        }



        // =================================================
        // ACTUALIZAR DATOS LOCALES
        // =================================================

        activeInvite.estado =
          String(
            result.estado ||
            (
              cantidad > 0
                ? 'Confirmado'
                : 'No asistirá'
            )
          );


        activeInvite.confirmados =
          Math.max(
            0,
            Number(
              result.confirmados
            ) || 0
          );


        activeInvite.respondido =
          true;


        activeInvite.rsvpAbierto =
          result.rsvpAbierto !== false;


        activeInvite.observaciones =
          message
            ? message.value.trim()
            : '';



        // =================================================
        // MOSTRAR RESULTADO
        // =================================================

        rsvpForm.hidden =
          true;


        editingConfirmation =
          false;


        showExistingConfirmation();


      }

      catch (error) {


        console.error(
          'Error al guardar RSVP:',
          error
        );


        showStatus(
          error.message ||
          'No pudimos guardar tu confirmación. Intenta nuevamente.'
        );


        if (submitButton) {

          submitButton.disabled =
            false;


          submitButton.textContent =
            editingConfirmation
              ? 'Guardar cambios'
              : 'Confirmar asistencia';
        }
      }
    }
  );
}



// =====================================================
// INICIAR RSVP
// =====================================================

loadInvitation();
