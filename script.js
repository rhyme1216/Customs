// 全局变量
let currentPage = 1;
let pageSize = 20;
let totalPages = 1;
let totalCount = 0;
let currentData = [];

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化示例数据
    initSampleData();
    // 默认显示首页
    showHomePage();
    // 初始化自定义提示框
    initCustomTooltips();
});

// 初始化自定义提示框
function initCustomTooltips() {
    // 创建提示框元素
    const tooltip = document.createElement('div');
    tooltip.id = 'custom-tooltip';
    tooltip.className = 'custom-tooltip';
    document.body.appendChild(tooltip);
    
    // 为所有带有title属性的.tooltip-icon添加事件监听器
    document.addEventListener('mouseenter', function(e) {
        if (e.target.closest('.tooltip-icon') && e.target.closest('.tooltip-icon').getAttribute('title')) {
            showCustomTooltip(e.target.closest('.tooltip-icon'), e);
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.closest('.tooltip-icon')) {
            hideCustomTooltip();
        }
    }, true);
}

// 显示自定义提示框
function showCustomTooltip(element, event) {
    const tooltip = document.getElementById('custom-tooltip');
    const title = element.getAttribute('title');
    
    if (!title) return;
    
    // 设置提示框内容
    tooltip.textContent = title;
    
    // 计算位置
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // 计算最佳位置（优先显示在上方）
    let top = rect.top - tooltip.offsetHeight - 10;
    let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);
    
    // 如果上方空间不足，显示在下方
    if (top < 10) {
        top = rect.bottom + 10;
        // 修改箭头方向
        tooltip.style.setProperty('--arrow-direction', 'up');
    } else {
        tooltip.style.setProperty('--arrow-direction', 'down');
    }
    
    // 确保不超出viewport边界
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left < 10) {
        left = 10;
    } else if (left + tooltip.offsetWidth > viewportWidth - 10) {
        left = viewportWidth - tooltip.offsetWidth - 10;
    }
    
    if (top < 10) {
        top = 10;
    } else if (top + tooltip.offsetHeight > viewportHeight - 10) {
        top = viewportHeight - tooltip.offsetHeight - 10;
    }
    
    // 设置位置并显示
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.classList.add('show');
}

// 隐藏自定义提示框
function hideCustomTooltip() {
    const tooltip = document.getElementById('custom-tooltip');
    tooltip.classList.remove('show');
}

// 切换子菜单
function toggleSubmenu(menuId) {
    const submenu = document.getElementById(menuId);
    const arrow = document.getElementById('arrow-' + menuId);
    
    if (submenu.classList.contains('expanded')) {
        submenu.classList.remove('expanded');
        arrow.classList.remove('expanded');
    } else {
        // 先关闭所有其他子菜单
        const allSubmenus = document.querySelectorAll('.submenu');
        const allArrows = document.querySelectorAll('.arrow');
        allSubmenus.forEach(menu => menu.classList.remove('expanded'));
        allArrows.forEach(arrow => arrow.classList.remove('expanded'));
        
        // 打开当前子菜单
        submenu.classList.add('expanded');
        arrow.classList.add('expanded');
    }
}

// 显示首页
function showHomePage() {
    hideAllPages();
    document.getElementById('home-page').classList.add('active');
    clearActiveSubmenuItems();
}

// 显示报关商品列表页面
function showDeclarationsGoodsList() {
    hideAllPages();
    document.getElementById('declarations-goods-page').classList.add('active');
    setActiveSubmenuItem(event.target);
    loadGoodsData();
}

// 显示报关单管理页面
function showDeclarationManagement() {
    hideAllPages();
    document.getElementById('declaration-management-page').classList.add('active');
    setActiveSubmenuItem(event.target);
}

// 隐藏所有页面
function hideAllPages() {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => page.classList.remove('active'));
}

// 清除所有子菜单项的激活状态
function clearActiveSubmenuItems() {
    const submenuItems = document.querySelectorAll('.submenu-item');
    submenuItems.forEach(item => item.classList.remove('active'));
}

// 设置激活的子菜单项
function setActiveSubmenuItem(element) {
    clearActiveSubmenuItems();
    element.classList.add('active');
}

