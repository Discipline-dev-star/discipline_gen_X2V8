/**
 * combinations.js
 * Управление связями между модулями (привычки, биометрика, финансы)
 */

let habits = [];
let categories = [];
let habitBiometricLinks = [];
let habitFinanceLinks = [];
let biometricCharacteristics = [];

// ===== ИНИЦИАЛИЗАЦИЯ =====
async function init() {
  await loadHabits();
  await loadCategories();
  await loadHabitBiometricLinks();
  await loadHabitFinanceLinks();
  await loadBiometricCharacteristics();
  
  setupEventListeners();
  renderLists();
}

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadHabits() {
  try {
    const res = await fetch('/api/habit');
    habits = await res.json();
    
    // Заполнить select'ы с привычками
    const selects = ['hb-habit-id', 'hf-habit-id'];
    selects.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = '<option value="">Выберите привычку...</option>';
        habits.forEach(h => {
          const opt = document.createElement('option');
          opt.value = h.id;
          opt.textContent = h.name;
          el.appendChild(opt);
        });
      }
    });
  } catch (e) {
    console.error('Error loading habits:', e);
  }
}

async function loadCategories() {
  try {
    const res = await fetch('/api/finance_category');
    categories = await res.json();
    
    const el = document.getElementById('hf-category-id');
    if (el) {
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.name;
        el.appendChild(opt);
      });
    }
  } catch (e) {
    console.error('Error loading categories:', e);
  }
}

async function loadHabitBiometricLinks() {
  try {
    const res = await fetch('/api/combinations/habit-biometric');
    habitBiometricLinks = await res.json();
  } catch (e) {
    console.error('Error loading habit-biometric links:', e);
    habitBiometricLinks = [];
  }
}

async function loadHabitFinanceLinks() {
  try {
    const res = await fetch('/api/combinations/habit-finance');
    habitFinanceLinks = await res.json();
  } catch (e) {
    console.error('Error loading habit-finance links:', e);
    habitFinanceLinks = [];
  }
}

async function loadBiometricCharacteristics() {
  try {
    const res = await fetch('/api/combinations/biometric-characteristics');
    biometricCharacteristics = await res.json();
  } catch (e) {
    console.error('Error loading biometric characteristics:', e);
    biometricCharacteristics = [];
  }
}

// ===== СОЗДАНИЕ СВЯЗЕЙ =====
async function createHabitBiometricLink() {
  const habitId = document.getElementById('hb-habit-id').value;
  const type = document.getElementById('hb-biometric-type').value;
  
  if (!habitId || !type) {
    alert('Выберите привычку и тип биометрики');
    return;
  }

  const data = {
    habit_id: parseInt(habitId),
    biometric_type: type,
    biometric_id: document.getElementById('hb-biometric-id').value || null,
    bonus_i: parseFloat(document.getElementById('hb-bonus-i').value) || 0,
    bonus_s: parseFloat(document.getElementById('hb-bonus-s').value) || 0,
    bonus_w: parseFloat(document.getElementById('hb-bonus-w').value) || 0,
    bonus_e: parseFloat(document.getElementById('hb-bonus-e').value) || 0,
    bonus_c: parseFloat(document.getElementById('hb-bonus-c').value) || 0,
    bonus_h: parseFloat(document.getElementById('hb-bonus-h').value) || 0,
    bonus_st: parseFloat(document.getElementById('hb-bonus-st').value) || 0,
    bonus_money: parseFloat(document.getElementById('hb-bonus-money').value) || 0,
  };

  try {
    const res = await fetch('/api/combinations/habit-biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      alert('✓ Связь создана');
      // Очистить форму
      document.getElementById('hb-biometric-type').value = '';
      document.getElementById('hb-biometric-id').value = '';
      document.querySelectorAll('#hb-bonuses input').forEach(el => el.value = '0');
      
      await loadHabitBiometricLinks();
      renderLists();
    } else {
      alert('Ошибка: ' + (await res.text()));
    }
  } catch (e) {
    alert('Ошибка при создании связи: ' + e.message);
  }
}

