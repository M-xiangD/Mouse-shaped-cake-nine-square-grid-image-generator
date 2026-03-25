// 全局变量
let currentMode = 1;
let singleImage = null;
let multipleImages = [];
let gridItems = document.querySelectorAll('.grid-item');
let gridContainer = document.getElementById('gridContainer');
let gridRows = 3;
let gridCols = 3;

// 初始化
function init() {
    // 模式切换事件
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = parseInt(this.dataset.mode);
            switchMode();
        });
    });
    
    // 单图上传事件
    document.getElementById('singleFile').addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            // 检查文件类型是否为图片
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                alert('请上传图片文件！');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                singleImage = e.target.result;
                if (currentMode === 1) {
                    updatePreview();
                }
            };
            reader.onerror = function() {
                alert('图片加载失败，请重试！');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 多图上传事件（支持多选）
    document.getElementById('multipleFileInput').addEventListener('change', function(e) {
        if (e.target.files && e.target.files.length > 0) {
            // 根据当前网格布局限制上传图片数量
            const totalItems = gridRows * gridCols;
            const files = Array.from(e.target.files).slice(0, totalItems - multipleImages.length);
            
            files.forEach(file => {
                // 检查文件类型是否为图片
                if (!file.type.startsWith('image/')) {
                    alert('请上传图片文件！');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageUrl = e.target.result;
                    multipleImages.push(imageUrl);
                    updateUploadPreviews();
                    if (currentMode === 2) {
                        updatePreview();
                    }
                };
                reader.onerror = function() {
                    alert('图片加载失败，请重试！');
                };
                reader.readAsDataURL(file);
            });
        }
    });
    
    // 间距调整事件
    document.getElementById('topSpacing').addEventListener('input', updateSpacing);
    document.getElementById('bottomSpacing').addEventListener('input', updateSpacing);
    document.getElementById('leftSpacing').addEventListener('input', updateSpacing);
    document.getElementById('rightSpacing').addEventListener('input', updateSpacing);
    
    // 操作按钮事件
    document.getElementById('generateBtn').addEventListener('click', generateGrid);
    document.getElementById('downloadBtn').addEventListener('click', downloadGrid);
    document.getElementById('shuffleBtn').addEventListener('click', shuffleGrid);
    
    // 网格布局应用按钮事件
    document.getElementById('applyGridBtn').addEventListener('click', applyGridLayout);
    
    // 初始化点击交换功能
    initClickSwap();
}

// 更新上传预览（已移除预览功能）
function updateUploadPreviews() {
    // 预览功能已移除
}

