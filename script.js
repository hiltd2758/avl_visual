// ===== TREE NODE CLASS =====
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 0;
        this.y = 0;
        this.isHighlighted = false;
        this.balance = 0;
    }
}

// ===== AVL TREE CLASS =====
class AVLTree {
    constructor() {
        this.root = null;
        this.levelSpacing = 100;
        this.horizontalSpacing = 50;
        this.messages = [];
        this.animationDelay = 1000;
        this.nodeRadius = 26;
        this.searchPath = [];
    }

    addMessage(message) {
        this.messages.unshift(message);
        if (this.messages.length > 20) {
            this.messages.pop();
        }
        this.updateMessages();
    }

    updateMessages() {
        const logArea = document.getElementById('logArea');
        if (logArea) {
            logArea.innerHTML = this.messages
                .map(msg => `<div class="log-entry">${msg}</div>`)
                .join('');
        }
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    updateHeight(node) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        node.balance = this.getBalance(node);
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    async insert(value) {
        this.clearHighlights();
        this.root = await this._insert(this.root, value);
        await this.renderTree();
        this.updateTreeInfo();
    }

    clearHighlights() {
        this.traverseAndClear(this.root);
        this.searchPath = [];
    }

    traverseAndClear(node) {
        if (!node) return;
        node.isHighlighted = false;
        this.traverseAndClear(node.left);
        this.traverseAndClear(node.right);
    }

    async _insert(node, value) {
        if (!node) {
            this.addMessage(`Thêm nút ${value}`);
            return new TreeNode(value);
        }

        if (value < node.value) {
            node.left = await this._insert(node.left, value);
        } else if (value > node.value) {
            node.right = await this._insert(node.right, value);
        } else {
            this.addMessage(`Giá trị ${value} đã tồn tại`);
            return node;
        }

        this.updateHeight(node);
        const balance = this.getBalance(node);

        // Left-Left
        if (balance > 1 && value < node.left.value) {
            this.addMessage(`Lệch trái-trái tại ${node.value}, xoay phải`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();
            return this.rotateRight(node);
        }

        // Right-Right
        if (balance < -1 && value > node.right.value) {
            this.addMessage(`Lệch phải-phải tại ${node.value}, xoay trái`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();
            return this.rotateLeft(node);
        }

        // Left-Right
        if (balance > 1 && value > node.left.value) {
            this.addMessage(`Lệch trái-phải tại ${node.value}, xoay kép LR`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();

            node.left = this.rotateLeft(node.left);
            await this.renderTree();
            await this.delay();

            return this.rotateRight(node);
        }

        // Right-Left
        if (balance < -1 && value < node.right.value) {
            this.addMessage(`Lệch phải-trái tại ${node.value}, xoay kép RL`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();

            node.right = this.rotateRight(node.right);
            await this.renderTree();
            await this.delay();

            return this.rotateLeft(node);
        }

        return node;
    }

    async delay() {
        return new Promise(resolve => setTimeout(resolve, this.animationDelay));
    }

    async delete(value) {
        this.clearHighlights();
        this.root = await this._delete(this.root, value);
        await this.renderTree();
        this.updateTreeInfo();
    }

    async _delete(node, value) {
        if (!node) {
            this.addMessage(`Không tìm thấy ${value}`);
            return null;
        }

        if (value < node.value) {
            node.left = await this._delete(node.left, value);
        } else if (value > node.value) {
            node.right = await this._delete(node.right, value);
        } else {
            this.addMessage(`Xóa nút ${value}`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();

            if (!node.left) return node.right;
            if (!node.right) return node.left;

            const minNode = this.getMinNode(node.right);
            this.addMessage(`Thay ${node.value} bằng ${minNode.value}`);

            node.value = minNode.value;
            node.right = await this._delete(node.right, minNode.value);
        }

        if (!node) return null;

        this.updateHeight(node);
        const balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) {
            this.addMessage(`Cân bằng lại tại ${node.value}, xoay phải`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();
            return this.rotateRight(node);
        }

        if (balance > 1 && this.getBalance(node.left) < 0) {
            this.addMessage(`Cân bằng lại tại ${node.value}, xoay kép LR`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();

            node.left = this.rotateLeft(node.left);
            await this.renderTree();
            await this.delay();

            return this.rotateRight(node);
        }

        if (balance < -1 && this.getBalance(node.right) <= 0) {
            this.addMessage(`Cân bằng lại tại ${node.value}, xoay trái`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();
            return this.rotateLeft(node);
        }

        if (balance < -1 && this.getBalance(node.right) > 0) {
            this.addMessage(`Cân bằng lại tại ${node.value}, xoay kép RL`);
            node.isHighlighted = true;
            await this.renderTree();
            await this.delay();

            node.right = this.rotateRight(node.right);
            await this.renderTree();
            await this.delay();

            return this.rotateLeft(node);
        }

        return node;
    }

    getMinNode(node) {
        let current = node;
        while (current.left) current = current.left;
        return current;
    }

    rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    async renderTree() {
        const container = document.getElementById('treeContainer');
        if (!container) return;

        container.innerHTML = '';

        const emptyState = document.getElementById('emptyState');
        if (!this.root) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        this.calculateNodePositions(this.root, 0, 60);

        const bounds = this.getTreeBounds(this.root);
        const padding = 50;

        let shiftX = padding;
        if (bounds.minX < 0) {
            shiftX = Math.abs(bounds.minX) + padding;
        } else if (bounds.minX >= 0 && this.root) {
            const containerWidth = container.offsetWidth;
            const treeWidth = bounds.maxX - bounds.minX;
            if (treeWidth < containerWidth - 2 * padding) {
                shiftX = (containerWidth - treeWidth) / 2 - bounds.minX;
            }
        }

        this.shiftTree(this.root, shiftX);
        await this.drawNodes(this.root, container);
    }

    calculateNodePositions(node, x, y) {
        if (!node) return;

        node.x = x;
        node.y = y;

        const h = node.height;
        let spacing = this.horizontalSpacing;
        if (h > 1) {
            spacing = this.horizontalSpacing * Math.pow(2, h - 2);
        }

        if (node.left) {
            this.calculateNodePositions(node.left, x - spacing, y + this.levelSpacing);
        }
        if (node.right) {
            this.calculateNodePositions(node.right, x + spacing, y + this.levelSpacing);
        }
    }

    getTreeBounds(node, bounds = { minX: Infinity, maxX: -Infinity }) {
        if (!node) return bounds;

        bounds.minX = Math.min(bounds.minX, node.x);
        bounds.maxX = Math.max(bounds.maxX, node.x);

        this.getTreeBounds(node.left, bounds);
        this.getTreeBounds(node.right, bounds);

        return bounds;
    }

    shiftTree(node, dx) {
        if (!node) return;
        node.x += dx;
        this.shiftTree(node.left, dx);
        this.shiftTree(node.right, dx);
    }

    async drawNodes(node, container) {
        if (!node) return;

        // Draw branches
        if (node.left) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            this.drawBranch(node, node.left, branch);
            container.appendChild(branch);
        }

        if (node.right) {
            const branch = document.createElement('div');
            branch.className = 'branch';
            this.drawBranch(node, node.right, branch);
            container.appendChild(branch);
        }

        // Draw node
        const nodeElem = document.createElement('div');
        nodeElem.className = `node${node.isHighlighted ? ' highlight' : ''}${this.searchPath.includes(node) ? ' search-path' : ''}`;

        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        nodeContent.textContent = node.value;
        nodeElem.appendChild(nodeContent);

        const heightBadge = document.createElement('div');
        heightBadge.className = 'badge height-badge';
        heightBadge.textContent = `h:${node.height}`;
        nodeElem.appendChild(heightBadge);

        const balanceBadge = document.createElement('div');
        balanceBadge.className = 'badge balance-badge';
        balanceBadge.textContent = `b:${node.balance}`;
        nodeElem.appendChild(balanceBadge);

        nodeElem.style.left = `${node.x - this.nodeRadius}px`;
        nodeElem.style.top = `${node.y - this.nodeRadius}px`;
        container.appendChild(nodeElem);

        await this.drawNodes(node.left, container);
        await this.drawNodes(node.right, container);
    }

    drawBranch(parent, child, branch) {
        const dx = child.x - parent.x;
        const dy = child.y - parent.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        branch.style.width = `${length}px`;
        branch.style.left = `${parent.x}px`;
        branch.style.top = `${parent.y}px`;
        branch.style.transform = `rotate(${angle}deg)`;
    }

    async search(value) {
        this.clearHighlights();
        this.searchPath = [];
        const found = await this._search(this.root, value);

        await this.renderTree();

        if (found) {
            this.addMessage(`Tìm thấy ${value}`);
        } else {
            this.addMessage(`Không tìm thấy ${value}`);
        }

        return found;
    }

    async _search(node, value) {
        if (!node) return false;

        this.searchPath.push(node);
        await this.renderTree();
        await this.delay();

        if (node.value === value) {
            node.isHighlighted = true;
            return true;
        }

        if (value < node.value) {
            return await this._search(node.left, value);
        } else {
            return await this._search(node.right, value);
        }
    }

    async inOrder() {
        this.clearHighlights();
        const result = [];
        await this._inOrder(this.root, result);
        this.addMessage(`In-order: ${result.join(', ')}`);
    }

    async _inOrder(node, result) {
        if (!node) return;

        await this._inOrder(node.left, result);

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree();
        await this.delay();
        node.isHighlighted = false;

        await this._inOrder(node.right, result);
    }

    async preOrderTraversal() {
        this.clearHighlights();
        const result = [];
        await this._preOrderTraversal(this.root, result);
        this.addMessage(`Pre-order: ${result.join(', ')}`);
    }

    async _preOrderTraversal(node, result) {
        if (!node) return;

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree();
        await this.delay();
        node.isHighlighted = false;

        await this._preOrderTraversal(node.left, result);
        await this._preOrderTraversal(node.right, result);
    }

    async postOrderTraversal() {
        this.clearHighlights();
        const result = [];
        await this._postOrderTraversal(this.root, result);
        this.addMessage(`Post-order: ${result.join(', ')}`);
    }

    async _postOrderTraversal(node, result) {
        if (!node) return;

        await this._postOrderTraversal(node.left, result);
        await this._postOrderTraversal(node.right, result);

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree();
        await this.delay();
        node.isHighlighted = false;
    }

    updateTreeInfo() {
        const nodeCount = this.countNodes(this.root);
        const treeHeight = this.getHeight(this.root);

        document.getElementById('nodeCount').textContent = `${nodeCount} nút`;
        document.getElementById('treeHeight').textContent = `Chiều cao ${treeHeight}`;
    }

    countNodes(node) {
        if (!node) return 0;
        return 1 + this.countNodes(node.left) + this.countNodes(node.right);
    }
}

// ===== INITIALIZE =====
const avl = new AVLTree();

// ===== EVENT HANDLERS =====
async function addNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value) && value >= 0 && value <= 999) {
        await avl.insert(value);
        input.value = '';
    } else if (input.value) {
        avl.addMessage('Giá trị không hợp lệ (0-999)');
    }
}

async function deleteNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        await avl.delete(value);
        input.value = '';
    } else if (input.value) {
        avl.addMessage('Nhập giá trị để xóa');
    }
}

async function searchNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        await avl.search(value);
    } else if (input.value) {
        avl.addMessage('Nhập giá trị để tìm');
    }
}