async function createHabitFinanceLink() {
  const habitId = document.getElementById('hf-habit-id').value;
  const type = document.getElementById('hf-finance-type').value;
  
  if (!habitId || !type) {
    alert('Выберите привычку и тип финансов');
    return;
  }

  const data = {
    habit_id: parseInt(habitId),
    finance_type: type,
    category_id: document.getElementById('hf-category-id').value || null,
    threshold: parseFloat(document.getElementById('hf-threshold').value) || 0,
    bonus_i: parseFloat(document.getElementById('hf-bonus-i').value) || 0,
    bonus_s: parseFloat(document.getElementById('hf-bonus-s').value) || 0,
    bonus_w: parseFloat(document.getElementById('hf-bonus-w').value) || 0,
    bonus_e: parseFloat(document.getElementById('hf-bonus-e').value) || 0,
    bonus_c: parseFloat(document.getElementById('hf-bonus-c').value) || 0,
    bonus_h: parseFloat(document.getElementById('hf-bonus-h').value) || 0,
    bonus_st: parseFloat(document.getElementById('hf-bonus-st').value) || 0,
    bonus_money: parseFloat(document.getElementById('hf-bonus-money').value) || 0,
  };

  try {
    const res = await fetch('/api/combinations/habit-finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      alert('✓ Связь создана');
      document.getElementById('hf-finance-type').value = '';
      document.getElementById('hf-category-id').value = '';
      document.getElementById('hf-threshold').value = '0';
      document.querySelectorAll('#hf-bonuses input').forEach(el => el.value = '0');
      
      await loadHabitFinanceLinks();
      renderLists();
    } else {
      alert('Ошибка: ' + (await res.text()));
    }
  } catch (e) {
    alert('Ошибка при создании связи: ' + e.message);
  }
}

async function createBiometricCharacteristic() {
  const type = document.getElementById('ba-biometric-type').value;
  
  if (!type) {
    alert('Выберите тип биометрики');
    return;
  }

  const data = {
    biometric_type: type,
    biometric_id: document.getElementById('ba-biometric-id').value || null,
    bonus_i: parseFloat(document.getElementById('ba-bonus-i').value) || 0,
    bonus_s: parseFloat(document.getElementById('ba-bonus-s').value) || 0,
    bonus_w: parseFloat(document.getElementById('ba-bonus-w').value) || 0,
    bonus_e: parseFloat(document.getElementById('ba-bonus-e').value) || 0,
    bonus_c: parseFloat(document.getElementById('ba-bonus-c').value) || 0,
    bonus_h: parseFloat(document.getElementById('ba-bonus-h').value) || 0,
    bonus_st: parseFloat(document.getElementById('ba-bonus-st').value) || 0,
    bonus_money: parseFloat(document.getElementById('ba-bonus-money').value) || 0,
    description: document.getElementById('ba-description').value,
  };

  try {
    const res = await fetch('/api/combinations/biometric-characteristics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      alert('✓ Правило создано');
      document.getElementById('ba-biometric-type').value = '';
      document.getElementById('ba-biometric-id').value = '';
      document.getElementById('ba-description').value = '';
      document.querySelectorAll('#ba-bonuses input').forEach((el, i) => {
        el.value = i === 6 ? '1' : '0'; // ST by default = 1
      });
      
      await loadBiometricCharacteristics();
      renderLists();
    } else {
      alert('Ошибка: ' + (await res.text()));
    }
  } catch (e) {
    alert('Ошибка при создании правила: ' + e.message);
  }
}

