/**
 * 文生图提示词工程系统
 * Prompt Creator System
 */

// ===== Data Storage Keys =====
const STORAGE_KEYS = {
  ITEMS: 'promptCreator_items',
  TEMPLATES: 'promptCreator_templates',
  PROJECTS: 'promptCreator_projects'
};

// ===== State =====
let state = {
  items: [],
  templates: [],
  projects: [],
  currentEditItem: null,
  currentEditTemplate: null,
  currentEditProject: null
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initNavigation();
  renderAll();
});

// ===== Data Loading & Saving =====
function loadData() {
  // Load items
  const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (savedItems) {
    state.items = JSON.parse(savedItems);
  } else {
    // Load default from JSON
    state.items = [
      {
        id: generateId(),
        name: "主体元素",
        type: "text",
        options: "",
        priority: 1,
        hidden: false,
        group: "自定义输入分组"
      },
      {
        id: generateId(),
        name: "风格",
        type: "checkbox",
        options: "吉卜力,赛博朋克,古风",
        priority: 2,
        hidden: false,
        group: "画风类"
      }
    ];
    saveItems();
  }

  // Load templates
  const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (savedTemplates) {
    state.templates = JSON.parse(savedTemplates);
  } else {
    state.templates = [
      {
        id: generateId(),
        name: "默认模板",
        rules: "请生成一张{主体元素}的图片",
        extraRequirements: "高清、4K"
      }
    ];
    saveTemplates();
  }

  // Load projects
  const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (savedProjects) {
    state.projects = JSON.parse(savedProjects);
  } else {
    state.projects = [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(state.items));
}

function saveTemplates() {
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(state.templates));
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(state.projects));
}

// ===== Utility Functions =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function showPanel(panelId) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(panelId).classList.add('active');
  document.querySelector(`[data-panel="${panelId}"]`).classList.add('active');
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ===== Navigation =====
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panelId = btn.dataset.panel;
      if (panelId) {
        showPanel(panelId);
      }
    });
  });
}

// ===== Render Functions =====
function renderAll() {
  renderItems();
  renderTemplates();
  renderProjects();
}

