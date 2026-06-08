// CONTADOR REGRESIVO
let tiempoFinal = Date.now() + (8 * 3600 + 24 * 60) * 1000;

function actualizarTimer() {
  let horasEl = document.getElementById('horas');
  let minutosEl = document.getElementById('minutos');
  let segundosEl = document.getElementById('segundos');

  if (horasEl && minutosEl && segundosEl) {
    let diferencia = tiempoFinal - Date.now();
    horasEl.textContent = String(Math.floor(diferencia / 3600000)).padStart(2, '0');
    minutosEl.textContent = String(Math.floor((diferencia % 3600000) / 60000)).padStart(2, '0');
    segundosEl.textContent = String(Math.floor((diferencia % 60000) / 1000)).padStart(2, '0');
  }
}

actualizarTimer();
setInterval(actualizarTimer, 1000);

// CARRITO
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function agregarProducto(nombre, precio) {
  let existe = carrito.find(function(p) { return p.nombre === nombre; });

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }

  guardarCarrito();
  mostrarNotificacion(nombre);
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarCarrito();
}

function actualizarCarrito() {
  let botonCarrito = document.querySelector('.btn-cart');
  if (botonCarrito) {
    let total = carrito.reduce(function(acc, p) { return acc + p.cantidad; }, 0);
    botonCarrito.textContent = '🛒 Carrito (' + total + ')';
  }
  renderizarCarrito();
}

