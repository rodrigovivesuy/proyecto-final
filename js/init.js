const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

let VerificarSesion = function () {
  let usuarioLogeado = sessionStorage.getItem("usuario");
  let usuarioGuardado = localStorage.getItem("usuario");
  if (usuarioLogeado == null && usuarioGuardado == null) {
    window.location = "login.html"
  }
}
VerificarSesion();

let AgregarUsuarioHeader = function () {
  let usuarioLogeado = JSON.parse(sessionStorage.getItem("usuario"));
  let usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
  if (usuarioLogeado != null) {
    document.getElementById("usuario").innerHTML = usuarioLogeado.email;
  } else if (usuarioGuardado != null) {
    document.getElementById("usuario").innerHTML = usuarioGuardado.email;
  }
}
AgregarUsuarioHeader();

let showSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = 'ok';
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = 'error';
      result.data = error;
      hideSpinner();
      return result;
    });
}