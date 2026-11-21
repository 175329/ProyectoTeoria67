/* =====================================================
   VALIDADOR DE INFORMACIÓN Y DOCUMENTOS - UPSLP
   Lógica de validación basada en AFD y Expresiones Regulares
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const inputs = {
        nombre: document.getElementById("nombre"),
        matricula: document.getElementById("matricula"),
        correo: document.getElementById("correo"),
        curp: document.getElementById("curp"),
        telefono: document.getElementById("telefono"),
        cp: document.getElementById("cp"),
        password: document.getElementById("password"),
        ip: document.getElementById("ip"),
        url: document.getElementById("url")
    };

    const btnAutodetectar = document.getElementById("btn-autodetectar");
    const estadoDeteccion = document.getElementById("estado-deteccion");
    const resumenBox = document.getElementById("resumen-validacion");

    /* =================================================
       FUNCIONES DE VALIDACIÓN POR CAMPO (AFD / REGEX)
    ================================================= */

    // 1. NOMBRE COMPLETO (3 a 8 palabras, Inicial Mayúscula, resto minúsculas)
    function validarNombre(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "El nombre es obligatorio." };
        }
        const charInvalido = texto.match(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/);
        if (charInvalido) {
            return {
                valido: false,
                error: `Se detectó el carácter no permitido '${charInvalido[0]}'. Solo se permiten letras y espacios.`
            };
        }
        if (/\s{2,}/.test(texto)) {
            return { valido: false, error: "No coloque espacios dobles entre palabras." };
        }

        const palabras = texto.split(" ");
        if (palabras.length < 3 || palabras.length > 8) {
            return {
                valido: false,
                error: `Debe contener entre 3 y 8 palabras (actualmente tiene ${palabras.length}).`
            };
        }

        for (let i = 0; i < palabras.length; i++) {
            const p = palabras[i];
            if (!/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+$/.test(p)) {
                return {
                    valido: false,
                    error: `La palabra '${p}' debe iniciar con mayúscula y continuar en minúsculas.`
                };
            }
        }

        return { valido: true, mensaje: "Nombre válido (estado de aceptación qF)." };
    }

    // 2. MATRÍCULA (1[789]NNNN)
    function validarMatricula(valor, correo) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "La matrícula es obligatoria." };
        }
        if (/[^0-9]/.test(texto)) {
            return { valido: false, error: "Solo se permiten dígitos numéricos (enviado a qD)." };
        }
        if (!/^1/.test(texto)) {
            return {
                valido: false,
                error: `Posición 1 (q0 → q1): debe iniciar con '1'; se encontró '${texto[0]}'.`
            };
        }
        if (texto.length >= 2 && !/^1[789]/.test(texto)) {
            return {
                valido: false,
                error: `Posición 2 (q1 → q2): se esperaba 7, 8 o 9; se encontró '${texto[1]}'.`
            };
        }
        if (texto.length !== 6) {
            return {
                valido: false,
                error: `Debe contener exactamente 6 dígitos (actualmente tiene ${texto.length}).`
            };
        }
        if (correo.trim() && !correo.trim().startsWith(texto + "@")) {
            return {
                valido: false,
                error: "Inconsistencia: la matrícula no coincide con el correo ingresado."
            };
        }

        return { valido: true, mensaje: "Matrícula válida y sincronizada (qF)." };
    }

    // 3. CORREO INSTITUCIONAL (1[789]NNNN@upslp.edu.mx)
    function validarCorreo(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "El correo institucional es obligatorio." };
        }
        if (!/^1/.test(texto)) {
            return {
                valido: false,
                error: "Posición 1 (q0 → q1): el correo debe iniciar con el dígito '1'."
            };
        }
        if (texto.length >= 2 && !/^1[789]/.test(texto)) {
            return {
                valido: false,
                error: `Posición 2 (q1 → q2): se esperaba 7, 8 o 9; se encontró '${texto[1]}'.`
            };
        }
        if (!/^1[789]\d{4}@upslp\.edu\.mx$/.test(texto)) {
            return {
                valido: false,
                error: "Formato requerido: 1[7/8/9]NNNN@upslp.edu.mx (ej. 177557@upslp.edu.mx)."
            };
        }

        return { valido: true, mensaje: "Correo institucional válido (qF)." };
    }

    // 4. CURP (Simulación AFD posición por posición: q0 -> qF / qD)
    function validarCURP(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "La CURP es obligatoria." };
        }

        const reglasAFD = [
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[HM]$/,  desc: "sexo 'H' o 'M'" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" },
            { regex: /^[0-9]$/, desc: "un número (0-9)" }
        ];

        const limite = Math.min(texto.length, 18);
        for (let i = 0; i < limite; i++) {
            const char = texto[i];
            if (!reglasAFD[i].regex.test(char)) {
                const siguienteEstado = i === 17 ? "qF" : `q${i + 1}`;
                return {
                    valido: false,
                    error: `Posición ${i + 1}: se esperaba ${reglasAFD[i].desc} y se encontró '${char}'. Transición: q${i} → ${siguienteEstado} (enviado a qD).`
                };
            }
        }

        if (texto.length < 18) {
            return {
                valido: false,
                error: `CURP incompleta (${texto.length}/18 caracteres). Estado actual: q${texto.length}.`
            };
        }
        if (texto.length > 18) {
            return {
                valido: false,
                error: `Excede los 18 caracteres (${texto.length}). Enviado al estado trampa qD.`
            };
        }

        return { valido: true, mensaje: "CURP válida (18/18 posiciones verificadas, qF)." };
    }

    // 5. TELÉFONO (Exactamente 10 dígitos)
    function validarTelefono(valor) {
        if (!valor) {
            return { valido: false, error: "El número telefónico es obligatorio." };
        }
        for (let i = 0; i < valor.length; i++) {
            if (!/[0-9]/.test(valor[i])) {
                return {
                    valido: false,
                    error: `Se detectó '${valor[i]}' en la posición ${i + 1}. Solo se permiten números.`
                };
            }
        }
        if (valor.length !== 10) {
            return {
                valido: false,
                error: `Debe contener exactamente 10 dígitos (actualmente tiene ${valor.length}).`
            };
        }
        return { valido: true, mensaje: "Teléfono válido (10 dígitos, qF)." };
    }

    // 6. CÓDIGO POSTAL (Exactamente 5 dígitos)
    function validarCP(valor) {
        if (!valor) {
            return { valido: false, error: "El código postal es obligatorio." };
        }
        for (let i = 0; i < valor.length; i++) {
            if (!/[0-9]/.test(valor[i])) {
                return {
                    valido: false,
                    error: `Se detectó '${valor[i]}' en la posición ${i + 1}. Solo se permiten números.`
                };
            }
        }
        if (valor.length !== 5) {
            return {
                valido: false,
                error: `Debe contener exactamente 5 dígitos (actualmente tiene ${valor.length}).`
            };
        }
        return { valido: true, mensaje: "Código Postal válido (qF)." };
    }

    // 7. CONTRASEÑA ([Símbolo permitido][Mayúscula][8 caracteres válidos] = 10 caracteres)
    function validarPassword(valor) {
        if (!valor) {
            return { valido: false, error: "La contraseña es obligatoria." };
        }
        const simboloPermitido = /^[-\/_.|+^]$/;
        const caracterValido = /^[A-Za-z0-9\/_.|+^-]$/;

        if (!simboloPermitido.test(valor[0])) {
            return {
                valido: false,
                error: `Posición 1 (q0 → q1): debe iniciar con un símbolo permitido (- / _ . | + ^). Se encontró '${valor[0]}'.`
            };
        }
        if (valor.length >= 2 && !/^[A-Z]$/.test(valor[1])) {
            return {
                valido: false,
                error: `Posición 2 (q1 → q2): debe ser una letra mayúscula (A-Z). Se encontró '${valor[1]}'.`
            };
        }
        for (let i = 2; i < valor.length; i++) {
            if (!caracterValido.test(valor[i])) {
                return {
                    valido: false,
                    error: `Posición ${i + 1}: el carácter '${valor[i]}' no está permitido.`
                };
            }
        }
        if (valor.length !== 10) {
            return {
                valido: false,
                error: `Debe tener exactamente 10 caracteres: [Símbolo][Mayúscula][8 válidos] (actualmente tiene ${valor.length}).`
            };
        }

        return { valido: true, mensaje: "Contraseña válida (qF)." };
    }

    // 8. DIRECCIÓN IP (IPv4: 4 bloques de 0 a 255 separados por punto)
    function validarIP(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "La dirección IP es obligatoria." };
        }
        if (/[^0-9.]/.test(texto)) {
            return {
                valido: false,
                error: "Solo se permiten números (0-9) y puntos '.' en formato IPv4."
            };
        }

        const bloques = texto.split(".");
        if (bloques.length !== 4) {
            return {
                valido: false,
                error: `Formato IPv4 incompleto: debe tener 4 bloques separados por punto (tiene ${bloques.length}).`
            };
        }

        for (let i = 0; i < 4; i++) {
            const bloque = bloques[i];
            if (bloque === "") {
                return {
                    valido: false,
                    error: `El bloque ${i + 1} está vacío. Revise los puntos consecutivos o al final.`
                };
            }
            if (bloque.length > 1 && bloque.startsWith("0")) {
                return {
                    valido: false,
                    error: `El bloque ${i + 1} ('${bloque}') no debe llevar ceros a la izquierda.`
                };
            }
            const num = Number(bloque);
            if (num < 0 || num > 255) {
                return {
                    valido: false,
                    error: `El bloque ${i + 1} ('${bloque}') está fuera de rango (debe estar entre 0 y 255).`
                };
            }
        }

        return { valido: true, mensaje: "Dirección IPv4 válida (qF)." };
    }

    // 9. URL (http:// o https://, dominio + extensión, ruta opcional, sin puerto ni acentos/ñ)
    function validarURL(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "La dirección URL es obligatoria." };
        }
        if (/\s/.test(texto)) {
            return { valido: false, error: "La URL no debe contener espacios." };
        }
        if (/[ñÑáéíóúÁÉÍÓÚüÜ]/.test(texto)) {
            return { valido: false, error: "No se permiten acentos ni la letra ñ en la URL." };
        }
        if (!/^https?:\/\//.test(texto)) {
            return {
                valido: false,
                error: "Debe iniciar con el protocolo 'http://' o 'https://'."
            };
        }
        if (/^https?:\/\/[^\/]+:\d+/.test(texto)) {
            return {
                valido: false,
                error: "No se aceptan URLs con número de puerto explícito."
            };
        }

        const regexURL = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9\-._~\/?&#=%+]*)?$/;
        if (!regexURL.test(texto)) {
            return {
                valido: false,
                error: "Estructura inválida. Ejemplo esperado: https://www.upslp.edu.mx"
            };
        }

        return { valido: true, mensaje: "URL válida (qF)." };
    }

    /* =================================================
       ACTUALIZACIÓN VISUAL DE CADA CAMPO
    ================================================= */

    function aplicarEstadoVisual(input, msgId, resultado) {
        const msgEl = document.getElementById(msgId);
        input.classList.remove("correcto", "incorrecto");
        msgEl.classList.remove("exito", "error");

        if (resultado.valido) {
            input.classList.add("correcto");
            msgEl.classList.add("exito");
            msgEl.textContent = "✓ " + resultado.mensaje;
        } else {
            input.classList.add("incorrecto");
            msgEl.classList.add("error");
            msgEl.textContent = "✕ " + resultado.error;
        }
    }

    /* =================================================
       EVENTOS EN TIEMPO REAL Y SINCRONIZACIÓN BIDIRECCIONAL
    ================================================= */

    inputs.nombre.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.nombre, "msg-nombre", validarNombre(inputs.nombre.value));
    });

    // Si escribe la MATRÍCULA -> genera el CORREO automáticamente
    inputs.matricula.addEventListener("input", () => {
        const mat = inputs.matricula.value.trim();
        inputs.correo.value = mat.length > 0 ? `${mat}@upslp.edu.mx` : "";

        aplicarEstadoVisual(inputs.matricula, "msg-matricula", validarMatricula(mat, inputs.correo.value));
        aplicarEstadoVisual(inputs.correo, "msg-correo", validarCorreo(inputs.correo.value));
    });

    // Si escribe el CORREO -> extrae hasta 6 dígitos iniciales y completa MATRÍCULA
    inputs.correo.addEventListener("input", () => {
        const correo = inputs.correo.value.trim();
        const parteUsuario = correo.split("@")[0];
        const digitos = parteUsuario.match(/^\d{1,6}/);

        if (digitos) {
            inputs.matricula.value = digitos[0];
        } else if (correo === "") {
            inputs.matricula.value = "";
        }

        aplicarEstadoVisual(inputs.correo, "msg-correo", validarCorreo(correo));
        aplicarEstadoVisual(inputs.matricula, "msg-matricula", validarMatricula(inputs.matricula.value, correo));
    });

    inputs.curp.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.curp, "msg-curp", validarCURP(inputs.curp.value));
    });

    inputs.telefono.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.telefono, "msg-telefono", validarTelefono(inputs.telefono.value));
    });

    inputs.cp.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.cp, "msg-cp", validarCP(inputs.cp.value));
    });

    inputs.password.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.password, "msg-password", validarPassword(inputs.password.value));
    });

    inputs.ip.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.ip, "msg-ip", validarIP(inputs.ip.value));
    });

    inputs.url.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.url, "msg-url", validarURL(inputs.url.value));
    });

    /* =================================================
       BOTÓN DE AUTODETECCIÓN (IP PÚBLICA Y URL ACTUAL)
    ================================================= */

    btnAutodetectar.addEventListener("click", async () => {
        btnAutodetectar.disabled = true;
        btnAutodetectar.textContent = "Detectando...";
        estadoDeteccion.textContent = "Consultando dirección IP pública y URL actual...";

        // 1. Evaluar URL actual
        const urlActual = window.location.href;
        if (/^https?:\/\//.test(urlActual) && !urlActual.includes("localhost") && !urlActual.includes("127.0.0.1")) {
            inputs.url.value = urlActual;
            aplicarEstadoVisual(inputs.url, "msg-url", validarURL(inputs.url.value));
        } else {
            inputs.url.value = "https://www.upslp.edu.mx";
            aplicarEstadoVisual(inputs.url, "msg-url", validarURL(inputs.url.value));
        }

        // 2. Consultar IP pública (IPv4)
        try {
            const resp = await fetch("https://api.ipify.org?format=json");
            const data = await resp.json();
            inputs.ip.value = data.ip;
            aplicarEstadoVisual(inputs.ip, "msg-ip", validarIP(inputs.ip.value));
            estadoDeteccion.textContent = "Datos cargados. Puedes editarlos manualmente para probar casos inválidos.";
        } catch (err) {
            inputs.ip.value = "192.168.1.1";
            aplicarEstadoVisual(inputs.ip, "msg-ip", validarIP(inputs.ip.value));
            estadoDeteccion.textContent = "Sin conexión externa: se cargó una IP de ejemplo editable (192.168.1.1).";
        } finally {
            btnAutodetectar.disabled = false;
            btnAutodetectar.textContent = "Autodetectar IP y URL";
        }
    });

    /* =================================================
       VALIDACIÓN FINAL AL PULSAR "CONFIRMAR DATOS"
    ================================================= */

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const evaluaciones = [
            { nombre: "Nombre Completo", input: inputs.nombre, msgId: "msg-nombre", res: validarNombre(inputs.nombre.value) },
            { nombre: "Matrícula", input: inputs.matricula, msgId: "msg-matricula", res: validarMatricula(inputs.matricula.value, inputs.correo.value) },
            { nombre: "Correo Institucional", input: inputs.correo, msgId: "msg-correo", res: validarCorreo(inputs.correo.value) },
            { nombre: "CURP", input: inputs.curp, msgId: "msg-curp", res: validarCURP(inputs.curp.value) },
            { nombre: "Número Telefónico", input: inputs.telefono, msgId: "msg-telefono", res: validarTelefono(inputs.telefono.value) },
            { nombre: "Código Postal", input: inputs.cp, msgId: "msg-cp", res: validarCP(inputs.cp.value) },
            { nombre: "Contraseña", input: inputs.password, msgId: "msg-password", res: validarPassword(inputs.password.value) },
            { nombre: "Dirección IP", input: inputs.ip, msgId: "msg-ip", res: validarIP(inputs.ip.value) },
            { nombre: "Dirección URL", input: inputs.url, msgId: "msg-url", res: validarURL(inputs.url.value) }
        ];

        const errores = [];

        evaluaciones.forEach((item) => {
            aplicarEstadoVisual(item.input, item.msgId, item.res);
            if (!item.res.valido) {
                errores.push(`<strong>${item.nombre}:</strong> ${item.res.error}`);
            }
        });

        resumenBox.classList.remove("resumen-oculto", "resumen-errores", "resumen-exito");

        if (errores.length > 0) {
            resumenBox.classList.add("resumen-errores");
            resumenBox.innerHTML = `
                <h3>Se encontraron ${errores.length} error(es) en el registro:</h3>
                <ul>${errores.map(err => `<li>${err}</li>`).join("")}</ul>
                <p>Corrija los campos marcados en rojo e inténtelo nuevamente.</p>
            `;
            resumenBox.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            resumenBox.classList.add("resumen-exito");
            resumenBox.innerHTML = `
                <h3>Registro completado correctamente</h3>
                <p>Todos los campos cumplieron las reglas de los autómatas (estado de aceptación <strong>qF</strong>) y la consistencia Matrícula ↔ Correo fue verificada.</p>
            `;
            resumenBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
});
