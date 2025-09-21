const ORDER_ASC_BY_NAME = "AZ";
const ORDER_DESC_BY_NAME = "ZA";
const ORDER_BY_SELL_COUNT = "Cant.";
const ORDER_ASC_BY_COST = "Precio menor";
const ORDER_DESC_BY_COST = "Precio mayor";

const precios = document.getElementById("precios");
const botonPrecios = precios.querySelector(".seleccionado");
const contenedorDeRangoDePrecios = precios.querySelector(".opciones");


const filtros = document.getElementById("filtros");
const seleccionado = filtros.querySelector(".seleccionado");
const contenedorOpciones = filtros.querySelector(".opciones");
const listaOpciones = filtros.querySelectorAll(".opciones div");

const buscador = document.getElementById("buscador");

const limpiarFiltros = document.getElementById("limpiarFiltros");

let currentProductsArray = [];
let productosAMostrar = currentProductsArray;
let currentSortCriteria = undefined;
let minCost = undefined;
let maxCost = undefined;
let minCount = undefined;
let maxCount = undefined;

document.addEventListener("DOMContentLoaded", function (e) {
    // Obtiene el ID de la categoría seleccionada previamente
    let catID = localStorage.getItem("catID");

    // Ejecuta la petición para obtener los productos de la categoría seleccionada
    getJSONData(PRODUCTS_URL + catID + ".json").then(function (resultObj) {
        if (resultObj.status === "ok") {
            let datos = resultObj.data;
            currentProductsArray = datos.products

            // Actualiza el breadcrumb con la categoría actual
            document.getElementById("breadcrumb").innerHTML = `
            <a href="index.html">Inicio</a> 
            <i class="fas fa-arrow-right"></i> 
            <a href="categories.html">Categorías</a>
            <i class="fas fa-arrow-right"></i> 
            <strong>${datos.catName}</strong>`;

            // Mustra los productos ordenados por nombre de forma ascendente por defecto
            FiltrarYMostrarProductos(ORDER_ASC_BY_NAME);

            // Busca productos por nombre mientras se escribe
            buscador.addEventListener("input", (e) => {
                MostrarListaDeProductos(e.target.value);
        });

        }
    });

    // Limpia los filtros y muestra todos los productos
    limpiarFiltros.addEventListener("click", () => {
        // Resetea los valores de los filtros
        minCost = undefined;
        maxCost = undefined;
        minCount = undefined;
        maxCount = undefined;
        buscador.value = "";
        document.getElementById("rangeFilterCostMin").value = "";
        document.getElementById("rangeFilterCostMax").value = "";
        // Muestra todos los productos sin filtros
        listaOpciones[0].click(); 
    });
        

    // Ejecuta la función para asignar los eventos a los botones del filtrado de productos
    AsignarEventosBotonesFiltrado();
});

// Maneja el menú desplegable del precio
botonPrecios.addEventListener("click", () =>{
    contenedorDeRangoDePrecios.style.display = contenedorDeRangoDePrecios.style.display === "block" ? "none" : "block";
});


// Maneja el menú desplegable del filtrado de productos
seleccionado.addEventListener("click", () => {
    contenedorOpciones.style.display = contenedorOpciones.style.display === "block" ? "none" : "block";
});

// Maneja la selección de una opción del menú desplegable
listaOpciones.forEach(opcion => {
    opcion.addEventListener("click", () => {

        listaOpciones.forEach(o => o.classList.remove("activo"));

        opcion.classList.add("activo");

        seleccionado.innerHTML = `${opcion.textContent} <i class="fa fa-chevron-down ms-auto"></i>`;

        contenedorOpciones.style.display = "none";
    });
});

// Cierra el menú desplegable si se hace clic fuera de él
document.addEventListener("click", (e) => {
    if (!filtros.contains(e.target)) {
        contenedorOpciones.style.display = "none";
    }
    if (!precios.contains(e.target)) {
        contenedorDeRangoDePrecios.style.display = "none";
    }
});