// 重置表单
function resetForm() {
    document.getElementById('domestic-sku').value = '';
    document.getElementById('international-sku').value = '';
    document.getElementById('hscode').value = '';
    document.getElementById('destination-country').value = '';
    document.getElementById('assessment-status').value = '';
    document.getElementById('last-updater').value = '';
}

// 查询数据
function searchData() {
    const searchParams = {
        domesticSku: document.getElementById('domestic-sku').value,
        internationalSku: document.getElementById('international-sku').value,
        hscode: document.getElementById('hscode').value,
        destinationCountry: document.getElementById('destination-country').value,
        assessmentStatus: document.getElementById('assessment-status').value,
        lastUpdater: document.getElementById('last-updater').value
    };
    
    console.log('搜索参数:', searchParams);
    // 这里可以添加实际的搜索逻辑
    loadGoodsData(searchParams);
}

// 导入数据
function importData() {
    alert('导入功能开发中...');
}

// 导出数据
function exportData() {
    alert('导出功能开发中...');
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('#goods-tbody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
}

// 编辑申报要素
function editDeclarationElements(id) {
    const item = currentData.find(data => data.id === id);
    if (!item) return;
    
    // 显示弹窗
    showDeclarationModal(item);
}

// 显示申报要素编辑弹窗
function showDeclarationModal(item) {
    // 填充商品基本信息
    document.getElementById('modal-international-sku').textContent = item.internationalSku;
    document.getElementById('modal-hscode').textContent = item.hscode;
    document.getElementById('modal-goods-title').textContent = item.chineseTitle;
    
    // 清空表单
    resetDeclarationForm();
    
    // 根据HSCODE生成动态申报要素项
    generateDeclarationItems(item.hscode);
    
    // 如果已有申报要素数据，填充表单
    if (item.declarationElements) {
        populateDeclarationForm(item.declarationElements);
    }
    
    // 设置当前编辑的商品ID
    window.currentEditingItemId = item.id;
    
    // 显示弹窗
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('declaration-modal').classList.add('active');
    
    // 更新预览
    updateDeclarationPreview();
    
    // 添加实时更新预览的事件监听器
    addPreviewUpdateListeners();
}

// 关闭申报要素编辑弹窗
function closeDeclarationModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('declaration-modal').classList.remove('active');
    window.currentEditingItemId = null;
}

// 重置申报要素表单
function resetDeclarationForm() {
    document.getElementById('brand-type').value = '';
    document.getElementById('preferential-status').value = '';
    document.getElementById('gtin').value = '';
    document.getElementById('cas').value = '';
    document.getElementById('other-info').value = '';
    
    // 清空目的国选择
    const checkboxes = document.querySelectorAll('#destination-countries input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    // 清空授权选择
    document.getElementById('export-authorization').checked = false;
    
    // 清空动态项容器
    document.getElementById('dynamic-declaration-items').innerHTML = '';
}

// 根据HSCODE生成动态申报要素项
function generateDeclarationItems(hscode) {
    const container = document.getElementById('dynamic-declaration-items');
    container.innerHTML = '';
    
    // 根据HSCODE获取申报要素配置
    const hsConfig = getHSCodeConfig(hscode);
    
    hsConfig.items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'declaration-item' + (item.required ? ' required' : '');
        
        const label = document.createElement('label');
        label.textContent = item.name + (item.required ? ' *' : '');
        if (item.required) {
            label.innerHTML = item.name + ' <span class="required-star">*</span>';
        }
        
        let input;
        if (item.type === 'select' && item.options) {
            input = document.createElement('select');
            input.innerHTML = '<option value="">请选择' + item.name + '</option>';
            item.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                input.appendChild(optionElement);
            });
        } else if (item.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }
        
        input.id = `dynamic-item-${index}`;
        input.name = item.key;
        input.placeholder = '请输入' + item.name;
        if (item.required) {
            input.required = true;
        }
        
        // 如果是品牌名称相关字段，优先填充FYI数据
        if (item.key.includes('品牌名称') || item.key.includes('型号')) {
            input.value = item.defaultValue || '';
        }
        
        itemDiv.appendChild(label);
        itemDiv.appendChild(input);
        container.appendChild(itemDiv);
    });
}

