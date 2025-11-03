document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("email");
  const nombre = document.getElementById("nombre");
  const apellido = document.getElementById("apellido");
  const telefono = document.getElementById("telefono");
  const form = document.getElementById("perfilForm");
  const btnActualizarPerfil = document.querySelector(".btnActualizarPerfil");
  const btnCambiarFoto = document.getElementById("btnFotoPerfil");
  const fotoPerfil = document.getElementById("perfilFoto");
  

  // Traer datos guardados
  const usuario = JSON.parse(localStorage.getItem("usuario")) || {};

  // El formulario empezará vacío siempre
  email.value = "";
  nombre.value = "";
  if (apellido) apellido.value = "";
  if (telefono) telefono.value = "";

  if (usuario.email) email.value = usuario.email;
  if (usuario.nombre) nombre.value = usuario.nombre;
  if (usuario.apellido) apellido.value = usuario.apellido;
  if (usuario.telefono) telefono.value = usuario.telefono;
  if (usuario.foto) fotoPerfil.src = usuario.foto;
  function GuardarDatos() {
    if (!form.checkValidity()) {
      // Si no es válido, mostrar validación visual y NO guardar
      form.classList.add("was-validated");
      return false;
    }

    // Solo si el formulario es válido, guardar los datos
    usuario.email = email.value;
    usuario.nombre = nombre.value;
    usuario.apellido = apellido.value;
    usuario.telefono = telefono.value;

    localStorage.setItem("usuario", JSON.stringify(usuario));
    Swal.fire({
      title: "¡Éxito!",
      text: "Datos actualizados correctamente.",
      icon: "success",
      timer: 3000,
      showConfirmButton: true,
      confirmButtonColor: "var(--color_principal)",
      confirmButtonText: "Aceptar",
    });
    return true;
  }

  // Guardar cambios al enviar el formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    GuardarDatos();
  });

  if (btnActualizarPerfil) {
    btnActualizarPerfil.addEventListener("click", (e) => {
      e.preventDefault();
      GuardarDatos();
    });
  }


  // Función para validar email
  function ValidarEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Cambiar foto de perfil
  btnCambiarFoto.addEventListener("click", (e) => {
    CambiarFotoPerfil();
  })
  function CambiarFotoPerfil() {
    //input archivo invisible
    const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";

      //usuario selecciona archivo
      fileInput.addEventListener("change", () => {
        const file = fileInput.files && fileInput.files[0];
        if (!file) return;
  
        // Se lee el archivo cn FileReader y lo convierte a DataURL (base64)
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const usuario = JSON.parse(localStorage.getItem("usuario")) || {};
          usuario.foto = dataUrl;
          localStorage.setItem("usuario", JSON.stringify(usuario));

          Swal.fire({
            title: "¡Éxito!",
            text: "Foto de perfil actualizada.",
            icon: "success",
            showConfirmButton: true,
            confirmButtonColor: "var(--color_principal)",
            confirmButtonText: "Aceptar",
          });

          // Actualizar vista previa si existe alguna imagen en la página
          const imgPerfil = document.getElementById("perfilFoto");
          if (imgPerfil) {
            imgPerfil.src = dataUrl;
          }
        };

        reader.onerror = () => {
          Swal.fire({
            title: "Error",
            text: "No se pudo leer la imagen.",
            icon: "error",
            confirmButtonColor: "var(--color_principal)",
          });
        };

        reader.readAsDataURL(file);
      });

      // Añadir al DOM para que funcione en todos los navegadores y abrir selector
      document.body.appendChild(fileInput);
      fileInput.click();

      // Limpiar input después de usarlo
      fileInput.addEventListener("blur", () => fileInput.remove());
      fileInput.addEventListener("change", () => setTimeout(() => fileInput.remove(), 500));
   
  }
  });