class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 0;
        this.y = 0;
        this.isHighlighted = false;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
        this.levelSpacing = 80;
        this.horizontalSpacing = 50;
        this.messages = [];
        this.animationDelay=2500;
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

/******  f6d93813-a81e-4196-8d19-265dbe7a3a24  *******/
    getHeight(node) {
        return node ? node.height : 0;
    }

    updateHeight(node) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    async insert(value) {
        this.root = await this._insert(this.root, value);
        await this.renderTree(document.getElementById('tree-container'));
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

        if (balance > 1 && value < node.left.value) {
            this.addMessage(`Phát hiện lệch trái-trái tại nút ${node.value}. Thực hiện xoay phải.`);
            return this.rotateRight(node);
        }

        if (balance < -1 && value > node.right.value) {
            this.addMessage(`Phát hiện lệch phải-phải tại nút ${node.value}. Thực hiện xoay trái.`);
            return this.rotateLeft(node);
        }

        if (balance > 1 && value > node.left.value) {
            this.addMessage(`Phát hiện lệch trái-phải tại nút ${node.value}. Thực hiện xoay kép LR.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay(1000);
            
            node.left = this.rotateLeft(node.left);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay(1000);
            
            return this.rotateRight(node);
        }

        if (balance < -1 && value < node.right.value) {
            this.addMessage(`Phát hiện lệch phải-trái tại nút ${node.value}. Thực hiện xoay kép RL.`);
            node.isHighlighted = true;
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay(1000);
            
            node.right = this.rotateRight(node.right);
            await this.renderTree(document.getElementById('tree-container'));
            await this.delay(1000);
            
            return this.rotateLeft(node);
        }

        return node;
    }
    async delay() {
        return new Promise(resolve => setTimeout(resolve, this.animationDelay));
    }
    async delete(value) {
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
            
            if (!node.left) {
                return node.right;
            } else if (!node.right) {
                return node.left;
            }

            const minNode = this.getMinNode(node.right);
            node.value = minNode.value;
            node.right = await this._delete(node.right, minNode.value);
        }

        if (!node) return null;

        this.updateHeight(node);

        const balance = this.getBalance(node);


        if (balance > 1 && this.getBalance(node.left) >= 0) {
            return this.rotateRight(node);
        }

        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.rotateLeft(node.left);
            return this.rotateRight(node);
        }

        if (balance < -1 && this.getBalance(node.right) <= 0) {
            return this.rotateLeft(node);
        }

        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rotateRight(node.right);
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
        await this.positionNodes(this.root, window.innerWidth / 2, 60, 200);
        await this.drawNodes(this.root, container);
    }

    async positionNodes(node, x, y, spacing) {
        if (!node) return;

        node.x = x;
        node.y = y;

        await this.positionNodes(node.left, x - spacing, y + this.levelSpacing, spacing / 2);
        await this.positionNodes(node.right, x + spacing, y + this.levelSpacing, spacing / 2);
    }

    async drawNodes(node, container) {
        if (!node) return;

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

        const nodeElem = document.createElement('div');
        nodeElem.className = `node${node.isHighlighted ? ' highlight' : ''}`;
        nodeElem.textContent = node.value;
        nodeElem.style.left = `${node.x - 25}px`;
        nodeElem.style.top = `${node.y - 25}px`;
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

function resetTree() {
    avl.root = null;
    avl.messages = [];
    avl.addMessage('Đã xóa toàn bộ cây');
    avl.renderTree(document.getElementById('tree-container'));
}

document.getElementById('nodeValue').addEventListener('keypress', async function(event) {
    if (event.key === 'Enter') {
        await addNode();
    }
});