// 获取HSCODE配置（模拟数据）
function getHSCodeConfig(hscode) {
    // 这里模拟不同HSCODE的申报要素配置
    const configs = {
        '1234567890': {
            items: [
                { key: '用途', name: '用途', type: 'select', required: true },
                { key: '材质', name: '材质', type: 'text', required: true },
                { key: '品牌名称', name: '品牌名称', type: 'text', required: true, defaultValue: '得力(deli)' },
                { key: '型号', name: '型号', type: 'text', required: true, defaultValue: '64502' }
            ]
        },
        '0987654321': {
            items: [
                { key: '材质', name: '材质', type: 'text', required: true },
                { key: '功能', name: '功能', type: 'select', required: true },
                { key: '品牌名称', name: '品牌名称', type: 'text', required: true },
                { key: '规格', name: '规格', type: 'text', required: false }
            ]
        }
    };
    
    // 如果找不到配置，返回默认配置
    return configs[hscode] || {
        items: [
            { key: '用途', name: '用途', type: 'text', required: true },
            { key: '材质', name: '材质', type: 'text', required: true },
            { key: '品牌名称', name: '品牌名称', type: 'text', required: true },
            { key: '型号', name: '型号', type: 'text', required: false }
        ]
    };
}

// 填充申报要素表单（从已有数据）
function populateDeclarationForm(declarationElements) {
    if (!declarationElements) return;
    
    // 解析申报要素字符串
    const elements = parseDeclarationElements(declarationElements);
    
    // 填充固定前两项
    if (elements.brandType !== undefined) {
        document.getElementById('brand-type').value = elements.brandType;
    }
    if (elements.preferentialStatus !== undefined) {
        document.getElementById('preferential-status').value = elements.preferentialStatus;
    }
    
    // 填充动态项
    Object.keys(elements.dynamicItems || {}).forEach(key => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = elements.dynamicItems[key];
        }
    });
    
    // 填充固定后三项
    if (elements.gtin) {
        document.getElementById('gtin').value = elements.gtin;
    }
    if (elements.cas) {
        document.getElementById('cas').value = elements.cas;
    }
    if (elements.other) {
        document.getElementById('other-info').value = elements.other;
    }
}

// 解析申报要素字符串
function parseDeclarationElements(declarationElements) {
    const parts = declarationElements.split('|');
    const result = {
        brandType: parts[0] || '',
        preferentialStatus: parts[1] || '',
        dynamicItems: {},
        gtin: '',
        cas: '',
        other: ''
    };
    
    // 解析中间的动态项
    for (let i = 2; i < parts.length; i++) {
        const part = parts[i];
        if (part && part.includes(':')) {
            const [key, value] = part.split(':', 2);
            if (key === 'GTIN') {
                result.gtin = value;
            } else if (key === 'CAS') {
                result.cas = value;
            } else if (key === '其他') {
                result.other = value;
            } else {
                result.dynamicItems[key] = value;
            }
        }
    }
    
    return result;
}

// 添加预览更新监听器
function addPreviewUpdateListeners() {
    // 为所有表单元素添加change事件监听器
    const modal = document.getElementById('declaration-modal');
    const inputs = modal.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('change', updateDeclarationPreview);
        input.addEventListener('input', updateDeclarationPreview);
    });
}

// 更新申报要素预览
function updateDeclarationPreview() {
    const preview = document.getElementById('declaration-preview');
    const elements = [];
    
    // 固定前两项（只显示数字编号）
    const brandType = document.getElementById('brand-type').value;
    const preferentialStatus = document.getElementById('preferential-status').value;
    
    elements.push(brandType || '');
    elements.push(preferentialStatus || '');
    
    // 动态中间项（显示"名称:值"格式）
    const dynamicContainer = document.getElementById('dynamic-declaration-items');
    const dynamicInputs = dynamicContainer.querySelectorAll('input, select, textarea');
    
    dynamicInputs.forEach(input => {
        const value = input.value.trim();
        const name = input.name;
        if (input.required || value) {
            elements.push(value ? `${name}:${value}` : '');
        }
    });
    
    // 固定后三项（非必填，有值才显示）
    const gtin = document.getElementById('gtin').value.trim();
    const cas = document.getElementById('cas').value.trim();
    const other = document.getElementById('other-info').value.trim();
    
    if (gtin || cas || other) {
        if (gtin) elements.push(`GTIN:${gtin}`);
        if (cas) elements.push(`CAS:${cas}`);
        if (other) elements.push(`其他:${other}`);
    }
    
    // 拼接结果
    let result = elements.join('|');
    
    // 清理末尾的空分隔符
    result = result.replace(/\|+$/, '');
    
    if (result) {
        preview.textContent = result;
        preview.classList.remove('empty');
    } else {
        preview.textContent = '请填写申报要素信息';
        preview.classList.add('empty');
    }
}

