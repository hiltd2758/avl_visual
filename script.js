const toggleThemeBtn = document.getElementById('toggleTheme');
const themeIcon = toggleThemeBtn.querySelector('i');

toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
});


function setAnimationSpeed(value) {
    const speedValue = document.getElementById('speedValue');
    const speed = (3000 - value) / 1000;
    speedValue.textContent = speed.toFixed(1) + 'x';

}

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

class AVLTree {
    constructor() {
        this.root = null;
        this.levelSpacing = 120;
        this.horizontalSpacing = 50;
        this.messages = [];
        this.animationDelay = 1000;
        this.nodeRadius = 25;
        this.searchPath = [];
    }

    addMessage(message) {
        this.messages.unshift(message);
        if (this.messages.length > 10) {
            this.messages.pop();
        }
        this.updateMessages();
    }

    updateMessages() {
        const messageHistory = document.getElementById('messageHistory');
        if (messageHistory) {
            messageHistory.innerHTML = this.messages.map(msg => `<p>${msg}</p>`).join('');
        }
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    updateHeight(node) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
        node.balance = this.getBalance(node); // cap nhat balance
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    async insert(value) {
        this.clearHighlights();
        this.root = await this._insert(this.root, value);
        await this.renderTree(document.getElementById('tree-container'));
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
            this.addMessage(`Thêm nút mới với giá trị ${value}`);
            return new TreeNode(value);
        }

        if (value < node.value) {
            node.left = await this._insert(node.left, value);
        } else if (value > node.value) {
            node.right = await this._insert(node.right, value);
        } else {
            this.addMessage(`Giá trị ${value} đã tồn tại trong cây`);
            return node;
        }

        this.updateHeight(node);
        const balance = this.getBalance(node);

        // lech tt pp
        if (balance > 1 && value < node.left.value) {
            this.addMessage(`Phát hiện lệch trái-trái tại nút ${node.value}. Thực hiện xoay phải tại nút ${node.value}.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();
            return this.rotateRight(node);
        }

        if (balance < -1 && value > node.right.value) {
            this.addMessage(`Phát hiện lệch phải-phải tại nút ${node.value}. Thực hiện xoay trái tại nút ${node.value}.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();
            return this.rotateLeft(node);
        }

        //tp pt
        if (balance > 1 && value > node.left.value) {
            this.addMessage(`Phát hiện lệch trái-phải tại nút ${node.value}. Thực hiện xoay kép LR.`);
            this.addMessage(`B1. Xoay trái tại nút ${node.left.value}.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            node.left = this.rotateLeft(node.left);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            this.addMessage(`B2. Xoay phải tại nút ${node.value}`);
            return this.rotateRight(node);
        }

        if (balance < -1 && value < node.right.value) {
            this.addMessage(`Phát hiện lệch phải-trái tại nút ${node.value}. Thực hiện xoay kép RL.`);
            this.addMessage(`B1. Quay phải tại nút ${node.right.value}.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            node.right = this.rotateRight(node.right);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            this.addMessage(`B2. Quay trái tại nút ${node.value}.`);
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
        await this.renderTree(document.getElementById('tree-container'));
    }

    async _delete(node, value) {
        if (!node) {
            this.addMessage(`Không tìm thấy nút ${value} để xóa`);
            return null;
        }

        if (value < node.value) {
            node.left = await this._delete(node.left, value);
        } else if (value > node.value) {
            node.right = await this._delete(node.right, value);
        } else {
            this.addMessage(`Đã tìm thấy nút ${value} để xóa`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            if (!node.left) {
                return node.right;
            } else if (!node.right) {
                return node.left;
            }

            const minNode = this.getMinNode(node.right);
            this.addMessage(`Thay thế nút ${node.value} bằng nút nhỏ nhất bên phải: ${minNode.value}`);

            node.value = minNode.value;
            node.right = await this._delete(node.right, minNode.value);
        }

        if (!node) return null;

        this.updateHeight(node);
        const balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) {
            node.isHighlighted = true;
            this.addMessage(`Phát hiện mất cân bằng sau khi xóa. Thực hiện xoay phải tại nút ${node.value}`);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();
            return this.rotateRight(node);
        }

        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.isHighlighted = true;
            this.addMessage(`Phát hiện mất cân bằng LR sau khi xóa. Thực hiện xoay kép LR tại nút ${node.value}`);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            node.left = this.rotateLeft(node.left);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            return this.rotateRight(node);
        }

        if (balance < -1 && this.getBalance(node.right) <= 0) {
            node.isHighlighted = true;
            this.addMessage(`Phát hiện mất cân bằng sau khi xóa. Thực hiện xoay trái tại nút ${node.value}`);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();
            return this.rotateLeft(node);
        }

        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.isHighlighted = true;
            this.addMessage(`Phát hiện mất cân bằng RL sau khi xóa. Thực hiện xoay kép RL tại nút ${node.value}`);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            node.right = this.rotateRight(node.right);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay();

            return this.rotateLeft(node);
        }

        return node;
    }

    getMinNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
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

    async renderTree(container) {
        if (!container) return;

        container.innerHTML = '';

        // Use a dynamic layout approach
        // 1. Calculate relative positions (centered at 0)
        // Spacing factor depends on horizontalSpacing
        this.calculateNodePositions(this.root, 0, 60);

        // 2. Find bounds to center and ensure positive coordinates
        const bounds = this.getTreeBounds(this.root);
        const padding = 50;

        // If tree is empty or just root, handle gracefully
        let shiftX = padding;
        if (bounds.minX < 0) {
            shiftX = Math.abs(bounds.minX) + padding;
        } else if (bounds.minX >= 0 && this.root) {
            shiftX = padding;

            // Optional: Center in view if tree is smaller than container
            const containerWidth = container.offsetWidth;
            const treeWidth = bounds.maxX - bounds.minX;
            if (treeWidth < containerWidth - 2 * padding) {
                shiftX = (containerWidth - treeWidth) / 2 - bounds.minX;
            }
        }

        // 3. Shift all nodes
        this.shiftTree(this.root, shiftX);

        await this.drawNodes(this.root, container);
    }

    calculateNodePositions(node, x, y) {
        if (!node) return;

        node.x = x;
        node.y = y;

        const h = node.height;
        // height 1 = leaf. height 2 = node with leaves.
        // For height h, we need optimal spacing. 
        // Heuristic: 2^(h-2) * baseSpacing
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

        // vẽ đường nối nút
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

        //ve nut
        const nodeElem = document.createElement('div');
        nodeElem.className = `node${node.isHighlighted ? ' highlight' : ''}${this.searchPath.includes(node) ? ' search-path' : ''}`;

        //tao them noi dung hien thi chieu cao
        const nodeContent = document.createElement('div');
        nodeContent.className = 'node-content';
        nodeContent.textContent = node.value;
        nodeElem.appendChild(nodeContent);

        // chỉ số h
        const heightBadge = document.createElement('div');
        heightBadge.className = 'badge height-badge';
        heightBadge.textContent = `h:${node.height}`;
        nodeElem.appendChild(heightBadge);

        // hệ số balacne
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

    //tim kiem nut
    async search(value) {
        this.clearHighlights();
        this.searchPath = [];
        const found = await this._search(this.root, value);

        await this.renderTree(document.getElementById('tree-container'));

        if (found) {
            this.addMessage(`Đã tìm thấy giá trị ${value}`);
        } else {
            this.addMessage(`Không tìm thấy giá trị ${value}`);
        }

        return found;
    }

    async _search(node, value) {
        if (!node) return false;

        this.searchPath.push(node);
        await this.renderTree(document.getElementById('tree-container'));
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

    //cac phep duyet cay
    async inOrder() {
        this.clearHighlights();
        const result = [];
        await this._inOrder(this.root, result);
        this.addMessage(`Duyệt In-order: ${result.join(' -> ')}`);
    }

    async _inOrder(node, result) {
        if (!node) return;

        await this._inOrder(node.left, result);

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree(document.getElementById('tree-container'));
        await this.delay();
        node.isHighlighted = false;

        await this._inOrder(node.right, result);
    }

    async preOrderTraversal() {
        this.clearHighlights();
        const result = [];
        await this._preOrderTraversal(this.root, result);
        this.addMessage(`Duyệt Pre-order: ${result.join(' -> ')}`);
    }

    async _preOrderTraversal(node, result) {
        if (!node) return;

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree(document.getElementById('tree-container'));
        await this.delay();
        node.isHighlighted = false;

        await this._preOrderTraversal(node.left, result);
        await this._preOrderTraversal(node.right, result);
    }

    async postOrderTraversal() {
        this.clearHighlights();
        const result = [];
        await this._postOrderTraversal(this.root, result);
        this.addMessage(`Duyệt Post-order: ${result.join(' -> ')}`);
    }

    async _postOrderTraversal(node, result) {
        if (!node) return;

        await this._postOrderTraversal(node.left, result);
        await this._postOrderTraversal(node.right, result);

        node.isHighlighted = true;
        result.push(node.value);
        await this.renderTree(document.getElementById('tree-container'));
        await this.delay();
        node.isHighlighted = false;
    }
}

const avl = new AVLTree();

async function addNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        await avl.insert(value);
        input.value = '';
    }
}

async function deleteNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        await avl.delete(value);
        input.value = '';
    }
}

async function searchNode() {
    const input = document.getElementById('nodeValue');
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        await avl.search(value);
    }
}

async function inOrder() {
    await avl.inOrder();
}

async function preOrderTraversal() {
    await avl.preOrderTraversal();
}

async function postOrderTraversal() {
    await avl.postOrderTraversal();
}

function resetTree() {
    avl.root = null;
    avl.messages = [];
    avl.addMessage('Đã xóa toàn bộ cây');
    avl.renderTree(document.getElementById('tree-container'));
}

function setAnimationSpeed(value) {
    avl.animationDelay = 3000 - value;
    document.getElementById('speedValue').textContent = `${value / 30}x`;
}

document.getElementById('nodeValue').addEventListener('keypress', async function (event) {
    if (event.key === 'Enter') {
        await addNode();
    }
});

// Drag to scroll functionality
const treeContainer = document.getElementById('tree-container');
let isDown = false;
let startX;
let scrollLeft;
let startY;
let scrollTop;

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

