const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL =
  "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL =
  "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

document.addEventListener("DOMContentLoaded", async () => {
  let CargarMenuDeNavegacion = function () {
    const menu = document.getElementById("menuDeNavegacion");

    fetch("menu-navegacion.html")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al cargar el menú: " + response.status);
        }
        return response.text();
      })
      .then((html) => {
        menu.innerHTML = html;
      })
      .catch((error) => {
        console.error("No se pudo cargar el menú de navegación:", error);
      });
  };
  await CargarMenuDeNavegacion();

  let SeleccionarTema = function () {
    let temaGuardado = JSON.parse(localStorage.getItem("tema"));
    let tema = temaGuardado === "dark" ? temaGuardado : "light";
    const documento = document.documentElement;
    documento.setAttribute("data-theme", tema);
    const chbox = document.getElementById("checkboxTema");
    if (chbox) chbox.checked = tema === "dark" ? true : false;
  };

  let VerificarSesion = function () {
    let usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    let usuarioLogeado = JSON.parse(sessionStorage.getItem("usuario"));
    if (
      (usuarioLogeado == null && usuarioGuardado == null) ||
      (usuarioLogeado?.conectado == false &&
        usuarioGuardado?.conectado == false)
    ) {
      window.location = "login.html";
    }
  };

  setTimeout(() => {
    SeleccionarTema();
    VerificarSesion();
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    ObtenerCantidadDelCarrito(carrito);
  }, 100);
});

let ObtenerCantidadDelCarrito = function (carrito) {
  if (carrito) {
    let longitud = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    setTimeout(() => {
      const badgeCarrito = document.getElementById("badgeCarrito");
      const badgePerfil = document.getElementById("badgePerfil");
      const elementoPadre = badgeCarrito.parentElement;
      if (longitud > 0) {
        badgeCarrito.innerHTML = longitud;
        badgePerfil.innerHTML = longitud;
        badgeCarrito.classList.remove("hidden");
        elementoPadre.classList.add("me-2");
      } else {
        badgeCarrito.innerHTML = "0";
        badgePerfil.innerHTML = "0";
        badgeCarrito.classList.add("hidden");
        elementoPadre.classList.remove("me-2");
      }
    }, 100);
  }
};

let CambiarTema = function () {
  let checkbox = document.getElementById("checkboxTema");
  let temaSeleccionado = checkbox.checked ? "dark" : "light";
  localStorage.setItem("tema", JSON.stringify(temaSeleccionado));
  const documento = document.documentElement;
  documento.setAttribute("data-theme", temaSeleccionado);
};

// Cerrar sesión
document.addEventListener("click", (e) => {
  if (e.target.id === "logout") {
    let usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    let usuarioLogeado = JSON.parse(sessionStorage.getItem("usuario"));
    usuarioLogeado.conectado = false;
    usuarioGuardado.conectado = false;
    localStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
    sessionStorage.setItem("usuario", JSON.stringify(usuarioLogeado));

    setTimeout(() => {
      window.location.href = "login.html";
    }, 50);
    return true;
  }
});

let showSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "block";
};

let hideSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "none";
};

let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = "ok";
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = "error";
      result.data = error;
      hideSpinner();
      return result;
    });
};

// Función para guardar un producto en el carrito
function AgregarProductoAlCarrito(informacionProducto, navegar = false) {
  // Crear el objeto con la estructura que queremos guardar
  let productoParaElCarrito = {
    id: informacionProducto.id,
    nombre: informacionProducto.name,
    cantidad: 1,
    precio: informacionProducto.cost,
    moneda: informacionProducto.currency,
    imagen: informacionProducto.images
      ? informacionProducto.images[0]
      : informacionProducto.image,
  }; // Carga el carrito del localStorage. Si no existe, inicia un array vacío.

  let carritoDeComprasActual =
    JSON.parse(localStorage.getItem("carrito")) || [];

  let productoExiste = false; // Recorremos el carrito para ver si el producto YA está
  for (let i = 0; i < carritoDeComprasActual.length; i++) {
    let productoDelCarrito = carritoDeComprasActual[i];
    if (String(productoDelCarrito.id) === String(productoParaElCarrito.id)) {
      productoDelCarrito.cantidad += 1;
      productoExiste = true;
      break;
    }
  } // Si el producto NO existe, lo agregamos como un elemento nuevo

  if (!productoExiste) {
    carritoDeComprasActual.push(productoParaElCarrito);
  } // Guarda la versión final del carrito en localStorage

  localStorage.setItem("carrito", JSON.stringify(carritoDeComprasActual));

  ObtenerCantidadDelCarrito(carritoDeComprasActual);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: "success",
    title: `El producto ${productoParaElCarrito.nombre} fue agregado correctamente`,
  });

  // Redirigir a la página del carrito
  if (navegar) {
    setTimeout(() => {
      window.location.href = "cart.html";
    }, 1000);
  }
}