// ===== УДАЛЕНИЕ =====
async function deleteHabitBiometricLink(linkId) {
  if (!confirm('Удалить эту связь?')) return;
  
  try {
    const res = await fetch(`/api/combinations/habit-biometric/${linkId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      await loadHabitBiometricLinks();
      renderLists();
    }
  } catch (e) {
    console.error('Error deleting link:', e);
  }
}

async function deleteHabitFinanceLink(linkId) {
  if (!confirm('Удалить эту связь?')) return;
  
  try {
    const res = await fetch(`/api/combinations/habit-finance/${linkId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      await loadHabitFinanceLinks();
      renderLists();
    }
  } catch (e) {
    console.error('Error deleting link:', e);
  }
}

async function deleteBiometricCharacteristic(charId) {
  if (!confirm('Удалить это правило?')) return;
  
  try {
    const res = await fetch(`/api/combinations/biometric-characteristics/${charId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      await loadBiometricCharacteristics();
      renderLists();
    }
  } catch (e) {
    console.error('Error deleting characteristic:', e);
  }
}

// ===== ОТРИСОВКА =====
function renderLists() {
  renderHabitBiometricList();
  renderHabitFinanceList();
  renderBiometricCharacteristicsList();
}

function renderHabitBiometricList() {
  const container = document.getElementById('habit-biometric-list');
  
  if (habitBiometricLinks.length === 0) {
    container.innerHTML = '<div class="empty-state">Нет связей</div>';
    return;
  }

  container.innerHTML = habitBiometricLinks.map(link => {
    const habit = habits.find(h => h.id === link.habit_id);
    const bonusValues = ['i', 's', 'w', 'e', 'c', 'h', 'st', 'money'];
    const bonuses = bonusValues
      .filter(key => link[`bonus_${key}`] !== 0)
      .map(key => `<span class="bonus-badge positive">${key.toUpperCase()}[${link[`bonus_${key}`].toFixed(2)}]</span>`);

    return `
      <div class="link-card">
        <div class="link-card-info">
          <h4>${habit?.name || '?'} ↔ ${link.biometric_type}</h4>
          <p>ID биометрики: ${link.biometric_id || 'любой'}</p>
          <div class="bonus-badges">${bonuses.join('')}</div>
        </div>
        <div class="controls">
          <button class="btn danger" onclick="deleteHabitBiometricLink(${link.id})">Удалить</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderHabitFinanceList() {
  const container = document.getElementById('habit-finance-list');
  
  if (habitFinanceLinks.length === 0) {
    container.innerHTML = '<div class="empty-state">Нет связей</div>';
    return;
  }

  container.innerHTML = habitFinanceLinks.map(link => {
    const habit = habits.find(h => h.id === link.habit_id);
    const bonusValues = ['i', 's', 'w', 'e', 'c', 'h', 'st', 'money'];
    const bonuses = bonusValues
      .filter(key => link[`bonus_${key}`] !== 0)
      .map(key => `<span class="bonus-badge positive">${key.toUpperCase()}[${link[`bonus_${key}`].toFixed(2)}]</span>`);

    return `
      <div class="link-card">
        <div class="link-card-info">
          <h4>${habit?.name || '?'} ↔ ${link.finance_type}</h4>
          <p>Порог: ${link.threshold > 0 ? link.threshold + ' руб.' : 'без ограничений'}</p>
          <div class="bonus-badges">${bonuses.join('')}</div>
        </div>
        <div class="controls">
          <button class="btn danger" onclick="deleteHabitFinanceLink(${link.id})">Удалить</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderBiometricCharacteristicsList() {
  const container = document.getElementById('biometric-characteristics-list');
  
  if (biometricCharacteristics.length === 0) {
    container.innerHTML = '<div class="empty-state">Нет правил автобонусов</div>';
    return;
  }

  container.innerHTML = biometricCharacteristics.map(char => {
    const bonusValues = ['i', 's', 'w', 'e', 'c', 'h', 'st', 'money'];
    const bonuses = bonusValues
      .filter(key => char[`bonus_${key}`] !== 0)
      .map(key => `<span class="bonus-badge positive">${key.toUpperCase()}[${char[`bonus_${key}`].toFixed(2)}]</span>`);

    return `
      <div class="link-card">
        <div class="link-card-info">
          <h4>📊 ${char.biometric_type}${char.biometric_id ? ' #' + char.biometric_id : ''}</h4>
          <p>${char.description || '(без описания)'}</p>
          <div class="bonus-badges">${bonuses.join('')}</div>
        </div>
        <div class="controls">
          <button class="btn danger" onclick="deleteBiometricCharacteristic(${char.id})">Удалить</button>
        </div>
      </div>
    `;
  }).join('');
}

// ===== УПРАВЛЕНИЕ ВКЛАДКАМИ =====
function setupEventListeners() {
  // Переключение вкладок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      // Убрать активность со всех вкладок
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Активировать выбранную вкладку
      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });
  });

  // Кнопки создания
  const hbBtn = document.getElementById('hb-create-btn');
  if (hbBtn) hbBtn.addEventListener('click', createHabitBiometricLink);

  const hfBtn = document.getElementById('hf-create-btn');
  if (hfBtn) hfBtn.addEventListener('click', createHabitFinanceLink);

  const baBtn = document.getElementById('ba-create-btn');
  if (baBtn) baBtn.addEventListener('click', createBiometricCharacteristic);
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', init);
