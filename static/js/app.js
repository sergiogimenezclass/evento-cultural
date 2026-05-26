/* ==========================================================================
   GESTOR DE CURADURÍA CULTURAL - LÓGICA DE FRONTEND (VANILLA JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias del DOM
    const form = document.getElementById('evento-form');
    const formInputs = form.querySelectorAll('input, select, button');
    const submitBtn = document.getElementById('submit-btn');
    const statusToggle = document.getElementById('estado-toggle');
    const statusLabel = document.getElementById('status-label');
    const grid = document.getElementById('eventos-grid');
    const statsTotalActive = document.getElementById('stats-total-active');

    // Referencias y variables globales de Leaflet Map
    let leafletMap = null;
    const mapModal = document.getElementById('map-modal');
    const mapModalTitle = document.getElementById('map-modal-title');
    const mapModalAddress = document.getElementById('map-modal-address');
    const closeMapBtn = document.getElementById('close-map-btn');

    // Inicialización
    actualizarStatusLabel();
    cargarEventos();

    // ==========================================================================
    // MANEJADORES DE EVENTOS
    // ==========================================================================

    // Delegación de eventos para abrir el mapa interactivo
    grid.addEventListener('click', (e) => {
        const mapLink = e.target.closest('.card-map-link');
        if (mapLink) {
            e.preventDefault();
            const lat = parseFloat(mapLink.getAttribute('data-lat'));
            const lng = parseFloat(mapLink.getAttribute('data-lng'));
            const title = mapLink.getAttribute('data-title');
            const address = mapLink.getAttribute('data-address');
            abrirMapa(lat, lng, title, address);
        }
    });

    // Controladores de cierre del modal del mapa
    closeMapBtn.addEventListener('click', cerrarMapa);
    mapModal.addEventListener('click', (e) => {
        if (e.target === mapModal) cerrarMapa();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mapModal.classList.contains('active')) {
            cerrarMapa();
        }
    });

    // Cambio en el Switch de Estado (Borrador/Publicado)
    statusToggle.addEventListener('change', actualizarStatusLabel);

    // Envío del Formulario (Flujo Optimista)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Extraer los datos del formulario
        const titulo = document.getElementById('titulo').value.strip ? document.getElementById('titulo').value.strip() : document.getElementById('titulo').value;
        const disciplina = document.getElementById('disciplina').value;
        const fecha_hora = document.getElementById('fecha_hora').value;
        const direccion_original = document.getElementById('direccion_original').value;
        const estado = statusToggle.checked ? 'Publicado' : 'Borrador';

        const payload = { titulo, disciplina, fecha_hora, direccion_original, estado };

        // ID temporal único para la tarjeta optimista
        const tempId = 'temp-' + Date.now();

        // 2. Deshabilitar formulario visualmente
        toggleFormState(true);

        // 3. Crear e insertar tarjeta optimista
        insertarTarjetaOptimista(tempId, payload);

        // 4. Animación de procesamiento en el botón
        setSubmitButtonState('processing');

        try {
            // 5. Petición HTTP al servidor
            const response = await fetch('/api/eventos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Error en el servidor');
            }

            const eventoEnriquecido = await response.json();

            // 6. Éxito: Reemplazar tarjeta optimista con la enriquecida y reestablecer formulario
            reemplazarTarjetaOptimista(tempId, eventoEnriquecido);
            setSubmitButtonState('success');
            
            // Sonido o micro-vibración sutil si se soporta (opcional)
            if (navigator.vibrate) navigator.vibrate(50);

            setTimeout(() => {
                form.reset();
                actualizarStatusLabel();
                toggleFormState(false);
                setSubmitButtonState('normal');
            }, 2000);

        } catch (error) {
            console.error('Error al guardar el evento:', error);
            
            // 7. Fallo: Quitar tarjeta temporal, habilitar formulario y mostrar alerta de error
            eliminarTarjetaTemporal(tempId);
            mostrarErrorFormulario('No se pudo procesar la curaduría. Verifica la conexión o los datos.');
            
            toggleFormState(false);
            setSubmitButtonState('normal');
        }
    });

    // ==========================================================================
    // FUNCIONES COMPONENTES & DOM
    // ==========================================================================

    function actualizarStatusLabel() {
        if (statusToggle.checked) {
            statusLabel.textContent = 'Publicado';
            statusLabel.className = 'toggle-status published';
        } else {
            statusLabel.textContent = 'Borrador';
            statusLabel.className = 'toggle-status draft';
        }
    }

    function toggleFormState(disabled) {
        formInputs.forEach(input => {
            if (input !== submitBtn) {
                input.disabled = disabled;
            }
        });
        if (disabled) {
            submitBtn.disabled = true;
        } else {
            submitBtn.removeAttribute('disabled');
        }
    }

    function setSubmitButtonState(state) {
        if (state === 'processing') {
            submitBtn.className = 'submit-button processing';
            submitBtn.innerHTML = `
                <span class="material-symbols-outlined animate-spin">sync</span>
                <span>Procesando curaduría...</span>
            `;
        } else if (state === 'success') {
            submitBtn.className = 'submit-button success';
            submitBtn.innerHTML = `
                <span class="material-symbols-outlined">check_circle</span>
                <span>Evento Registrado</span>
            `;
        } else {
            submitBtn.className = 'submit-button';
            submitBtn.innerHTML = `
                <span class="material-symbols-outlined">add_circle</span>
                <span>Crear Evento</span>
            `;
        }
    }

    function mostrarErrorFormulario(mensaje) {
        // Remover error previo si existiera
        const errorPrevio = document.getElementById('form-error-msg');
        if (errorPrevio) errorPrevio.remove();

        const errorDiv = document.createElement('div');
        errorDiv.id = 'form-error-msg';
        errorDiv.style.backgroundColor = 'var(--error-container)';
        errorDiv.style.color = 'var(--error)';
        errorDiv.style.border = '1px solid rgba(186, 26, 26, 0.1)';
        errorDiv.style.padding = '0.75rem';
        errorDiv.style.borderRadius = 'var(--border-radius)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '1rem';
        errorDiv.style.textAlign = 'center';
        errorDiv.style.fontWeight = '500';
        errorDiv.textContent = mensaje;

        form.appendChild(errorDiv);

        // Desvanecer el error después de 5 segundos
        setTimeout(() => {
            errorDiv.style.transition = 'opacity 0.5s';
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }

    // ==========================================================================
    // RENDERIZADO DE TARJETAS
    // ==========================================================================

    function formatearFecha(fechaIso) {
        try {
            const date = new Date(fechaIso);
            if (isNaN(date.getTime())) return fechaIso;
            
            const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
            const fechaFormateada = date.toLocaleDateString('es-ES', opciones);
            
            const horas = String(date.getHours()).padStart(2, '0');
            const minutos = String(date.getMinutes()).padStart(2, '0');
            
            return `${fechaFormateada} - ${horas}:${minutos} hs`;
        } catch (e) {
            return fechaIso;
        }
    }

    function crearHTMLTarjeta(evento, esOptimista = false) {
        const badgeClass = evento.estado === 'Publicado' ? 'badge-published' : 'badge-draft';
        const cardOptimistaClass = esOptimista ? 'optimista' : '';
        const fechaFormateada = formatearFecha(evento.fecha_hora);

        // Determinación del estilo climático
        let climaClass = 'climate-normal';
        let climaIcon = 'wb_sunny';
        let climaLabel = 'Clima: Consultando';
        let climaDesc = 'Analizando pronóstico...';

        if (!esOptimista) {
            const alerta = evento.alerta_clima || '';
            climaLabel = alerta.toUpperCase();

            if (alerta.includes('Riesgo de Lluvia')) {
                climaClass = 'climate-crit';
                climaIcon = 'thunderstorm';
                climaDesc = 'Alerta crítica. Mover piezas de papel/exteriores.';
            } else if (alerta.includes('Alta Humedad') || alerta.includes('Humedad')) {
                climaClass = 'climate-risk';
                climaIcon = 'cloud_queue';
                climaDesc = 'Monitorear higrómetros en sala de exhibición.';
            } else if (alerta.includes('Estable')) {
                climaClass = 'climate-normal';
                climaIcon = 'light_mode';
                climaDesc = 'Condiciones ideales para montaje y transporte.';
            } else {
                climaClass = 'climate-normal';
                climaIcon = 'device_thermostat';
                climaDesc = 'No hay alertas críticas registradas.';
            }
        } else {
            climaClass = 'climate-normal animate-pulse';
            climaIcon = 'sync';
            climaLabel = 'Procesando curaduría...';
            climaDesc = 'Normalizando dirección y clima en tiempo real.';
        }

        const direccionAMostrar = esOptimista 
            ? evento.direccion_original 
            : (evento.direccion_normalizada || evento.direccion_original);

        // Generar el enlace del mapa si el evento no es optimista y cuenta con coordenadas
        const tieneCoordenadas = !esOptimista && evento.latitud !== null && evento.longitud !== null;
        const enlaceMapaHTML = tieneCoordenadas ? `
            <a class="card-map-link" data-lat="${evento.latitud}" data-lng="${evento.longitud}" data-title="${evento.titulo}" data-address="${direccionAMostrar}">
                <span class="material-symbols-outlined">map</span> Ver mapa
            </a>
        ` : '';

        return `
            <div class="card-header">
                <span class="badge ${badgeClass}">${evento.estado}</span>
                <button class="card-more-btn" title="Más opciones">
                    <span class="material-symbols-outlined">more_horiz</span>
                </button>
            </div>
            <div class="card-body">
                <h3>${evento.titulo}</h3>
                <div class="card-date">${fechaFormateada}</div>
                <div class="card-meta">
                    <div class="meta-item">
                        <span class="material-symbols-outlined">category</span>
                        <span>${evento.disciplina}</span>
                    </div>
                    <div class="meta-item">
                        <span class="material-symbols-outlined">location_on</span>
                        <div style="display: flex; flex-direction: column; align-items: flex-start;">
                            <span>${direccionAMostrar}</span>
                            ${enlaceMapaHTML}
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="climate-badge ${climaClass}">
                    <span class="material-symbols-outlined ${esOptimista ? 'animate-spin' : ''}">${climaIcon}</span>
                    <div class="climate-info">
                        <span class="climate-label">${climaLabel}</span>
                        <span class="climate-desc">${climaDesc}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function insertarTarjetaOptimista(tempId, datosFormulario) {
        const card = document.createElement('article');
        card.id = tempId;
        card.className = 'event-card optimista';
        card.innerHTML = crearHTMLTarjeta(datosFormulario, true);

        // Se inserta al principio de la grilla (antes del primer elemento)
        grid.insertBefore(card, grid.firstChild);
    }

    function reemplazarTarjetaOptimista(tempId, eventoReal) {
        const cardTemp = document.getElementById(tempId);
        if (cardTemp) {
            // Remueve clase optimista y cambia el ID al ID real persistido
            cardTemp.id = 'evento-' + eventoReal.id;
            cardTemp.className = 'event-card';
            cardTemp.innerHTML = crearHTMLTarjeta(eventoReal, false);
            
            // Aplicar efecto de fade-in sutil al contenido nuevo
            cardTemp.style.animation = 'none';
            void cardTemp.offsetWidth; // Dispara reflow
            cardTemp.style.animation = 'fadeIn 0.3s ease-out';
            
            actualizarMetricasActivas();
        }
    }

    function eliminarTarjetaTemporal(tempId) {
        const cardTemp = document.getElementById(tempId);
        if (cardTemp) {
            cardTemp.style.transition = 'all 0.3s ease-out';
            cardTemp.style.opacity = '0';
            cardTemp.style.transform = 'scale(0.8)';
            setTimeout(() => cardTemp.remove(), 300);
        }
    }

    // ==========================================================================
    // GESTIÓN DE DATOS & SERVIDOR
    // ==========================================================================

    async function cargarEventos() {
        try {
            const response = await fetch('/api/eventos');
            if (!response.ok) throw new Error('Error al traer los eventos');
            const eventos = await response.json();

            // Limpiar eventos previos (excepto la tarjeta de métricas)
            const cards = grid.querySelectorAll('.event-card');
            cards.forEach(card => card.remove());

            // Inyectar tarjetas cargadas en orden
            eventos.forEach(evento => {
                const card = document.createElement('article');
                card.id = 'evento-' + evento.id;
                card.className = 'event-card';
                card.innerHTML = crearHTMLTarjeta(evento, false);
                // Insertamos al principio para que los más nuevos aparezcan primero
                grid.appendChild(card);
            });

            // Re-adjuntar la tarjeta de métricas al final de la grilla Bento
            const statsCard = document.getElementById('stats-card');
            if (statsCard) {
                grid.appendChild(statsCard);
            }

            actualizarMetricasActivas(eventos);

        } catch (error) {
            console.error('Error al cargar eventos:', error);
            // Mostrar error amigable en el listado
            const errorMsg = document.createElement('div');
            errorMsg.style.gridColumn = '1 / -1';
            errorMsg.style.padding = '2rem';
            errorMsg.style.textAlign = 'center';
            errorMsg.style.color = 'var(--text-muted)';
            errorMsg.innerHTML = `
                <span class="material-symbols-outlined" style="font-size: 3rem; margin-bottom: 0.5rem; color: var(--outline)">cloud_off</span>
                <p style="font-weight: 500;">No pudimos cargar el archivo cultural.</p>
                <p style="font-size: 0.875rem; margin-top: 0.25rem;">Por favor, recarga la página o verifica la conexión con el servidor Flask.</p>
            `;
            grid.insertBefore(errorMsg, grid.firstChild);
        }
    }

    function actualizarMetricasActivas(eventosPrecargados) {
        if (eventosPrecargados) {
            const activos = eventosPrecargados.filter(e => e.estado === 'Publicado').length;
            statsTotalActive.textContent = activos;
        } else {
            // Contar directamente del DOM para actualizaciones rápidas
            const totalPublicados = grid.querySelectorAll('.badge-published').length;
            statsTotalActive.textContent = totalPublicados;
        }
    }

    // ==========================================================================
    // INTEGRACIÓN Y FUNCIONES DEL MAPA (LEAFLET.JS)
    // ==========================================================================

    function abrirMapa(lat, lng, titulo, direccion) {
        // Asignar los metadatos al modal
        mapModalTitle.textContent = titulo;
        mapModalAddress.textContent = direccion;
        
        // Activar visibilidad del modal (desencadena transición CSS de opacidad y glassmorphism)
        mapModal.classList.add('active');

        // Leaflet necesita que el contenedor DOM esté 100% renderizado y visible antes de inicializarse.
        // Usamos un pequeño delay de 150ms para esperar que finalice la animación CSS de entrada.
        setTimeout(() => {
            try {
                // Si ya existe un mapa instanciado previamente, lo removemos para evitar fugas de memoria
                // y el error "Map container is already initialized" de Leaflet.
                if (leafletMap !== null) {
                    leafletMap.remove();
                }

                // Crear mapa centrado en las coordenadas
                leafletMap = L.map('map-container').setView([lat, lng], 15);

                // Agregar capa de teselas (OpenStreetMap estándar)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap contributors'
                }).addTo(leafletMap);

                // Personalizar el marcador y agregar popup
                const marcador = L.marker([lat, lng]).addTo(leafletMap);
                marcador.bindPopup(`
                    <div style="font-family: var(--font-body); font-size: 13px;">
                        <h4 style="font-family: var(--font-headline); font-weight: 700; color: var(--primary); margin: 0 0 4px 0;">${titulo}</h4>
                        <p style="margin: 0; color: var(--text-muted);">${direccion}</p>
                    </div>
                `).openPopup();

                // Forzar a Leaflet a recalcular sus dimensiones en caso de fallas de renderizado parcial
                leafletMap.invalidateSize();

            } catch (error) {
                console.error("Error al inicializar Leaflet Map:", error);
            }
        }, 150);
    }

    function cerrarMapa() {
        mapModal.classList.remove('active');
        
        // Esperamos que termine la transición de salida (300ms) para destruir la instancia
        // y liberar recursos de memoria del mapa.
        setTimeout(() => {
            if (leafletMap !== null) {
                leafletMap.remove();
                leafletMap = null;
            }
        }, 300);
    }
});