// 保存申报要素
function saveDeclarationElements() {
    // 验证必填项
    if (!validateDeclarationForm()) {
        return;
    }
    
    // 验证目的国选择
    const selectedCountries = Array.from(document.querySelectorAll('#destination-countries input:checked'))
        .map(cb => cb.value);
    
    if (selectedCountries.length === 0) {
        alert('请至少选择一个目的国');
        return;
    }
    
    // 获取申报要素值
    const declarationElements = document.getElementById('declaration-preview').textContent;
    
    if (declarationElements === '请填写申报要素信息') {
        alert('请填写申报要素信息');
        return;
    }
    
    // 保存到当前编辑的商品
    const itemIndex = currentData.findIndex(item => item.id === window.currentEditingItemId);
    if (itemIndex !== -1) {
        currentData[itemIndex].declarationElements = declarationElements;
        currentData[itemIndex].lastUpdater = 'current_user'; // 实际应用中应获取当前用户
        currentData[itemIndex].updateTime = new Date().toLocaleString('zh-CN');
    }
    
    // 刷新表格
    loadGoodsData();
    
    // 关闭弹窗
    closeDeclarationModal();
    
    alert('申报要素保存成功');
}

// 验证申报要素表单
function validateDeclarationForm() {
    // 检查必填的固定项
    const brandType = document.getElementById('brand-type').value;
    const preferentialStatus = document.getElementById('preferential-status').value;
    
    if (!brandType) {
        alert('请选择品牌类型');
        document.getElementById('brand-type').focus();
        return false;
    }
    
    if (!preferentialStatus) {
        alert('请选择享惠情况');
        document.getElementById('preferential-status').focus();
        return false;
    }
    
    // 检查动态必填项
    const requiredInputs = document.querySelectorAll('#dynamic-declaration-items .required input, #dynamic-declaration-items .required select, #dynamic-declaration-items .required textarea');
    
    for (let input of requiredInputs) {
        if (!input.value.trim()) {
            const label = input.parentElement.querySelector('label').textContent.replace(' *', '');
            alert(`请填写${label}`);
            input.focus();
            return false;
        }
    }
    
    return true;
}

// 编辑其他信息
function editOtherInfo(id) {
    alert(`编辑其他信息，商品ID: ${id}`);
}

// 查看详情
function viewDetails(id) {
    alert(`查看详情，商品ID: ${id}`);
}

// 跳转到指定页面
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updatePaginationDisplay();
    loadGoodsData();
}

// 改变每页显示条数
function changePageSize() {
    pageSize = parseInt(document.getElementById('page-size').value);
    currentPage = 1;
    updatePaginationDisplay();
    loadGoodsData();
}

// 更新分页显示
function updatePaginationDisplay() {
    document.getElementById('current-page').textContent = currentPage;
    document.getElementById('total-pages').textContent = totalPages;
    document.getElementById('total-count').textContent = totalCount;
}

// 获取状态标签HTML
function getStatusTag(status) {
    let className = 'status-tag ';
    switch (status) {
        case '待评估':
            className += 'status-pending';
            break;
        case '待确认':
            className += 'status-reviewing';
            break;
        case '已确认':
            className += 'status-confirmed';
            break;
        default:
            className += 'status-pending';
    }
    return `<span class="${className}">${status}</span>`;
}

