document.addEventListener("DOMContentLoaded", function (e) {
  // Obtiene el ID del producto seleccionado previamente
  let prodID = localStorage.getItem("prodID");
  let producto = [];
  let indexEstrellasSeleccionadas = 0;
  let productosRelacionados = [];

  // Ejecuta la petición para obtener los productos de la categoría seleccionada
  getJSONData(PRODUCT_INFO_URL + prodID + ".json").then(function (resultObj) {
    if (resultObj.status === "ok") {
      producto = resultObj.data;
      productosRelacionados = producto.relatedProducts;

      // Actualizamos el breadcrumb
      document.getElementById("breadcrumb").innerHTML = `
            <a href="index.html">Inicio</a> 
            <i class="fas fa-arrow-right"></i> 
            <a href="categories.html">Categorías</a>
            <i class="fas fa-arrow-right"></i>
            <a href="products.html">${producto.category}</a>
            <i class="fas fa-arrow-right"></i> 
            <strong>${producto.name}</strong>`;

      // Muestra la información del producto
      CargarInfoProducto(producto);
      ObtenerCalificaciones(prodID);
      ObtenerProductosRelacionados(productosRelacionados);
    }
  });

  // Llama a la función de guardado al hacer clic
  document
    .getElementById("btnEnviarComentario")
    .addEventListener("click", function () {
      simularEnvioComentario(prodID, indexEstrellasSeleccionadas);
    });

  function CargarInfoProducto(p) {
    let currency = p.currency;
    let signoMoneda = `${currency === "UYU" ? "$" : "U$D"}`;

    // Crear HTML para las miniaturas
    let miniaturasHTML = "";
    p.images.forEach((img, index) => {
      miniaturasHTML += `
            <img src="${img}" 
            class="imgMiniatura ${index === 0 ? "activa" : ""}" 
            onclick="CambiarImagenPrincipal('${img}', this)"
            alt="Miniatura ${index + 1}">
            `;
    });

    let htmlContentToAppend = `
            <div class="col-md-12 col-lg-6">
            <div class="contenedorGaleria">
            <img id="imagenPrincipal" src="${p.images[0]}" class="img-fluid imagenPrincipal" alt="${p.name}">
            <div class="contenedorMiniaturas">
            ${miniaturasHTML}
            </div>
            </div>
            </div>
            <div class="col-md-12 col-lg-6 d-flex flex-column justify-content-start">
            <h1 id="nombre">${p.name}</h1>
            <h3 id="descripcion">${p.description}</h3>
            <p>Categoría: <span>${p.category}</span></p>
            <p>Vendidos: <span>${p.soldCount}</span></p>
            <h2 id="precio">${signoMoneda} ${p.cost}</h2>
                <div class="botonesCart col-12 d-flex gap-2">
                    <button class="btnComprarAhora" onclick="comprarAhora(${p.id})">Comprar</button>
                    <button class="btnAgregarAlCarrito" onclick="agregarAlCarrito(${p.id})">Agregar al carrito</button>
                </div>
            </div>
            `;

    document.getElementById("infoProducto").innerHTML = htmlContentToAppend;
  }

  function PintarEstrellasEnCalificar() {
    const estrellas = document.querySelectorAll(
      ".seleccionEstrellas .estrella"
    );

    estrellas.forEach((estrella, index) => {
      estrella.addEventListener("mouseenter", () => {
        estrellas.forEach((s, i) => {
          if (i <= index) {
            s.classList.remove("far");
            s.classList.add("fas");
          } else {
            s.classList.remove("fas");
            s.classList.add("far");
          }
        });
      });

      estrella.addEventListener("mouseleave", () => {
        estrellas.forEach((s, i) => {
          if (i < indexEstrellasSeleccionadas) {
            s.classList.remove("far");
            s.classList.add("fas");
          } else {
            s.classList.remove("fas");
            s.classList.add("far");
          }
        });
      });

      estrella.addEventListener("click", () => {
        indexEstrellasSeleccionadas = index + 1;
      });
    });
  }

  PintarEstrellasEnCalificar();
});

// Busca el email dentro del objeto 'usuario'
function getUserEmail() {
  // Intenta obtener el objeto 'usuario' de localStorage
  let usuarioJSON = localStorage.getItem("usuario");

  // Si no está en localStorage, busca en sessionStorage
  if (!usuarioJSON) {
    usuarioJSON = sessionStorage.getItem("usuario");
  }

  // Si se encuentra el objeto, extrae el email.
  if (usuarioJSON) {
    try {
      let usuarioObj = JSON.parse(usuarioJSON);
      return usuarioObj.email;
    } catch (e) {}
  }
  return "usuario_anonimo";
}

// Toma los datos y los guarda.
function simularEnvioComentario(idProducto, score) {
  const comentarioInput = document.getElementById("textoComentario");
  const mensaje = comentarioInput.value.trim();
  // Obtiene el email
  const emailUsuario = getUserEmail();

  // Valida los campos
  if (score === 0 || mensaje === "") {
    alert(
      "¡Error! Debes seleccionar una puntuación (estrellas) y escribir un comentario."
    );
    return;
  }

  // Construye el objeto de comentario con los datos de usuario, score, mensaje y fecha
  const nuevoComentario = {
    product: parseInt(idProducto),
    score: score,
    description: mensaje,
    user: emailUsuario,
    dateTime: new Date().toLocaleString("sv").replace(" ", " "),
  };

  //Guarda los datos en LocalStorage (usando el prodID como clave)
  localStorage.setItem(idProducto, JSON.stringify(nuevoComentario));

  //Limpia el formulario y reiniciar la puntuación
  comentarioInput.value = "";
  indexEstrellasSeleccionadas = 0;

  // Llama a la función para refrescar la lista y mostrar el nuevo comentario
  ObtenerCalificaciones(idProducto);
}

