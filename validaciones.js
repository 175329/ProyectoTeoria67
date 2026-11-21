/* =====================================================
   VALIDADOR DE INFORMACIÓN Y DOCUMENTOS - UPSLP
   Lógica de validación basada en AFD y Expresiones Regulares
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const inputs = {
        nombre: document.getElementById("nombre"),
        correo: document.getElementById("correo"),
        matricula: document.getElementById("matricula"),
        curp: document.getElementById("curp"),
        telefono: document.getElementById("telefono"),
        cp: document.getElementById("cp"),
        password: document.getElementById("password")
    };
    const resumenBox = document.getElementById("resumen-validacion");

    // Estado interno de IP y URL
    let estadoSistema = {
        ipValida: true,
        urlValida: true
    };

    // Iniciar verificación automática de IP y URL
    verificarConexionYUrl();

    /* =================================================
       FUNCIONES DE VALIDACIÓN POR CAMPO (AFD / REGEX)
    ================================================= */

    // 1. NOMBRE COMPLETO (3 a 8 palabras, Inicial Mayúscula, resto minúsculas)
    function validarNombre(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "El nombre es obligatorio." };
        }
        // Revisar caracteres prohibidos (números o símbolos)
        const charInvalido = texto.match(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/);
        if (charInvalido) {
            return {
                valido: false,
                error: `Se detectó el carácter no permitido '${charInvalido[0]}'. Solo se permiten letras y espacios.`
            };
        }
        // Detectar espacios dobles
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
                    error: `La palabra '${p}' es inválida: debe iniciar con mayúscula y continuar en minúsculas.`
                };
            }
        }

        return { valido: true, mensaje: "Nombre válido (estado de aceptación qF)." };
    }

    // 2. CORREO INSTITUCIONAL (1[789]NNNN@upslp.edu.mx)
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

    // 3. MATRÍCULA (Automática, readonly y consistente con el correo)
    function validarMatricula(valor, correo) {
        if (!valor) {
            return {
                valido: false,
                error: "Se llena automáticamente al escribir un correo institucional válido."
            };
        }
        if (!/^1[789]\d{4}$/.test(valor)) {
            return {
                valido: false,
                error: "Matrícula inválida: debe tener 6 dígitos e iniciar con 17, 18 o 19."
            };
        }
        if (!correo.trim().startsWith(valor)) {
            return {
                valido: false,
                error: "Inconsistencia: la matrícula no coincide con los primeros 6 dígitos del correo."
            };
        }
        return { valido: true, mensaje: "Matrícula sincronizada correctamente (qF)." };
    }

    // 4. CURP (Simulación AFD posición por posición: q0 -> qF / qD)
    function validarCURP(valor) {
        const texto = valor.trim();
        if (!texto) {
            return { valido: false, error: "La CURP es obligatoria." };
        }

        // Reglas del AFD por posición (0 a 17)
        const reglasAFD = [
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 1: q0->q1
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 2: q1->q2
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 3: q2->q3
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 4: q3->q4
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 5: q4->q5
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 6: q5->q6
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 7: q6->q7
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 8: q7->q8
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 9: q8->q9
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 10: q9->q10
            { regex: /^[HM]$/,  desc: "sexo 'H' o 'M'" },            // 11: q10->q11
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 12: q11->q12
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 13: q12->q13
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 14: q13->q14
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 15: q14->q15
            { regex: /^[A-Z]$/, desc: "una letra mayúscula (A-Z)" }, // 16: q15->q16
            { regex: /^[0-9]$/, desc: "un número (0-9)" },           // 17: q16->q17
            { regex: /^[0-9]$/, desc: "un número (0-9)" }            // 18: q17->qF
        ];

        const limite = Math.min(texto.length, 18);
        for (let i = 0; i < limite; i++) {
            const char = texto[i];
            if (!reglasAFD[i].regex.test(char)) {
                const siguienteEstado = i === 17 ? "qF" : `q${i + 1}`;
                return {
                    valido: false,
                    error: `Posición ${i + 1}: se esperaba ${reglasAFD[i].desc} y se encontró '${char}'. Transición esperada: q${i} → ${siguienteEstado} (enviado a qD).`
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

    // 5. TELÉFONO (Exactamente 10 dígitos sin símbolos ni espacios)
    function validarTelefono(valor) {
        if (!valor) {
            return { valido: false, error: "El número telefónico es obligatorio." };
        }
        for (let i = 0; i < valor.length; i++) {
            if (!/[0-9]/.test(valor[i])) {
                return {
                    valido: false,
                    error: `Se detectó el carácter no permitido '${valor[i]}' en la posición ${i + 1}. Solo se permiten números.`
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

    // 6. CÓDIGO POSTAL (Exactamente 5 dígitos - formato mexicano)
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
                    error: `Posición ${i + 1}: el carácter '${valor[i]}' no está permitido por el autómata.`
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

    /* =================================================
       VERIFICACIÓN AUTOMÁTICA DE IP (IPv4) Y URL
    ================================================= */

    async function verificarConexionYUrl() {
        const badgeIP = document.getElementById("estado-ip");
        const badgeURL = document.getElementById("estado-url");

        // 1. Validar URL actual
        const urlActual = window.location.href;
        const regexURL = /^https?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[^\s]*)?$/;

        if (regexURL.test(urlActual)) {
            estadoSistema.urlValida = true;
            badgeURL.className = "badge-estado badge-ok";
            badgeURL.textContent = `URL válida: ${urlActual}`;
        } else if (urlActual.startsWith("file://") || urlActual.includes("localhost") || urlActual.includes("127.0.0.1")) {
            estadoSistema.urlValida = true;
            badgeURL.className = "badge-estado badge-aviso";
            badgeURL.textContent = `Modo prueba local detectado (${urlActual.split("/").pop()})`;
        } else {
            estadoSistema.urlValida = false;
            badgeURL.className = "badge-estado badge-error";
            badgeURL.textContent = "La URL no cumple con el formato http(s):// válido.";
        }

        // 2. Detectar y validar IP pública (IPv4)
        const regexIPv4 = /^((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
        try {
            const resp = await fetch("https://api.ipify.org?format=json");
            const data = await resp.json();
            if (regexIPv4.test(data.ip)) {
                estadoSistema.ipValida = true;
                badgeIP.className = "badge-estado badge-ok";
                badgeIP.textContent = `IP pública válida (IPv4): ${data.ip}`;
            } else {
                estadoSistema.ipValida = false;
                badgeIP.className = "badge-estado badge-error";
                badgeIP.textContent = `La IP detectada (${data.ip}) no cumple formato IPv4.`;
            }
        } catch (err) {
            estadoSistema.ipValida = true; // No bloquea si presentan sin internet
            badgeIP.className = "badge-estado badge-aviso";
            badgeIP.textContent = "Sin conexión externa para consultar IP pública (modo local).";
        }
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
       EVENTOS EN TIEMPO REAL
    ================================================= */

    inputs.nombre.addEventListener("input", () => {
        aplicarEstadoVisual(inputs.nombre, "msg-nombre", validarNombre(inputs.nombre.value));
    });

    // Al escribir el correo, extrae los primeros 6 dígitos y los copia a Matrícula
    inputs.correo.addEventListener("input", () => {
        const valorCorreo = inputs.correo.value.trim();
        const coincidenciaDigitos = valorCorreo.match(/^\d{1,6}/);
        inputs.matricula.value = coincidenciaDigitos ? coincidenciaDigitos[0] : "";

        aplicarEstadoVisual(inputs.correo, "msg-correo", validarCorreo(valorCorreo));
        aplicarEstadoVisual(
            inputs.matricula,
            "msg-matricula",
            validarMatricula(inputs.matricula.value, valorCorreo)
        );
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

    /* =================================================
       VALIDACIÓN FINAL AL PULSAR "CONFIRMAR DATOS"
    ================================================= */

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const evaluaciones = [
            { nombre: "Nombre Completo", input: inputs.nombre, msgId: "msg-nombre", res: validarNombre(inputs.nombre.value) },
            { nombre: "Correo Electrónico", input: inputs.correo, msgId: "msg-correo", res: validarCorreo(inputs.correo.value) },
            { nombre: "Matrícula", input: inputs.matricula, msgId: "msg-matricula", res: validarMatricula(inputs.matricula.value, inputs.correo.value) },
            { nombre: "CURP", input: inputs.curp, msgId: "msg-curp", res: validarCURP(inputs.curp.value) },
            { nombre: "Número Telefónico", input: inputs.telefono, msgId: "msg-telefono", res: validarTelefono(inputs.telefono.value) },
            { nombre: "Código Postal", input: inputs.cp, msgId: "msg-cp", res: validarCP(inputs.cp.value) },
            { nombre: "Contraseña", input: inputs.password, msgId: "msg-password", res: validarPassword(inputs.password.value) }
        ];

        const errores = [];

        evaluaciones.forEach((item) => {
            aplicarEstadoVisual(item.input, item.msgId, item.res);
            if (!item.res.valido) {
                errores.push(`<strong>${item.nombre}:</strong> ${item.res.error}`);
            }
        });

        // Verificación final de consistencia global
        if (!estadoSistema.ipValida) {
            errores.push("<strong>Dirección IP:</strong> La IP detectada no cumple el formato IPv4.");
        }
        if (!estadoSistema.urlValida) {
            errores.push("<strong>URL:</strong> La dirección de la página no es válida.");
        }

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
                <p>Todos los campos pasaron las validaciones de los autómatas (estado de aceptación <strong>qF</strong>) y la consistencia Correo ↔ Matrícula fue verificada.</p>
            `;
            resumenBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
});