// 初始化点击交换功能
function initClickSwap() {
    let selectedIndex = -1;
    
    // 初始化单图分割的图片块数据
    function initSingleImagePieces() {
        if (currentMode === 1 && singleImage) {
            const totalItems = gridRows * gridCols;
            window.singleImagePieces = Array.from({length: totalItems}, (_, i) => i);
        }
    }
    
    gridItems.forEach((item, index) => {
        item.setAttribute('data-index', index);
        
        // 点击事件
        item.addEventListener('click', function(e) {
            // 确保只有在有图片时才能操作
            if ((currentMode === 1 && singleImage) || (currentMode === 2 && multipleImages[index])) {
                if (selectedIndex === -1) {
                    // 第一次点击：选择图片
                    selectedIndex = index;
                    item.classList.add('selected');
                    item.style.cursor = 'pointer';
                } else if (selectedIndex === index) {
                    // 点击已选择的图片：取消选择
                    selectedIndex = -1;
                    item.classList.remove('selected');
                    item.style.cursor = 'pointer';
                } else {
                    // 第二次点击：交换位置
                    if (currentMode === 1 && singleImage) {
                        // 单图分割模式下交换图片块
                        // 确保singleImagePieces数组存在
                        if (!window.singleImagePieces) {
                            const totalItems = gridRows * gridCols;
                            window.singleImagePieces = Array.from({length: totalItems}, (_, i) => i);
                        }
                        // 交换图片块
                        [window.singleImagePieces[selectedIndex], window.singleImagePieces[index]] = [window.singleImagePieces[index], window.singleImagePieces[selectedIndex]];
                        
                        // 更新预览
                        const img = new Image();
                        img.src = singleImage;
                        img.onload = function() {
                            const totalItems = gridRows * gridCols;
                            for (let i = 0; i < totalItems; i++) {
                                const gridItem = gridItems[i];
                                const originalIndex = window.singleImagePieces[i];
                                const row = Math.floor(originalIndex / gridCols);
                                const col = originalIndex % gridCols;
                                
                                // 创建Canvas用于显示分割后的图片
                                const canvas = document.createElement('canvas');
                                canvas.width = gridItem.offsetWidth;
                                canvas.height = gridItem.offsetHeight;
                                const ctx = canvas.getContext('2d');
                                
                                // 计算分割区域
                                const imgWidth = img.width / gridCols;
                                const imgHeight = img.height / gridRows;
                                const sx = col * imgWidth;
                                const sy = row * imgHeight;
                                
                                // 绘制分割后的图片
                                ctx.drawImage(img, sx, sy, imgWidth, imgHeight, 0, 0, canvas.width, canvas.height);
                                
                                // 清除原有内容并添加新的Canvas
                                gridItem.innerHTML = '';
                                gridItem.appendChild(canvas);
                            }
                        };
                    } else if (currentMode === 2 && multipleImages[index]) {
                        // 多图排版模式下交换图片位置
                        const temp = multipleImages[selectedIndex];
                        multipleImages[selectedIndex] = multipleImages[index];
                        multipleImages[index] = temp;
                        updatePreview();
                        updateUploadPreviews();
                    }
                    
                    // 清除选择状态
                    gridItems[selectedIndex].classList.remove('selected');
                    selectedIndex = -1;
                    item.style.cursor = 'pointer';
                }
            }
        });
    });
    
    // 设置初始光标样式
    gridItems.forEach(item => {
        item.style.cursor = 'pointer';
    });
}

// 应用网格布局
function applyGridLayout() {
    const rows = parseInt(document.getElementById('gridRows').value);
    const cols = parseInt(document.getElementById('gridCols').value);
    
    // 验证输入
    if (isNaN(rows) || isNaN(cols) || rows < 1 || rows > 10 || cols < 1 || cols > 10) {
        alert('请输入有效的行数和列数（1-10）');
        return;
    }
    
    // 更新全局变量
    gridRows = rows;
    gridCols = cols;
    
    // 更新网格容器样式
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    // 清空网格容器
    gridContainer.innerHTML = '';
    
    // 重新创建网格项
    const totalItems = rows * cols;
    for (let i = 0; i < totalItems; i++) {
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridContainer.appendChild(gridItem);
    }
    
    // 更新gridItems变量
    gridItems = document.querySelectorAll('.grid-item');
    
    // 重新初始化点击交换功能
    initClickSwap();
    
    // 更新预览
    updatePreview();
}

// 切换模式
function switchMode() {
    if (currentMode === 1) {
        document.getElementById('singleUpload').style.display = 'block';
        document.getElementById('multipleUpload').style.display = 'none';
    } else {
        document.getElementById('singleUpload').style.display = 'none';
        document.getElementById('multipleUpload').style.display = 'block';
    }
    updatePreview();
}