// Función para generar el HTML de las estrellas
function generarEstrellasHTML(score) {
  let estrellasHTML = "";
  for (let i = 1; i <= 5; i++) {
    estrellasHTML +=
      i <= score
        ? '<i class="fas fa-star"></i>'
        : '<i class="far fa-star"></i>';
  }
  return estrellasHTML;
}

// Función para obtener las calificaciones del producto y mostrarlo en pantalla
function ObtenerCalificaciones(prodID) {
  let comentarios = [];
  let html = "";
  getJSONData(PRODUCT_INFO_COMMENTS_URL + prodID + ".json").then(function (
    resultObj
  ) {
    if (resultObj.status === "ok") {
      comentarios = resultObj.data;

      let miComentarioJSON = localStorage.getItem(prodID);

      if (miComentarioJSON) {
        try {
          let miComentario = JSON.parse(miComentarioJSON);

          comentarios.unshift(miComentario);
        } catch (e) {
          console.error("Error al parsear el comentario del localStorage:", e);
        }
      }

      comentarios.sort((a, b) => {
        let fechaA = new Date(a.dateTime);
        let fechaB = new Date(b.dateTime);

        // Ordena los comentarios (De mas reciente a menos recinete)
        return fechaB - fechaA;
      });

      // Si hay comentarios los agrega en caso contrario devuelve un texto
      if (comentarios.length > 0) {
        comentarios.forEach((c, i) => {
          // Crear estrellas
          let estrellasHTML = generarEstrellasHTML(c.score);

          html += `
                        <div class="comentarioItem">
                        <div class="comentarioEncabezado">
                        <span class="comentarioUsuario">${c.user}</span>
                        <div class="comentarioEstrellas">
                            ${estrellasHTML}
                        </div>
                        <span class="comentarioFecha">
                        <i class="fas fa-clock"></i> ${c.dateTime}
                        </span>
                        </div>
                        <p class="comentarioTexto">${c.description}</p>
                        </div>
                        `;
        });
      } else {
        html = `
                    <div class="sinComentarios">
                        <i class="far fa-comments"></i>
                        <p>Aún no hay comentarios para este producto. ¡Sé el primero en opinar!</p>
                    </div> 
                    `;
      }

      document.getElementById("listaComentarios").innerHTML = html;
    }
  });
}

// Función para cambiar la imagen principal
function CambiarImagenPrincipal(nuevaImagen, elemento) {
  // Obtenemos la imagen y le colocamos la nueva imagen
  document.getElementById("imagenPrincipal").src = nuevaImagen;

  // Remover la clase 'activa' de todas las miniaturas
  document.querySelectorAll(".imgMiniatura").forEach((img) => {
    img.classList.remove("activa");
  });

  // Agregar la clase 'activa' a la miniatura clickeada
  elemento.classList.add("activa");
}

function ObtenerProductosRelacionados(productos) {
  let htmlContentToAppend = "";
  productos.forEach((producto, index) => {
    getJSONData(PRODUCT_INFO_URL + producto.id + ".json").then(function (
      resultObj
    ) {
      if (resultObj.status === "ok") {
        producto = resultObj.data;
        let currency = producto.currency;
        let signoMoneda = `${currency === "UYU" ? "$" : "U$D"}`;
        // Añade los productos relacionados

        htmlContentToAppend += `
      
          <div class="tarjeta" onclick="MostrarProducto(${producto.id})">
                <img src="${producto.images[0]}" alt="Imagen de ${producto.name}" />
                <p class="precio">${signoMoneda} ${producto.cost}</p>
                <h2>${producto.name}</h2>
                <p class="descripcion" title="${producto.description}">
                ${producto.description}</p>
                <button type="button" class="btnAgregarAlCarrito" data-producto='${JSON.stringify(producto)}'>Agregar al carrito</button>
                <div class="vendidos">Vendidos: ${producto.soldCount}</div>
            </div>
        `;
      }

      document.getElementById("productosRelacionados").innerHTML =
        htmlContentToAppend;
    });
  });
  window.MostrarProducto = function (id) {
    localStorage.setItem("prodID", id);
    location.reload();
  };
}

function agregarAlCarrito(productId) {
  getJSONData(PRODUCT_INFO_URL + productId + ".json").then(function (
    resultObj
  ) {
    if (resultObj.status === "ok") {
      let producto = resultObj.data;
      AgregarProductoAlCarrito(producto);
    }
  });
}

function comprarAhora(productId) {
  getJSONData(PRODUCT_INFO_URL + productId + ".json").then(function (
    resultObj
  ) {
    if (resultObj.status === "ok") {
      let producto = resultObj.data;
      AgregarProductoAlCarrito(producto, true);
    }
  });
}