// 初始化示例数据
function initSampleData() {
    currentData = [
        {
            id: 1,
            internationalSku: generateInternationalSku(1),
            domesticSku: generateDomesticSku(1),
            hscode: '1234567890',
            chineseTitle: '示例商品1',
            destinationCountry: '泰国',
            declarationElements: '品牌:示例品牌;规格:10*20cm',
            chineseName: '中文申报品名1',
            englishName: 'Declaration Name 1',
            companyCode: generateCompanyCode(1),
            companyChineseName: '生产企业中文名1',
            companyEnglishName: 'Production Company 1',
            companyChineseAddress: '中国上海市浦东新区',
            companyEnglishAddress: 'Pudong, Shanghai, China',
            contact: '张三',
            contactPhone: '13800138001',
            weight: '0.5',
            brand: '示例品牌',
            specification: '10*20cm',
            unit: '个',
            assessmentStatus: '待评估',
            lastUpdater: 'lizimeng16',
            updateTime: '2023-12-01 10:30:00'
        },
        {
            id: 2,
            internationalSku: generateInternationalSku(2),
            domesticSku: generateDomesticSku(2),
            hscode: '0987654321',
            chineseTitle: '示例商品2',
            destinationCountry: '越南',
            declarationElements: '品牌:示例品牌2;规格:15*25cm',
            chineseName: '中文申报品名2',
            englishName: 'Declaration Name 2',
            companyCode: generateCompanyCode(2),
            companyChineseName: '生产企业中文名2',
            companyEnglishName: 'Production Company 2',
            companyChineseAddress: '中国广东省深圳市',
            companyEnglishAddress: 'Shenzhen, Guangdong, China',
            contact: '李四',
            contactPhone: '13800138002',
            weight: '0.8',
            brand: '示例品牌2',
            specification: '15*25cm',
            unit: '套',
            assessmentStatus: '待确认',
            lastUpdater: 'lizimeng17',
            updateTime: '2023-12-01 11:15:00'
        }
    ];
    
    // 生成更多示例数据
    for (let i = 3; i <= 25; i++) {
        currentData.push({
            id: i,
            internationalSku: generateInternationalSku(i),
            domesticSku: generateDomesticSku(i),
            hscode: `${1000000000 + i}`,
            chineseTitle: `示例商品${i}`,
            destinationCountry: ['泰国', '越南', '马来', '匈牙利', '巴西', '印尼', '香港'][i % 7],
            declarationElements: `品牌:示例品牌${i};规格:${10 + i}*${20 + i}cm`,
            chineseName: `中文申报品名${i}`,
            englishName: `Declaration Name ${i}`,
            companyCode: generateCompanyCode(i),
            companyChineseName: `生产企业中文名${i}`,
            companyEnglishName: `Production Company ${i}`,
            companyChineseAddress: `中国某省某市某区${i}`,
            companyEnglishAddress: `Address ${i}, China`,
            contact: `联系人${i}`,
            contactPhone: `138${String(i).padStart(8, '0')}`,
            weight: (Math.random() * 2 + 0.1).toFixed(2),
            brand: `示例品牌${i}`,
            specification: `${10 + i}*${20 + i}cm`,
            unit: ['个', '套', '件', '盒'][i % 4],
            assessmentStatus: ['待评估', '待确认', '已确认'][i % 3],
            lastUpdater: `lizimeng17`,
            updateTime: `2023-12-${String((i % 28) + 1).padStart(2, '0')} ${String((i % 24)).padStart(2, '0')}:${String((i % 60)).padStart(2, '0')}:00`
        });
    }
    
    totalCount = currentData.length;
    totalPages = Math.ceil(totalCount / pageSize);
}

// 生成国际SKUID（8开头的11位数字）
function generateInternationalSku(index) {
    // 8开头，后面10位数字，总共11位
    const suffix = String(index).padStart(10, '0').slice(-10);
    return `8${suffix}`;
}

// 生成国内SKUID（1开头的12位数字）
function generateDomesticSku(index) {
    // 1开头，后面11位数字，总共12位
    const suffix = String(index).padStart(11, '0').slice(-11);
    return `1${suffix}`;
}