// 更新预览
function updatePreview() {
    if (currentMode === 1) {
        // 单图分割模式
        if (singleImage) {
            const img = new Image();
            img.src = singleImage;
            img.onload = function() {
                const totalItems = gridRows * gridCols;
                // 确保singleImagePieces数组存在且长度正确
                if (!window.singleImagePieces || window.singleImagePieces.length !== totalItems) {
                    window.singleImagePieces = Array.from({length: totalItems}, (_, i) => i);
                }
                for (let i = 0; i < totalItems; i++) {
                    // 使用singleImagePieces数组来获取原始索引
                    const originalIndex = window.singleImagePieces[i];
                    const row = Math.floor(originalIndex / gridCols);
                    const col = originalIndex % gridCols;
                    const gridItem = gridItems[i];
                    
                    // 创建Canvas用于显示分割后的图片
                    const canvas = document.createElement('canvas');
                    canvas.width = gridItem.offsetWidth;
                    canvas.height = gridItem.offsetHeight;
                    const ctx = canvas.getContext('2d');
                    
                    // 计算分割区域
                    const imgWidth = img.width / gridCols;
                    const imgHeight = img.height / gridRows;
                    const sx = col * imgWidth;
                    const sy = row * imgHeight;
                    
                    // 绘制分割后的图片
                    ctx.drawImage(img, sx, sy, imgWidth, imgHeight, 0, 0, canvas.width, canvas.height);
                    
                    // 清除原有内容并添加新的Canvas
                    gridItem.innerHTML = '';
                    gridItem.appendChild(canvas);
                }
            };
        } else {
            // 清空预览
            gridItems.forEach(item => {
                item.innerHTML = '';
            });
        }
    } else {
        // 多图排版模式
        gridItems.forEach((item, index) => {
            if (multipleImages[index]) {
                const img = document.createElement('img');
                img.src = multipleImages[index];
                item.innerHTML = '';
                item.appendChild(img);
            } else {
                item.innerHTML = '';
            }
        });
    }
}

// 更新间距
function updateSpacing() {
    const top = document.getElementById('topSpacing').value;
    const bottom = document.getElementById('bottomSpacing').value;
    const left = document.getElementById('leftSpacing').value;
    const right = document.getElementById('rightSpacing').value;
    
    // 更新显示值
    document.getElementById('topSpacingValue').textContent = top;
    document.getElementById('bottomSpacingValue').textContent = bottom;
    document.getElementById('leftSpacingValue').textContent = left;
    document.getElementById('rightSpacingValue').textContent = right;
    
    // 更新网格间距
    gridContainer.style.gap = `${top}px`;
    gridContainer.style.padding = `${top}px ${right}px ${bottom}px ${left}px`;
}

// 生成九宫格
function generateGrid() {
    updatePreview();
    alert('九宫格生成成功！');
}