async function inOrder() {
    if (!avl.root) {
        avl.addMessage('Cây rỗng');
        return;
    }
    await avl.inOrder();
}

async function preOrderTraversal() {
    if (!avl.root) {
        avl.addMessage('Cây rỗng');
        return;
    }
    await avl.preOrderTraversal();
}

async function postOrderTraversal() {
    if (!avl.root) {
        avl.addMessage('Cây rỗng');
        return;
    }
    await avl.postOrderTraversal();
}

function resetTree() {
    avl.root = null;
    avl.messages = [];
    avl.addMessage('Đã xóa toàn bộ cây');
    avl.renderTree();
    avl.updateTreeInfo();
}

function setAnimationSpeed(value) {
    avl.animationDelay = 3000 - value;
    const speed = (3000 - value) / 1000;
    document.getElementById('speedLabel').textContent = `${speed.toFixed(1)}x`;
}

function togglePanel() {
    const panel = document.getElementById('sidePanel');
    const canvasArea = document.querySelector('.canvas-area');
    const toggleText = document.getElementById('panelToggleText');

    panel.classList.toggle('open');
    canvasArea.classList.toggle('panel-open');

    if (panel.classList.contains('open')) {
        toggleText.textContent = 'Ẩn bảng điều khiển';
    } else {
        toggleText.textContent = 'Hiện bảng điều khiển';
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.getElementById('nodeValue').addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        await addNode();
    }
});

// ===== DRAG TO SCROLL =====
const treeContainer = document.getElementById('treeContainer');
let isDown = false;
let startX, startY, scrollLeft, scrollTop;

treeContainer.addEventListener('mousedown', (e) => {
    isDown = true;
    treeContainer.style.cursor = 'grabbing';
    startX = e.pageX - treeContainer.offsetLeft;
    scrollLeft = treeContainer.scrollLeft;
    startY = e.pageY - treeContainer.offsetTop;
    scrollTop = treeContainer.scrollTop;
});

treeContainer.addEventListener('mouseleave', () => {
    isDown = false;
    treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mouseup', () => {
    isDown = false;
    treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - treeContainer.offsetLeft;
    const walkX = (x - startX);
    treeContainer.scrollLeft = scrollLeft - walkX;

    const y = e.pageY - treeContainer.offsetTop;
    const walkY = (y - startY);
    treeContainer.scrollTop = scrollTop - walkY;
});

// ===== INITIALIZE UI =====
avl.updateTreeInfo();