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
        messageHistory.innerHTML = this.messages.map(msg => `<p>${msg}</p>`).join('');
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    updateHeight(node) {
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    async insert(root, value) {
        if (!root) {
            this.addMessage(`Thêm nút mới với giá trị ${value}`);
            return new TreeNode(value);
        }

        if (value < root.value) {
            root.left = await this.insert(root.left, value);
        } else if (value > root.value) {
            root.right = await this.insert(root.right, value);
        } else {
            this.addMessage(`Giá trị ${value} đã tồn tại trong cây`);
            return root;
        }

        this.updateHeight(root);
        let balance = this.getBalance(root);

        // Kiểm tra và cân bằng cây
        if (balance > 1) {
            if (value < root.left.value) {
                this.addMessage(`Phát hiện lệch trái-trái tại nút ${root.value}. Thực hiện xoay phải.`);
                return this.rotateRight(root);
            }
            if (value > root.left.value) {
                this.addMessage(`Phát hiện lệch trái-phải tại nút ${root.value}. Thực hiện xoay kép LR.`);
                root.left = this.rotateLeft(root.left);
                return this.rotateRight(root);
            }
        }

        if (balance < -1) {
            if (value > root.right.value) {
                this.addMessage(`Phát hiện lệch phải-phải tại nút ${root.value}. Thực hiện xoay trái.`);
                return this.rotateLeft(root);
            }
            if (value < root.right.value) {
                this.addMessage(`Phát hiện lệch phải-trái tại nút ${root.value}. Thực hiện xoay kép RL.`);
                root.right = this.rotateRight(root.right);
                return this.rotateLeft(root);
            }
        }

        return root;
    }

    rotateRight(y) {
        let x = y.left;
        let T2 = x.right;

        x.right = y;
        y.left = T2;

        this.updateHeight(y);
        this.updateHeight(x);

        return x;
    }

    rotateLeft(x) {
        let y = x.right;
        let T2 = y.left;

        y.left = x;
        x.right = T2;

        this.updateHeight(x);
        this.updateHeight(y);

        return y;
    }

    delete(root, value) {
        if (!root) {
            this.addMessage(`Không tìm thấy nút ${value} để xóa`);
            return null;
        }

        if (value < root.value) {
            root.left = this.delete(root.left, value);
        } else if (value > root.value) {
            root.right = this.delete(root.right, value);
        } else {
            this.addMessage(`Đã xóa nút ${value}`);
            if (!root.left || !root.right) {
                let temp = root.left ? root.left : root.right;
                if (!temp) {
                    return null;
                }
                root = temp;
            } else {
                let temp = this.getMinNode(root.right);
                root.value = temp.value;
                root.right = this.delete(root.right, temp.value);
            }
        }

        if (!root) return null;

        this.updateHeight(root);
        let balance = this.getBalance(root);

        if (balance > 1) {
            if (this.getBalance(root.left) >= 0) {
                this.addMessage(`Cân bằng lại sau khi xóa: Xoay phải tại ${root.value}`);
                return this.rotateRight(root);
            }
            this.addMessage(`Cân bằng lại sau khi xóa: Xoay kép LR tại ${root.value}`);
            root.left = this.rotateLeft(root.left);
            return this.rotateRight(root);
        }

        if (balance < -1) {
            if (this.getBalance(root.right) <= 0) {
                this.addMessage(`Cân bằng lại sau khi xóa: Xoay trái tại ${root.value}`);
                return this.rotateLeft(root);
            }
            this.addMessage(`Cân bằng lại sau khi xóa: Xoay kép RL tại ${root.value}`);
            root.right = this.rotateRight(root.right);
            return this.rotateLeft(root);
        }

        return root;
    }

    getMinNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }

    searchAndHighlight(root, value) {
        if (!root) return false;

        root.isHighlighted = false;
        if (value === root.value) {
            root.isHighlighted = true;
            this.addMessage(`Tìm thấy nút ${value}`);
            return true;
        }

        return this.searchAndHighlight(root.left, value) || 
               this.searchAndHighlight(root.right, value);
    }

    async renderTree(container) {
        container.innerHTML = "";
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
            const branch = document.createElement("div");
            branch.className = "branch appearing";
            branch.style.width = "0";
            this.drawBranch(node, node.left, branch);
            container.appendChild(branch);
        }

        if (node.right) {
            const branch = document.createElement("div");
            branch.className = "branch appearing";
            branch.style.width = "0";
            this.drawBranch(node, node.right, branch);
            container.appendChild(branch);
        }

        const nodeElem = document.createElement("div");
        nodeElem.className = "node" + (node.isHighlighted ? " highlight" : "");
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
const treeContainer = document.getElementById("tree-container");

async function addNode() {
    const value = parseInt(document.getElementById("nodeValue").value);
    if (!isNaN(value)) {
        avl.root = await avl.insert(avl.root, value);
        await avl.renderTree(treeContainer);
        document.getElementById("nodeValue").value = "";
    }
}

async function deleteNode() {
    const value = parseInt(document.getElementById("nodeValue").value);
    if (!isNaN(value)) {
        avl.root = avl.delete(avl.root, value);
        await avl.renderTree(treeContainer);
        document.getElementById("nodeValue").value = "";
    }
}

function searchNode() {
    const value = parseInt(document.getElementById("searchValue").value);
    if (!isNaN(value)) {
        const found = avl.searchAndHighlight(avl.root, value);
        avl.renderTree(treeContainer);
        if (!found) {
            avl.addMessage(`Không tìm thấy nút ${value}`);
        }
        document.getElementById("searchValue").value = "";
    }
}


function resetTree() {
    avl.root = null;
    avl.messages = [];
    avl.addMessage("Đã xóa toàn bộ cây");
    avl.renderTree(treeContainer);
}

// Thêm sự kiện nhấn Enter cho input
document.getElementById("nodeValue").addEventListener("keypress", async function(event) {
    if (event.key === "Enter") {
        await addNode();
    }
});

document.getElementById("searchValue").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchNode();
    }
});

window.onload = function() {
    avl.addMessage("Chào mừng đến với ứng dụng Mô phỏng Cây AVL!");
    avl.addMessage("- Thêm nút mới bằng cách nhập số và nhấn 'Thêm'");
    avl.addMessage("- Xóa nút bằng cách nhập số và nhấn 'Xóa'");
    avl.addMessage("- Tìm kiếm nút bằng cách nhập số và nhấn 'Tìm'");
    avl.addMessage("- Xóa toàn bộ cây bằng nút 'Đặt lại'");
    avl.addMessage("Bạn có thể:");
};