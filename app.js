const API = "https://api.restcountries.com/countries/v5";
const CAMPOS = "response_fields=names.common,capitals,region,population,flag.url_png";

async function pedirPaises(url) {
  const respuesta = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` }
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error("API key faltante o inválida.");
    if (respuesta.status === 429) throw new Error("Demasiadas peticiones, espera unos segundos.");
    throw new Error(`Error del servidor (código ${respuesta.status}).`);
  }

  const json = await respuesta.json();
  return json.data?.objects ?? [];
}

async function buscarPais(nombre) {
  const url = `${API}/name?q=${encodeURIComponent(nombre)}&${CAMPOS}`;
  const paises = await pedirPaises(url);
  if (paises.length === 0) {
    throw new Error("No se encontró ningún país con ese nombre.");
  }
  return paises;
}

// paises de una región
async function buscarRegion(region) {
  const url = `${API}/region/${encodeURIComponent(region)}?limit=100&${CAMPOS}`;
  const paises = await pedirPaises(url);
  if (paises.length === 0) {
    throw new Error("No se encontraron países en esa región.");
  }
  return paises;
}

function mostrarPaises(paises) {
  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = "";

  paises.forEach(pais => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.innerHTML = `
      <img src="${pais.flag.url_png}" alt="Bandera de ${pais.names.common}">
      <h3>${pais.names.common}</h3>
      <p><b>Capital:</b> ${pais.capitals?.length ? pais.capitals[0].name : "Sin capital"}</p>
      <p><b>Región:</b> ${pais.region}</p>
      <p><b>Población:</b> ${pais.population?.toLocaleString("es-MX") ?? "Sin dato"}</p>
    `;
    contenedor.appendChild(tarjeta);
  });
}

const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");
const selRegion = document.getElementById("selRegion");

// Carga paises, ya sea por nombre o por region
async function cargar(obtener) {
  mensaje.textContent = "Cargando...";
  try {
    const paises = await obtener();
    mostrarPaises(paises);
    mensaje.textContent = `${paises.length} resultado(s)`;
  } catch (error) {
    document.getElementById("resultados").innerHTML = "";
    mensaje.textContent = error instanceof TypeError
      ? "No hay conexión con el servidor. Revisa tu internet."
      : error.message;
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  selRegion.value = "";
  const nombre = document.getElementById("txtPais").value.trim();
  cargar(() => buscarPais(nombre));
});

selRegion.addEventListener("change", () => {
  if (!selRegion.value) return;
  document.getElementById("txtPais").value = "";
  cargar(() => buscarRegion(selRegion.value));
});