// ===== 词条清单 (Entry List) Module =====
function renderItems() {
  const container = document.getElementById('itemsList');
  
  if (state.items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">暂无词条，点击"新增词条"添加</div>
      </div>
    `;
    return;
  }

  // Group items
  const groups = {};
  state.items.forEach(item => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
  });

  let html = '<div class="table-container"><table class="table">';
  html += `
    <thead>
      <tr>
        <th>名称</th>
        <th>类型</th>
        <th>可选项</th>
        <th>优先级</th>
        <th>分组</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
  `;

  // Sort items by priority
  const sortedItems = [...state.items].sort((a, b) => a.priority - b.priority);

  sortedItems.forEach(item => {
    const typeLabel = item.type === 'text' ? '文本框' : '复选框';
    const statusLabel = item.hidden ? '<span class="tag">已隐藏</span>' : '<span class="tag tag-primary">显示</span>';
    const optionsDisplay = item.type === 'checkbox' ? item.options : '-';

    html += `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${typeLabel}</td>
        <td>${escapeHtml(optionsDisplay)}</td>
        <td>${item.priority}</td>
        <td><span class="tag">${escapeHtml(item.group)}</span></td>
        <td>${statusLabel}</td>
        <td class="table-actions">
          <button class="btn btn-secondary" onclick="editItem('${item.id}')">编辑</button>
          <button class="btn btn-danger" onclick="deleteItem('${item.id}')">删除</button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function openAddItemModal() {
  state.currentEditItem = null;
  document.getElementById('itemModalTitle').textContent = '新增词条';
  document.getElementById('itemForm').reset();
  document.getElementById('itemOptionsGroup').style.display = 'none';
  showModal('itemModal');
}

function editItem(id) {
  const item = state.items.find(i => i.id === id);
  if (!item) return;

  state.currentEditItem = item;
  document.getElementById('itemModalTitle').textContent = '编辑词条';
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemType').value = item.type;
  document.getElementById('itemOptions').value = item.options;
  document.getElementById('itemPriority').value = item.priority;
  document.getElementById('itemGroup').value = item.group;
  document.getElementById('itemHidden').checked = item.hidden;
  
  document.getElementById('itemOptionsGroup').style.display = 
    item.type === 'checkbox' ? 'block' : 'none';

  showModal('itemModal');
}

function deleteItem(id) {
  if (!confirm('确定要删除这个词条吗？')) return;
  
  state.items = state.items.filter(i => i.id !== id);
  saveItems();
  renderItems();
}

function saveItem() {
  const name = document.getElementById('itemName').value.trim();
  const type = document.getElementById('itemType').value;
  const options = document.getElementById('itemOptions').value.trim();
  const priority = parseInt(document.getElementById('itemPriority').value) || 100;
  const group = document.getElementById('itemGroup').value.trim() || '默认分组';
  const hidden = document.getElementById('itemHidden').checked;

  if (!name) {
    alert('请输入提示词名称');
    return;
  }

  if (type === 'checkbox' && !options) {
    alert('复选框类型需要设置可选项');
    return;
  }

  if (priority < 1 || priority > 1000) {
    alert('优先级必须在1-1000之间');
    return;
  }

  if (state.currentEditItem) {
    // Update existing
    const index = state.items.findIndex(i => i.id === state.currentEditItem.id);
    if (index !== -1) {
      state.items[index] = {
        ...state.items[index],
        name,
        type,
        options,
        priority,
        group,
        hidden
      };
    }
  } else {
    // Create new
    state.items.push({
      id: generateId(),
      name,
      type,
      options,
      priority,
      group,
      hidden
    });
  }

  saveItems();
  hideModal('itemModal');
  renderItems();
}

function onItemTypeChange() {
  const type = document.getElementById('itemType').value;
  document.getElementById('itemOptionsGroup').style.display = 
    type === 'checkbox' ? 'block' : 'none';
}

// ===== 文本模板 (Template) Module =====
function renderTemplates() {
  const container = document.getElementById('templatesList');
  
  if (state.templates.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📄</div>
        <div class="empty-state-text">暂无模板，点击"新增模板"添加</div>
      </div>
    `;
    return;
  }

  let html = '<div class="card-grid">';
  
  state.templates.forEach(template => {
    html += `
      <div class="card">
        <div class="card-title">${escapeHtml(template.name)}</div>
        <div class="card-content">
          <strong>生成规则：</strong><br>
          <code>${escapeHtml(template.rules)}</code>
          <br><br>
          <strong>额外要求：</strong> ${escapeHtml(template.extraRequirements) || '无'}
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary" onclick="editTemplate('${template.id}')">编辑</button>
          <button class="btn btn-danger" onclick="deleteTemplate('${template.id}')">删除</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function openAddTemplateModal() {
  state.currentEditTemplate = null;
  document.getElementById('templateModalTitle').textContent = '新增模板';
  document.getElementById('templateForm').reset();
  showModal('templateModal');
}

function editTemplate(id) {
  const template = state.templates.find(t => t.id === id);
  if (!template) return;

  state.currentEditTemplate = template;
  document.getElementById('templateModalTitle').textContent = '编辑模板';
  document.getElementById('templateName').value = template.name;
  document.getElementById('templateRules').value = template.rules;
  document.getElementById('templateExtra').value = template.extraRequirements;

  showModal('templateModal');
}

function deleteTemplate(id) {
  if (!confirm('确定要删除这个模板吗？')) return;
  
  state.templates = state.templates.filter(t => t.id !== id);
  saveTemplates();
  renderTemplates();
}

function saveTemplate() {
  const name = document.getElementById('templateName').value.trim();
  const rules = document.getElementById('templateRules').value.trim();
  const extraRequirements = document.getElementById('templateExtra').value.trim();

  if (!name) {
    alert('请输入模板名称');
    return;
  }

  if (!rules) {
    alert('请输入生成规则');
    return;
  }

  if (state.currentEditTemplate) {
    const index = state.templates.findIndex(t => t.id === state.currentEditTemplate.id);
    if (index !== -1) {
      state.templates[index] = {
        ...state.templates[index],
        name,
        rules,
        extraRequirements
      };
    }
  } else {
    state.templates.push({
      id: generateId(),
      name,
      rules,
      extraRequirements
    });
  }

  saveTemplates();
  hideModal('templateModal');
  renderTemplates();
}

// ===== 提示词工程 (Project) Module =====
function renderProjects() {
  const container = document.getElementById('projectsList');
  
  if (state.projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🚀</div>
        <div class="empty-state-text">暂无项目，点击"新建项目"开始</div>
      </div>
    `;
    return;
  }

  let html = '<div class="card-grid">';
  
  state.projects.forEach(project => {
    const template = state.templates.find(t => t.id === project.templateId);
    const templateName = template ? template.name : '未知模板';
    const combinationCount = calculateCombinations(project);
    
    html += `
      <div class="card">
        <div class="card-title">${escapeHtml(project.name)}</div>
        <div class="card-content">
          <strong>使用模板：</strong> ${escapeHtml(templateName)}<br>
          <strong>启用词条：</strong> ${project.enabledItems.length} 个<br>
          <strong>可能组合：</strong> ${combinationCount.toLocaleString()} 种
        </div>
        <div class="card-footer">
          <button class="btn btn-success" onclick="runProject('${project.id}')">运行</button>
          <button class="btn btn-secondary" onclick="editProject('${project.id}')">编辑</button>
          <button class="btn btn-danger" onclick="deleteProject('${project.id}')">删除</button>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function openAddProjectModal() {
  if (state.templates.length === 0) {
    alert('请先创建至少一个模板');
    return;
  }

  state.currentEditProject = null;
  document.getElementById('projectModalTitle').textContent = '新建项目';
  document.getElementById('projectForm').reset();
  
  // Populate template select
  const templateSelect = document.getElementById('projectTemplate');
  templateSelect.innerHTML = state.templates.map(t => 
    `<option value="${t.id}">${escapeHtml(t.name)}</option>`
  ).join('');
  
  // Render entry config
  renderProjectEntryConfig();
  updateCombinationCount();
  
  showModal('projectModal');
}

function editProject(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  state.currentEditProject = project;
  document.getElementById('projectModalTitle').textContent = '编辑项目';
  document.getElementById('projectName').value = project.name;
  
  // Populate template select
  const templateSelect = document.getElementById('projectTemplate');
  templateSelect.innerHTML = state.templates.map(t => 
    `<option value="${t.id}" ${t.id === project.templateId ? 'selected' : ''}>${escapeHtml(t.name)}</option>`
  ).join('');
  
  renderProjectEntryConfig(project);
  updateCombinationCount();
  
  showModal('projectModal');
}

function renderProjectEntryConfig(project = null) {
  const container = document.getElementById('projectEntryConfig');
  const visibleItems = state.items.filter(i => !i.hidden);
  
  if (visibleItems.length === 0) {
    container.innerHTML = '<p>暂无可用词条</p>';
    return;
  }

  // Group items
  const groups = {};
  visibleItems.forEach(item => {
    if (!groups[item.group]) {
      groups[item.group] = [];
    }
    groups[item.group].push(item);
  });

  let html = '';
  
  Object.keys(groups).forEach(groupName => {
    html += `<div class="config-section">
      <div class="config-section-title">${escapeHtml(groupName)}</div>`;
    
    groups[groupName].forEach(item => {
      const isEnabled = project ? project.enabledItems.includes(item.id) : false;
      const projectPriority = project?.itemPriorities?.[item.id] || item.priority;
      const selectedOptions = project?.itemOptions?.[item.id] || [];
      
      html += `
        <div class="entry-config-item">
          <label>
            <input type="checkbox" 
                   class="entry-enable-checkbox"
                   data-item-id="${item.id}"
                   ${isEnabled ? 'checked' : ''}
                   onchange="updateCombinationCount()">
            <span><strong>${escapeHtml(item.name)}</strong> (${item.type === 'text' ? '文本框' : '复选框'})</span>
          </label>
          <div>
            优先级: <input type="number" 
                          class="entry-priority-input" 
                          data-item-id="${item.id}"
                          value="${projectPriority}" 
                          min="1" max="1000">
          </div>
        </div>
      `;
      
      if (item.type === 'checkbox') {
        const options = item.options.split(',').map(o => o.trim()).filter(o => o);
        html += `<div class="form-checkbox-group" data-options-for="${item.id}">`;
        options.forEach(opt => {
          const isSelected = selectedOptions.includes(opt);
          html += `
            <label class="form-checkbox-label">
              <input type="checkbox" 
                     class="option-checkbox"
                     data-item-id="${item.id}"
                     value="${escapeHtml(opt)}"
                     ${isSelected ? 'checked' : ''}
                     onchange="updateCombinationCount()">
              <span>${escapeHtml(opt)}</span>
            </label>
          `;
        });
        html += '</div>';
      }
    });
    
    html += '</div>';
  });
  
  container.innerHTML = html;
}

function updateCombinationCount() {
  const projectData = getProjectFormData();
  if (!projectData) {
    document.getElementById('combinationCount').textContent = '0';
    return;
  }
  
  const count = calculateCombinations(projectData);
  document.getElementById('combinationCount').textContent = count.toLocaleString();
}

function calculateCombinations(project) {
  if (!project.enabledItems || project.enabledItems.length === 0) {
    return 0;
  }

  let totalCombinations = 1;
  
  project.enabledItems.forEach(itemId => {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.type === 'text') {
      // Text input has 1 option (user input)
      totalCombinations *= 1;
    } else if (item.type === 'checkbox') {
      const selectedOptions = project.itemOptions?.[itemId] || [];
      if (selectedOptions.length > 0) {
        totalCombinations *= selectedOptions.length;
      }
    }
  });
  
  return totalCombinations;
}

function getProjectFormData() {
  const name = document.getElementById('projectName').value.trim();
  const templateId = document.getElementById('projectTemplate').value;
  
  const enabledItems = [];
  const itemPriorities = {};
  const itemOptions = {};
  
  document.querySelectorAll('.entry-enable-checkbox:checked').forEach(checkbox => {
    const itemId = checkbox.dataset.itemId;
    enabledItems.push(itemId);
  });
  
  document.querySelectorAll('.entry-priority-input').forEach(input => {
    const itemId = input.dataset.itemId;
    itemPriorities[itemId] = parseInt(input.value) || 100;
  });
  
  document.querySelectorAll('.option-checkbox:checked').forEach(checkbox => {
    const itemId = checkbox.dataset.itemId;
    if (!itemOptions[itemId]) {
      itemOptions[itemId] = [];
    }
    itemOptions[itemId].push(checkbox.value);
  });
  
  return {
    name,
    templateId,
    enabledItems,
    itemPriorities,
    itemOptions
  };
}

function deleteProject(id) {
  if (!confirm('确定要删除这个项目吗？')) return;
  
  state.projects = state.projects.filter(p => p.id !== id);
  saveProjects();
  renderProjects();
}

function saveProject() {
  const formData = getProjectFormData();
  
  if (!formData.name) {
    alert('请输入项目名称');
    return;
  }

  if (formData.enabledItems.length === 0) {
    alert('请至少选择一个词条');
    return;
  }

  if (state.currentEditProject) {
    const index = state.projects.findIndex(p => p.id === state.currentEditProject.id);
    if (index !== -1) {
      state.projects[index] = {
        ...state.projects[index],
        ...formData
      };
    }
  } else {
    state.projects.push({
      id: generateId(),
      ...formData,
      createdAt: new Date().toISOString()
    });
  }

  saveProjects();
  hideModal('projectModal');
  renderProjects();
}

// ===== Run Project =====
function runProject(id) {
  const project = state.projects.find(p => p.id === id);
  if (!project) return;

  document.getElementById('runProjectName').textContent = project.name;
  document.getElementById('runSeed').value = '';
  document.getElementById('runResults').innerHTML = '';
  
  showModal('runProjectModal');
  
  // Store current project for running
  state.runningProject = project;
}

function executeProject() {
  const project = state.runningProject;
  if (!project) return;

  const seedInput = document.getElementById('runSeed').value.trim();
  const seed = seedInput ? parseInt(seedInput) : null;
  
  const result = generatePrompt(project, seed);
  displayResults(result);
}

function generatePrompt(project, seed = null) {
  const template = state.templates.find(t => t.id === project.templateId);
  if (!template) {
    return { error: '找不到模板' };
  }

  // Get enabled items sorted by project priority
  const enabledItemsWithPriority = project.enabledItems.map(itemId => {
    const item = state.items.find(i => i.id === itemId);
    const priority = project.itemPriorities[itemId] || item?.priority || 100;
    return { item, priority };
  }).filter(e => e.item).sort((a, b) => a.priority - b.priority);

  // Generate all possible combinations
  const combinations = generateAllCombinations(project, enabledItemsWithPriority);
  
  if (combinations.length === 0) {
    return { error: '没有可用的组合' };
  }

  // Select combination based on seed
  let selectedIndex;
  if (seed !== null) {
    selectedIndex = seed % combinations.length;
  } else {
    selectedIndex = Math.floor(Math.random() * combinations.length);
  }
  
  const selectedCombination = combinations[selectedIndex];
  
  // Build prompt
  let promptPart1 = template.rules;
  let promptPart2Parts = [];
  
  // Replace placeholders and build KV pairs
  selectedCombination.forEach(({ item, value }) => {
    // Replace placeholder in template
    const placeholder = `{${item.name}}`;
    promptPart1 = promptPart1.replace(placeholder, value);
    
    // Add to KV pairs
    promptPart2Parts.push(`${item.name}: ${value}`);
  });
  
  // Add extra requirements
  let finalPrompt = promptPart1;
  if (promptPart2Parts.length > 0) {
    finalPrompt += '\n\n' + promptPart2Parts.join('\n');
  }
  if (template.extraRequirements) {
    finalPrompt += '\n\n' + template.extraRequirements;
  }

  return {
    prompt: finalPrompt,
    combination: selectedCombination,
    index: selectedIndex,
    total: combinations.length,
    seed: seed !== null ? seed : '随机'
  };
}

function generateAllCombinations(project, enabledItemsWithPriority) {
  const combinations = [];
  
  // Get options for each enabled item
  const itemOptions = enabledItemsWithPriority.map(({ item, priority }) => {
    if (item.type === 'text') {
      // For text, use the item name as placeholder
      return [{ item, value: `[${item.name}]`, priority }];
    } else if (item.type === 'checkbox') {
      const selected = project.itemOptions[item.id] || [];
      return selected.map(opt => ({ item, value: opt, priority }));
    }
    return [];
  });

  // Generate cartesian product
  const cartesian = (...arrays) => {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(b => [...a, b]));
    }, [[]]);
  };

  if (itemOptions.length === 0) {
    return [];
  }

  if (itemOptions.some(opts => opts.length === 0)) {
    return [];
  }

  return cartesian(...itemOptions);
}

function displayResults(result) {
  const container = document.getElementById('runResults');
  
  if (result.error) {
    container.innerHTML = `<div class="result-box" style="color: red;">${result.error}</div>`;
    return;
  }

  container.innerHTML = `
    <div class="stats-box">
      <div class="stats-number">${result.index + 1} / ${result.total}</div>
      <div class="stats-label">组合 #${result.index + 1}（种子: ${result.seed}）</div>
    </div>
    <div class="result-box">
      <div class="result-item">
        <div class="result-item-title">生成的提示词：</div>
        <div class="result-item-content" id="generatedPrompt">${escapeHtml(result.prompt).replace(/\n/g, '<br>')}</div>
        <button class="copy-btn" onclick="copyPrompt()">📋 复制提示词</button>
      </div>
    </div>
    <div class="result-box">
      <div class="result-item">
        <div class="result-item-title">使用的组合：</div>
        <div class="result-item-content">
          ${result.combination.map(c => `<span class="tag">${escapeHtml(c.item.name)}: ${escapeHtml(c.value)}</span>`).join(' ')}
        </div>
      </div>
    </div>
  `;
}

function copyPrompt() {
  const promptEl = document.getElementById('generatedPrompt');
  const text = promptEl.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    alert('提示词已复制到剪贴板！');
  }).catch(() => {
    // Fallback for older browsers that don't support the Clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy'); // Deprecated but necessary for older browser support
    document.body.removeChild(textarea);
    alert('提示词已复制到剪贴板！');
  });
}

// ===== Helper Functions =====
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ===== Export Data Functions =====
function exportData() {
  const data = {
    items: state.items,
    templates: state.templates,
    projects: state.projects,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'promptCreator_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.items) {
        state.items = data.items;
        saveItems();
      }
      if (data.templates) {
        state.templates = data.templates;
        saveTemplates();
      }
      if (data.projects) {
        state.projects = data.projects;
        saveProjects();
      }
      
      renderAll();
      alert('数据导入成功！');
    } catch (error) {
      alert('导入失败：' + error.message);
    }
  };
  reader.readAsText(file);
}

// Make functions globally accessible
window.openAddItemModal = openAddItemModal;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.saveItem = saveItem;
window.onItemTypeChange = onItemTypeChange;

window.openAddTemplateModal = openAddTemplateModal;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.saveTemplate = saveTemplate;

window.openAddProjectModal = openAddProjectModal;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.saveProject = saveProject;
window.runProject = runProject;
window.executeProject = executeProject;
window.updateCombinationCount = updateCombinationCount;

window.copyPrompt = copyPrompt;
window.exportData = exportData;
window.importData = importData;

window.showModal = showModal;
window.hideModal = hideModal;
