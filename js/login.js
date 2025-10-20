
// Evento que se ejecuta cuando la página ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {

    // Obtengo el botón de ingresar
    let boton = document.getElementById("login");

    // Asigno el evento click al botón de ingresar
    boton.addEventListener("click", (event) => {
        event.preventDefault();

        // Obtengo los valores de los campos del formulario
        let email = document.getElementById("email").value.trim();
        let pass = document.getElementById("password").value.trim();
        let mantenerSesion = document.getElementById("mantenerSesion").checked;

        // Verificar que el usuario existe en el localStorage
        let usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
        if (usuarioGuardado != null && usuarioGuardado.email === email) {
            // TODO: Verificar la contraseña
            
            // Si el usuario existe, lo conectamos y lo redirecciono al index
            usuarioGuardado.conectado = true;
            localStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
            sessionStorage.setItem("usuario", JSON.stringify(usuarioGuardado));
            location.href = "index.html";
            return;
        }

        // Verifico que los campos no estén vacíos
        if (email.length > 0 && pass.length > 0) {

            // Guardo el email en sessionStorage y, si se indicó mantener sesión, en localStorage
            let usuario = { email: email, conectado: true};
            sessionStorage.setItem("usuario", JSON.stringify(usuario));
            if (mantenerSesion) {
                localStorage.setItem("usuario", JSON.stringify(usuario));
            }

            // Redirijo a la página principal
            location.href = "index.html";

        } else {
            // En caso de que falte completar algún campo, muestro una alerta
            alert("Falta rellenar Email o Contraseña");
        }
    });
});