// 下载九宫格
function downloadGrid() {
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    
    // 获取用户设置的间距值
    const topSpacing = parseInt(document.getElementById('topSpacing').value);
    const bottomSpacing = parseInt(document.getElementById('bottomSpacing').value);
    const leftSpacing = parseInt(document.getElementById('leftSpacing').value);
    const rightSpacing = parseInt(document.getElementById('rightSpacing').value);
    const gap = parseInt(document.getElementById('topSpacing').value);
    
    // 设置Canvas尺寸
    const gridWidth = gridContainer.offsetWidth;
    const gridHeight = gridContainer.offsetHeight;
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    
    // 绘制背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 计算每个网格项的尺寸和位置
    const itemWidth = (gridWidth - leftSpacing - rightSpacing - gap * (gridCols - 1)) / gridCols;
    const itemHeight = (gridHeight - topSpacing - bottomSpacing - gap * (gridRows - 1)) / gridRows;
    
    if (currentMode === 1) {
        // 单图分割模式
        if (singleImage) {
            const img = new Image();
            img.src = singleImage;
            img.onload = function() {
                const totalItems = gridRows * gridCols;
                for (let i = 0; i < totalItems; i++) {
                    const row = Math.floor(i / gridCols);
                    const col = i % gridCols;
                    const x = leftSpacing + col * (itemWidth + gap);
                    const y = topSpacing + row * (itemHeight + gap);
                    
                    // 计算分割区域
                    const imgWidth = img.width / gridCols;
                    const imgHeight = img.height / gridRows;
                    const sx = col * imgWidth;
                    const sy = row * imgHeight;
                    
                    // 绘制分割后的图片
                    ctx.drawImage(img, sx, sy, imgWidth, imgHeight, x, y, itemWidth, itemHeight);
                }
                
                // 下载图片
                downloadCanvas(canvas);
            };
        } else {
            alert('请先上传图片！');
        }
    } else {
        // 多图排版模式
        let loadedCount = 0;
        const totalImages = multipleImages.filter(img => img).length;
        
        if (totalImages === 0) {
            alert('请先上传图片！');
            return;
        }
        
        multipleImages.forEach((src, index) => {
            if (src) {
                const img = new Image();
                img.src = src;
                img.onload = function() {
                    const row = Math.floor(index / gridCols);
                    const col = index % gridCols;
                    const x = leftSpacing + col * (itemWidth + gap);
                    const y = topSpacing + row * (itemHeight + gap);
                    
                    // 计算图片的缩放比例，保持宽高比（使用最小缩放比例，确保图片完全在网格项内）
                    const scale = Math.min(itemWidth / img.width, itemHeight / img.height);
                    const scaledWidth = img.width * scale;
                    const scaledHeight = img.height * scale;
                    
                    // 计算居中位置
                    const offsetX = (itemWidth - scaledWidth) / 2;
                    const offsetY = (itemHeight - scaledHeight) / 2;
                    
                    // 绘制图片（保持宽高比）
                    ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
                    
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        // 下载图片
                        downloadCanvas(canvas);
                    }
                };
            } else {
                loadedCount++;
                if (loadedCount === totalImages) {
                    // 下载图片
                    downloadCanvas(canvas);
                }
            }
        });
    }
}

// 随机打乱网格
function shuffleGrid() {
    if (currentMode === 1) {
        // 单图分割模式下的打乱
        if (singleImage) {
            const totalItems = gridRows * gridCols;
            // 初始化并打乱索引
            window.singleImagePieces = Array.from({length: totalItems}, (_, i) => i);
            for (let i = window.singleImagePieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [window.singleImagePieces[i], window.singleImagePieces[j]] = [window.singleImagePieces[j], window.singleImagePieces[i]];
            }
            
            const img = new Image();
            img.src = singleImage;
            img.onload = function() {
                for (let i = 0; i < totalItems; i++) {
                    const gridItem = gridItems[i];
                    const originalIndex = window.singleImagePieces[i];
                    const row = Math.floor(originalIndex / gridCols);
                    const col = originalIndex % gridCols;
                    
                    // 创建Canvas用于显示分割后的图片
                    const canvas = document.createElement('canvas');
                    canvas.width = gridItem.offsetWidth;
                    canvas.height = gridItem.offsetHeight;
                    const ctx = canvas.getContext('2d');
                    
                    // 计算分割区域
                    const imgWidth = img.width / gridCols;
                    const imgHeight = img.height / gridRows;
                    const sx = col * imgWidth;
                    const sy = row * imgHeight;
                    
                    // 绘制分割后的图片
                    ctx.drawImage(img, sx, sy, imgWidth, imgHeight, 0, 0, canvas.width, canvas.height);
                    
                    // 清除原有内容并添加新的Canvas
                    gridItem.innerHTML = '';
                    gridItem.appendChild(canvas);
                }
            };
        } else {
            alert('请先上传图片！');
        }
    } else {
        // 多图排版模式下的打乱
        if (multipleImages.length > 0) {
            // 打乱图片数组
            for (let i = multipleImages.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [multipleImages[i], multipleImages[j]] = [multipleImages[j], multipleImages[i]];
            }
            updatePreview();
            updateUploadPreviews();
        } else {
            alert('请先上传图片！');
        }
    }
}

// 下载Canvas为图片
function downloadCanvas(canvas) {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = '九宫格.png';
    link.href = dataURL;
    link.click();
}

// 初始化应用
init();