document.addEventListener("DOMContentLoaded", function () {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (carrito.length === 0) {
    document.getElementById("carrito-vacio").style.display = "block";
    document.getElementById("carrito-productos").style.display = "none";
  } else {
    document.getElementById("carrito-vacio").style.display = "none";
    document.getElementById("carrito-productos").style.display = "block";
    mostrarProductosEnCarrito(carrito);
  }

  function mostrarProductosEnCarrito(carrito) {
    let htmlContentToAppend = "";

    carrito.forEach((producto, index) => {
      let moneda = producto.moneda;
      let signoMoneda = `${moneda === "UYU" ? "$" : "U$D"}`;
      let subtotalItem = producto.precio * (producto.cantidad || 1);

      //30-10-25 se agrego id="subtotal-item-${index}" para poder targetearlo para la funcion de subtotales
      htmlContentToAppend += `
        <div class="carrito-tarjeta">
          <div class="carrito-tarjeta-imagen">
           <img src="${producto.imagen}" alt="${producto.nombre}">
          </div>
          <div class="carrito-tarjeta-contenido">
            <h3>${producto.nombre}</h3>
            <div class="disminuir-aumentar">
              <button class="disminuir" data-index="${index}">−</button>
              <input type="number" min="1" value="${
                producto.cantidad || 1
              }" data-index="${index}" readonly />
              <button class="aumentar" data-index="${index}">+</button>
            </div>
          </div>
        <div class="precio">
          <div class="eliminar-producto">
            <i class=" fa-solid fa-lg fa-trash-can" data-index="${index}"></i>
          </div>
          <p id="subtotal-item-${index}">${signoMoneda} ${subtotalItem.toLocaleString()}</p> 
          </div>
        </div>
      `;
    });

    document.getElementById("carrito-items").innerHTML = htmlContentToAppend;
    agregarEventosCarrito(carrito);
  }

  // Funciones para aumentar, disminuir y cambiar cantidad
  function agregarEventosCarrito(carrito) {
    document.querySelectorAll(".aumentar").forEach((btn) => {
      btn.addEventListener("click", () => {
        let i = btn.dataset.index;
        carrito[i].cantidad = (carrito[i].cantidad || 1) + 1;
      });
    });

    document.querySelectorAll(".disminuir").forEach((btn) => {
      btn.addEventListener("click", () => {
        let i = btn.dataset.index;
        if (carrito[i].cantidad > 1) carrito[i].cantidad--;
      });
    });

    document.querySelectorAll(".disminuir-aumentar input").forEach((input) => {
      input.addEventListener("change", () => {
        let i = input.dataset.index;
        carrito[i].cantidad = parseInt(input.value) || 1;
      });
    });
  }

  // Eliminar producto del carrito
  function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    location.reload();
  }

  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("fa-trash-can")) {
      let index = e.target.dataset.index;
      eliminarProducto(index);
    }
  });

  // Vaciar carrito
  const vaciarCarrito = document.createElement("div");
  vaciarCarrito.textContent = "Vaciar carrito";
  vaciarCarrito.classList.add("vaciar-carrito");
  vaciarCarrito.addEventListener("click", () => {
    localStorage.removeItem("carrito");
    location.reload();
  });
  document.querySelector(".col-lg-8").appendChild(vaciarCarrito);

  /// Funciones para cambiar y actualizar el subtotal en tiempo real.

  const FACTOR_CONVERSION_PESOS_URUGUAYOS_A_DOLARES = 0.025;
  const INTERVALO_OBSERVACION_CARRITO_MILISEGUNDOS = 100;
  const SIMBOLO_MONEDA_PRINCIPAL = "U$D";

  let ESTADO_ANTERIOR_DEL_CARRITO = JSON.stringify(carrito);

  /// Almacena el carrito en el localStorage como un array JSON.
  function GuardarCarritoEnLocalStorage(carritoActualizado) {
    localStorage.setItem("carrito", JSON.stringify(carritoActualizado));
    ObtenerCantidadDelCarrito(carritoActualizado);
  }

  /// Calcula el subtotal general de los productos en el carrito.
  /// Convierte los precios en pesos uruguayos a dólares para unificar valores.
  function CalcularSubtotalDelCarrito() {
    const SUBTOTAL = carrito.reduce((acumulador, producto) => {
      const CANTIDAD_PRODUCTO = producto.cantidad || 1;
      let costoEnDolares = producto.precio;

      // Conversión de moneda si el producto está en pesos uruguayos (UYU)
      if (producto.moneda === "UYU") {
        costoEnDolares =
          producto.precio * FACTOR_CONVERSION_PESOS_URUGUAYOS_A_DOLARES;
      }

      return acumulador + costoEnDolares * CANTIDAD_PRODUCTO;
    }, 0);

    return SUBTOTAL;
  }

  /// Actualiza el total general mostrado en el DOM dentro del elemento con id "total-precio".
  function ActualizarTotalEnHTML(TOTAL_DEL_CARRITO) {
    const TOTAL_FORMATEADO = TOTAL_DEL_CARRITO.toFixed(0).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      ","
    );

    const ELEMENTO_TOTAL = document.getElementById("total-precio");

    if (ELEMENTO_TOTAL) {
      ELEMENTO_TOTAL.textContent = `${SIMBOLO_MONEDA_PRINCIPAL} ${TOTAL_FORMATEADO}`;
    }
  }

  /// Observa los cambios en el carrito cada cierto intervalo de tiempo para mantener la vista actualizada.
  function ObservarCambiosEnCarrito() {
    if (carrito.length === 0) return;

    const ESTADO_ACTUAL_DEL_CARRITO = JSON.stringify(carrito);

    if (ESTADO_ACTUAL_DEL_CARRITO !== ESTADO_ANTERIOR_DEL_CARRITO) {
      GuardarCarritoEnLocalStorage(carrito);
      mostrarProductosEnCarrito(carrito);

      const NUEVO_SUBTOTAL = CalcularSubtotalDelCarrito();
      ActualizarTotalEnHTML(NUEVO_SUBTOTAL);

      ESTADO_ANTERIOR_DEL_CARRITO = ESTADO_ACTUAL_DEL_CARRITO;
    }
  }

  // Llamada inicial para asegurar que el total se muestre correctamente al cargar.
  if (carrito.length > 0) {
    const SUBTOTAL_INICIAL = CalcularSubtotalDelCarrito();
    ActualizarTotalEnHTML(SUBTOTAL_INICIAL);
  }

  // Inicia el proceso de observación periódica del carrito.
  setInterval(
    ObservarCambiosEnCarrito,
    INTERVALO_OBSERVACION_CARRITO_MILISEGUNDOS
  );
}); // Fin de DOMContentLoaded