// 生成18位社会统一信用代码
function generateCompanyCode(index) {
    // 社会统一信用代码格式：18位，由数字和大写字母组成
    // 第1位：登记管理部门代码（1-9，A-Z，不含I、O、Z、S、V）
    // 第2位：机构类别代码
    // 第3-8位：登记管理机关行政区划码（6位数字）
    // 第9-17位：主体标识码（9位）
    // 第18位：校验码
    
    const managementCodes = ['1', '5', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X', 'Y'];
    const typeCodes = ['1', '2', '3', '9'];
    
    // 第1位：登记管理部门代码
    const managementCode = managementCodes[index % managementCodes.length];
    
    // 第2位：机构类别代码
    const typeCode = typeCodes[index % typeCodes.length];
    
    // 第3-8位：区划代码（模拟各省市区划）
    const areaCodes = ['110000', '310000', '440100', '330100', '320100', '420100', '510100', '610100'];
    const areaCode = areaCodes[index % areaCodes.length];
    
    // 第9-17位：主体标识码（9位数字/字母组合）
    const bodyId = String(index).padStart(9, '0').slice(-9);
    
    // 第18位：校验码（简化计算，实际应用中需要按标准算法计算）
    const checkCodes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X', 'Y'];
    const checkCode = checkCodes[index % checkCodes.length];
    
    return `${managementCode}${typeCode}${areaCode}${bodyId}${checkCode}`;
}

// 加载商品数据
function loadGoodsData(searchParams = null) {
    let filteredData = currentData;
    
    // 如果有搜索参数，进行过滤
    if (searchParams) {
        filteredData = currentData.filter(item => {
            let match = true;
            
            if (searchParams.domesticSku && searchParams.domesticSku.trim()) {
                const skus = searchParams.domesticSku.split('\n').filter(sku => sku.trim());
                match = match && skus.some(sku => item.domesticSku.includes(sku.trim()));
            }
            
            if (searchParams.internationalSku && searchParams.internationalSku.trim()) {
                const skus = searchParams.internationalSku.split('\n').filter(sku => sku.trim());
                match = match && skus.some(sku => item.internationalSku.includes(sku.trim()));
            }
            
            if (searchParams.hscode && searchParams.hscode.trim()) {
                match = match && item.hscode.includes(searchParams.hscode.trim());
            }
            
            if (searchParams.destinationCountry) {
                match = match && item.destinationCountry === searchParams.destinationCountry;
            }
            
            if (searchParams.assessmentStatus) {
                match = match && item.assessmentStatus === searchParams.assessmentStatus;
            }
            
            if (searchParams.lastUpdater && searchParams.lastUpdater.trim()) {
                match = match && item.lastUpdater.includes(searchParams.lastUpdater.trim());
            }
            
            return match;
        });
    }
    
    // 更新总数和页数
    totalCount = filteredData.length;
    totalPages = Math.ceil(totalCount / pageSize);
    
    // 获取当前页数据
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    // 渲染表格
    renderTable(pageData);
    
    // 更新分页显示
    updatePaginationDisplay();
}

// 渲染表格
function renderTable(data) {
    const tbody = document.getElementById('goods-tbody');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="24" class="no-data">暂无数据</td></tr>';
        return;
    }
    
    const rows = data.map(item => `
        <tr>
            <td class="fixed-column">
                <input type="checkbox" value="${item.id}">
            </td>
            <td class="fixed-column">${item.internationalSku}</td>
            <td>${item.domesticSku}</td>
            <td>${item.hscode}</td>
            <td>${item.chineseTitle}</td>
            <td>${item.destinationCountry}</td>
            <td>${item.declarationElements}</td>
            <td>${item.chineseName}</td>
            <td>${item.englishName}</td>
            <td>${item.companyCode}</td>
            <td>${item.companyChineseName}</td>
            <td>${item.companyEnglishName}</td>
            <td>${item.companyChineseAddress}</td>
            <td>${item.companyEnglishAddress}</td>
            <td>${item.contact}</td>
            <td>${item.contactPhone}</td>
            <td>${item.weight}</td>
            <td>${item.brand}</td>
            <td>${item.specification}</td>
            <td>${item.unit}</td>
            <td>${getStatusTag(item.assessmentStatus)}</td>
            <td>${item.lastUpdater}</td>
            <td>${item.updateTime}</td>
            <td class="fixed-column-right">
                <div class="action-links">
                    <a href="javascript:void(0)" class="action-link" onclick="editDeclarationElements(${item.id})">编辑申报要素</a>
                    <a href="javascript:void(0)" class="action-link" onclick="editOtherInfo(${item.id})">编辑其他信息</a>
                    <a href="javascript:void(0)" class="action-link" onclick="viewDetails(${item.id})">详情</a>
                </div>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows;
    
    // 重置全选状态
    document.getElementById('select-all').checked = false;
}
