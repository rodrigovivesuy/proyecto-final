document.addEventListener("DOMContentLoaded", function (e) {
    // Obtiene el ID de la categoría seleccionada previamente
    let catID = localStorage.getItem("catID");
    let prodID = localStorage.getItem("prodID");

    // Ejecuta la petición para obtener los productos de la categoría seleccionada
    getJSONData(PRODUCTS_URL + catID + ".json").then(function (resultObj) {
        if (resultObj.status === "ok") {
            let datos = resultObj.data;
            let producto = datos.products.find(p => p.id === parseInt(prodID));
            // Actualiza el breadcrumb con la categoría actual
            document.getElementById("breadcrumb").innerHTML = `
              <a href="index.html">Inicio</a> 
              <i class="fas fa-arrow-right"></i> 
              <a href="categories.html">Categorías</a>
              <i class="fas fa-arrow-right"></i>
              <a href="products.html">${datos.catName}</a>
              <i class="fas fa-arrow-right"></i> 
              <strong>${producto.name}</strong>`;

            // Muestra la información del producto
            CargarInfoProducto(producto, datos.catName);

            
        }
    });
    function CargarInfoProducto(p,c) {
        let currency = p.currency;
        let signoMoneda = `${currency === "UYU" ? "$" : "U$D"}`;
        let htmlContentToAppend = "";
        htmlContentToAppend += `
        
        <div class="col-md-12 col-lg-6">
          <img id="imagen" src="${p.image}" class="img-fluid">
        </div>
        <div class="col-md-12 col-lg-6 d-flex flex-column justify-content-start">
          <h1 id="nombre">${p.name}</h1>
          <h3 id="descripcion">${p.description}</h3>
          <p>Categoría: <span>${c}</span></p>
          <p>Vendidos: <span>${p.soldCount}</span></p>
          <h2 id="precio">${signoMoneda} ${p.cost}</h2>
          <button class="btnAgregarAlCarrito">Agregar al carrito</button>
        </div>
        `;
        document.getElementById("infoProducto").innerHTML = htmlContentToAppend;
    }
});