// Muestra la lista de productos en el HTML
function MostrarListaDeProductos(criterio = "") {

    let htmlContentToAppend = "";
    productosAMostrar = currentProductsArray;

    if (criterio.trim() !== "") {
        productosAMostrar = currentProductsArray.filter(producto =>
            producto.name.toLowerCase().includes(criterio.toLowerCase())
            || producto.description.toLowerCase().includes(criterio.toLowerCase())
        );
    }

    for (let producto of productosAMostrar) {
        let currency = producto.currency;
        let signoMoneda = `${currency === "UYU" ? "$" : "U$D"}`;

        // Aquí se agrega el filtro por rango de precio
        if (((minCost == undefined) || (parseInt(producto.cost) >= minCost)) &&
            ((maxCost == undefined) || (parseInt(producto.cost) <= maxCost)) &&
            // Se mantiene el filtro original por cantidad de vendidos
            ((minCount == undefined) || (minCount != undefined && parseInt(producto.soldCount) >= minCount)) &&
            ((maxCount == undefined) || (maxCount != undefined && parseInt(producto.soldCount) <= maxCount))) {

            htmlContentToAppend += `
              <div class="tarjeta" onclick="MostrarProducto(${producto.id})">
                <img src="${producto.image}" alt="Imagen de ${producto.name}" />
                <p class="precio">${signoMoneda} ${producto.cost}</p>
                <h2>${producto.name}</h2>
                <p class="descripcion" title="${producto.description}">${producto.description}</p>
                <button class="btnAgregarAlCarrito">Agregar al carrito</button>
                <div class="vendidos">Vendidos: ${producto.soldCount}</div>
              </div>
            `
        }
         
    }
         
    if (htmlContentToAppend === "") {
        htmlContentToAppend = `<p>No se encontraron productos.</p>`;
    }

    document.getElementById("listaProductos").innerHTML = htmlContentToAppend; 
}

function MostrarProducto(id) {
    localStorage.setItem("prodID", id);
    window.location = "product-info.html"
}

// Filtra y ordena los productos según el criterio seleccionado
function FiltrarProductos(criteria, array) {
    let result = [];
    if (criteria === ORDER_ASC_BY_NAME) {
        result = array.sort(function (a, b) {
            if (a.name < b.name) { return -1; }
            if (a.name > b.name) { return 1; }
            return 0;
        });
    } else if (criteria === ORDER_DESC_BY_NAME) {
        result = array.sort(function (a, b) {
            if (a.name > b.name) { return -1; }
            if (a.name < b.name) { return 1; }
            return 0;
        });
    } else if (criteria === ORDER_BY_SELL_COUNT) {
        result = array.sort(function (a, b) {
            let aCount = parseInt(a.soldCount);
            let bCount = parseInt(b.soldCount);

            if (aCount > bCount) { return -1; }
            if (aCount < bCount) { return 1; }
            return 0;
        });
    } else if (criteria === ORDER_DESC_BY_COST) {
        result = array.sort(function (a, b) {
            if (a.cost > b.cost) { return -1; }
            if (a.cost < b.cost) { return 1; }
            return 0;
        });
    } else if (criteria === ORDER_ASC_BY_COST) {
        result = array.sort(function (a, b) {
            if (a.cost < b.cost) { return -1; }
            if (a.cost > b.cost) { return 1; }
            return 0;
        });
    }

    return result;
}

// Filtra y muestra los productos según el criterio seleccionado
function FiltrarYMostrarProductos(sortCriteria, productsArray) {
    currentSortCriteria = sortCriteria;

    if (productsArray != undefined) {
        currentProductsArray = productsArray;
    }

    currentProductsArray = FiltrarProductos(currentSortCriteria, currentProductsArray);

    MostrarListaDeProductos(buscador.value);
}

// Asigna los eventos a los botones del filtrado de productos
function AsignarEventosBotonesFiltrado() {
    document.getElementById("sortAscName").addEventListener("click", function () {
        FiltrarYMostrarProductos(ORDER_ASC_BY_NAME);
    });

    document.getElementById("sortDscName").addEventListener("click", function () {
        FiltrarYMostrarProductos(ORDER_DESC_BY_NAME);
    });

    document.getElementById("sortAscCost").addEventListener("click", function () {
        FiltrarYMostrarProductos(ORDER_ASC_BY_COST);
    });

    document.getElementById("sortDscCost").addEventListener("click", function () {
        FiltrarYMostrarProductos(ORDER_DESC_BY_COST);
    });

    document.getElementById("sortCant").addEventListener("click", function () {
        FiltrarYMostrarProductos(ORDER_BY_SELL_COUNT);
    });
    
    // Asigna el evento al botón de filtro de precio
    document.getElementById("rangeFilterCost").addEventListener("click", function(){
        minCost = document.getElementById("rangeFilterCostMin").value;
        maxCost = document.getElementById("rangeFilterCostMax").value;
        
        minCost = (minCost != "") ? parseInt(minCost) : undefined;
        maxCost = (maxCost != "") ? parseInt(maxCost) : undefined;

        // Vuelve a mostrar la lista de productos con el nuevo filtro aplicado.
        MostrarListaDeProductos(buscador.value);
    });
}