function renderizarCarrito() {
  let lista = document.getElementById('carrito-items');
  let vacio = document.getElementById('carrito-vacio');
  let subtotalEl = document.getElementById('resumen-subtotal');
  let totalEl = document.getElementById('resumen-total');

  if (!lista) return;

  if (carrito.length === 0) {
    vacio.style.display = 'flex';
    lista.innerHTML = '';
    if (subtotalEl) subtotalEl.textContent = '$0';
    if (totalEl) totalEl.textContent = '$0';
    return;
  }

  vacio.style.display = 'none';

  lista.innerHTML = carrito.map(function(prod, index) {
    return `
      <div class="carrito-item">
        <div class="item-izquierda">
          <div class="item-emoji">📦</div>
          <div>
            <p class="item-nombre">${prod.nombre}</p>
            <p class="item-precio">$${prod.precio} c/u</p>
          </div>
        </div>
        <div class="item-derecha">
          <div class="item-cantidad">
            <button class="btn-cantidad" onclick="cambiarCantidad(${index}, -1)">−</button>
            <span class="cantidad-num">${prod.cantidad}</span>
            <button class="btn-cantidad" onclick="cambiarCantidad(${index}, 1)">+</button>
          </div>
          <p class="item-total">$${prod.precio * prod.cantidad}</p>
          <button class="btn-eliminar" onclick="eliminarProducto(${index})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  let subtotal = carrito.reduce(function(acc, p) { return acc + (p.precio * p.cantidad); }, 0);
  let envio = subtotal >= 500 ? 0 : 100;
let envioEl = document.getElementById('resumen-envio');

if (subtotalEl) subtotalEl.textContent = '$' + subtotal;
if (envioEl) {
  if (envio === 0) {
    envioEl.textContent = 'Gratis';
    envioEl.className = 'envio-gratis';
  } else {
    envioEl.textContent = '$100';
    envioEl.className = '';
  }
}
if (totalEl) totalEl.textContent = '$' + (subtotal + envio);
}

function cambiarCantidad(index, cambio) {
  carrito[index].cantidad += cambio;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  guardarCarrito();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  guardarCarrito();
}

function mostrarNotificacion(nombre) {
  let notif = document.createElement('div');
  notif.textContent = '✅ ' + nombre + ' agregado al carrito';
  notif.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #111;
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(notif);
  setTimeout(function() { notif.remove(); }, 2500);
}

actualizarCarrito();

// FILTROS OFERTAS
let filtros = document.querySelectorAll('.filtro-btn');
let productosOfertas = document.querySelectorAll('.filtro-btn ~ * .prod-card');

filtros.forEach(function(boton) {
  boton.addEventListener('click', function() {
    filtros.forEach(function(b) { b.classList.remove('activo'); });
    boton.classList.add('activo');

    let categoriaElegida = boton.textContent.toLowerCase();

    document.querySelectorAll('.prod-card').forEach(function(prod) {
      let categoriaProd = prod.dataset.categoria;
      if (categoriaElegida === 'todos' || categoriaProd === categoriaElegida) {
        prod.style.display = 'block';
      } else {
        prod.style.display = 'none';
      }
    });
  });
});

// BUSCADOR
let buscador = document.getElementById('buscador');
if (buscador) {
  buscador.addEventListener('input', function() {
    filtrarProductos();
  });
}

// PRECIO RANGE
let precioRange = document.getElementById('precio-range');
let precioDisplay = document.getElementById('precio-display');
if (precioRange) {
  precioRange.addEventListener('input', function() {
    precioDisplay.textContent = precioRange.value;
    filtrarProductos();
  });
}

// SIDEBAR LINKS
let sidebarLinks = document.querySelectorAll('.sidebar-link');
sidebarLinks.forEach(function(link) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    sidebarLinks.forEach(function(l) { l.classList.remove('activo-link'); });
    link.classList.add('activo-link');
    filtrarProductos();
  });
});

// FUNCION PRINCIPAL DE FILTRADO
function filtrarProductos() {
  let textoBusqueda = buscador ? buscador.value.toLowerCase() : '';
  let precioMax = precioRange ? parseInt(precioRange.value) : 1000;
  let categoriaActiva = document.querySelector('.activo-link');
  let categoria = categoriaActiva ? categoriaActiva.textContent.toLowerCase() : 'todos';

  // Agarrar las marcas chequeadas
  let marcasActivas = [];
  checkboxes.forEach(function(cb) {
    if (cb.checked) {
      marcasActivas.push(cb.parentElement.textContent.trim().toLowerCase());
    }
  });

  document.querySelectorAll('.prod-card').forEach(function(card) {
    let nombre = card.querySelector('.prod-nombre').textContent.toLowerCase();
    let precio = parseInt(card.dataset.precio);
    let catCard = card.dataset.categoria;
    let marcaCard = card.dataset.marca;

    let pasaBusqueda = nombre.includes(textoBusqueda);
    let pasaPrecio = precio <= precioMax;
    let pasaCategoria = categoria === 'todos' || catCard === categoria;
    let pasaMarca = marcasActivas.includes(marcaCard);

    if (pasaBusqueda && pasaPrecio && pasaCategoria && pasaMarca) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// FILTRO MARCAS
let checkboxes = document.querySelectorAll('.sidebar-lista input[type="checkbox"]');
checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    filtrarProductos();
  });
});

// FORMULARIO CONTACTO
function enviarFormulario() {
  let nombre = document.getElementById('nombre');
  let email = document.getElementById('email');
  let asunto = document.getElementById('asunto');
  let mensaje = document.getElementById('mensaje');
  let exito = document.getElementById('form-exito');
  let btnEnviar = document.querySelector('.btn-enviar');

  if (!nombre || !email) return;

  // Validaciones
  if (nombre.value.trim() === '') {
    alert('Por favor ingresá tu nombre.');
    nombre.focus();
    return;
  }

  if (email.value.trim() === '') {
    alert('Por favor ingresá tu email.');
    email.focus();
    return;
  }

  if (!email.value.includes('@')) {
    alert('El email no es válido.');
    email.focus();
    return;
  }

  if (asunto.value === '') {
    alert('Por favor seleccioná un asunto.');
    asunto.focus();
    return;
  }

  if (mensaje.value.trim() === '') {
    alert('Por favor escribí tu mensaje.');
    mensaje.focus();
    return;
  }

  // Deshabilitar boton mientras envía
  btnEnviar.textContent = 'Enviando...';
  btnEnviar.disabled = true;

  // Enviar con EmailJS
  emailjs.init('mktL3Saul8PcKLFJh');
  emailjs.send('service_2ifr935', 'template_v1urhtv', {
    nombre: nombre.value,
    email: email.value,
    asunto: asunto.options[asunto.selectedIndex].text,
    mensaje: mensaje.value
  })
  .then(function() {
    nombre.value = '';
    email.value = '';
    asunto.value = '';
    mensaje.value = '';
    exito.style.display = 'block';
    btnEnviar.textContent = 'Enviar mensaje →';
    btnEnviar.disabled = false;
  })
  .catch(function(error) {
    alert('Hubo un error al enviar. Intentá de nuevo.');
    btnEnviar.textContent = 'Enviar mensaje →';
    btnEnviar.disabled = false;
    console.error(error);
  });
}
// CONFIRMAR COMPRA POR WHATSAPP
function confirmarCompra() {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío.');
    return;
  }

  let mensaje = '🛍️ *Nuevo pedido de PixelStore*\n\n';
  mensaje += '📦 *Productos:*\n';

  carrito.forEach(function(prod) {
    mensaje += `• ${prod.nombre} x${prod.cantidad} — $${prod.precio * prod.cantidad}\n`;
  });

  let subtotal = carrito.reduce(function(acc, p) { return acc + (p.precio * p.cantidad); }, 0);
  let envio = subtotal >= 500 ? 0 : 100;
  let total = subtotal + envio;

  mensaje += '\n';
  mensaje += `💰 *Subtotal:* $${subtotal}\n`;
  mensaje += `🚚 *Envío:* ${envio === 0 ? 'Gratis' : '$100'}\n`;
  mensaje += `✅ *Total: $${total}*\n`;
  mensaje += '\n¡Quiero confirmar mi pedido!';

  let numero = '5491133822112'; // reemplazá con tu número real
  let url = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje);

  window.open(url, '_blank');
}