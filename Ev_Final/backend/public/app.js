const API = '/api/dishes';
let state = { page: 1, pages: 1, q: '', category: '' };

const $ = (s) => document.querySelector(s);
const tbody = $('#dishes-table tbody');
const pageInd = $('#page-indicator');


async function fetchDishes() {
  const params = new URLSearchParams({ page: state.page, limit: 8 });
  if (state.q) params.append('q', state.q);
  if (state.category) params.append('category', state.category);

  const res = await fetch(`${API}?${params}`);
  const data = await res.json();

  state.pages = data.pages;
  renderRows(data.items);
  pageInd.textContent = `Página ${data.page} de ${data.pages || 1}`;
}


function renderRows(items) {
  tbody.innerHTML = items.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>S/ ${(+d.price).toFixed(2)}</td>
      <td><span class="badge">${d.category}</span></td>
      <td>${d.spicy ? 'Si' : 'No deseo'}</td>
      <td>
        <button data-edit="${d._id}">Editar</button>
        <button data-del="${d._id}" class="secondary">Eliminar</button>
      </td>
    </tr>
  `).join('');
}


document.addEventListener('click', async (e) => {
  const idEdit = e.target.dataset.edit;
  const idDel = e.target.dataset.del;

  if (idEdit) { // Editar
    const d = await (await fetch(`${API}/${idEdit}`)).json();
    $('#dish-id').value = d._id;
    $('#name').value = d.name;
    $('#price').value = d.price;
    $('#category').value = d.category;
    $('#spicy').checked = !!d.spicy;
    $('#description').value = d.description || '';
    $('#submit-btn').textContent = 'Actualizar';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (idDel && confirm('¿Eliminar este plato?')) {
    await fetch(`${API}/${idDel}`, { method: 'DELETE' });
    fetchDishes();
  }
});


$('#dish-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: $('#name').value.trim(),
    price: +$('#price').value,
    category: $('#category').value,
    spicy: $('#spicy').checked,
    description: $('#description').value.trim()
  };
  if (!payload.name || isNaN(payload.price)) return alert('Completa nombre y precio.');

  const id = $('#dish-id').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API}/${id}` : API;

  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

  $('#dish-form').reset();
  $('#dish-id').value = '';
  $('#submit-btn').textContent = 'Guardar';
  fetchDishes();
});


$('#reset-btn').addEventListener('click', () => {
  $('#dish-form').reset();
  $('#dish-id').value = '';
  $('#submit-btn').textContent = 'Guardar';
});


$('#search').addEventListener('input', (e) => {
  state.q = e.target.value.trim();
  state.page = 1;
  fetchDishes();
});
$('#filter-category').addEventListener('change', (e) => {
  state.category = e.target.value;
  state.page = 1;
  fetchDishes();
});


$('#prev').addEventListener('click', () => {
  if (state.page > 1) { state.page--; fetchDishes(); }
});
$('#next').addEventListener('click', () => {
  if (state.page < state.pages) { state.page++; fetchDishes(); }
});


$('#seed-btn').addEventListener('click', async () => {
  await fetch(`${API}/seed`, { method: 'POST' });
  state.page = 1;
  fetchDishes();
});


fetchDishes();
