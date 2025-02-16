        // JavaScript code remains the same as in your original file
        class TreeNode {
            constructor(value) {
                this.value = value;
                this.left = null;
                this.right = null;
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
            }

            insert(root, value) {
                if (!root) return new TreeNode(value);

                if (value < root.value) {
                    root.left = this.insert(root.left, value);
                } else if (value > root.value) {
                    root.right = this.insert(root.right, value);
                } else {
                    return root;
                }

                return this.balance(root);
            }

            delete(root, value) {
                if (!root) return null;

                if (value < root.value) {
                    root.left = this.delete(root.left, value);
                } else if (value > root.value) {
                    root.right = this.delete(root.right, value);
                } else {
                    if (!root.left) return root.right;
                    if (!root.right) return root.left;

                    let minNode = this.getMinNode(root.right);
                    root.value = minNode.value;
                    root.right = this.delete(root.right, minNode.value);
                }

                return this.balance(root);
            }

            balance(node) {
                let balance = this.getBalance(node);

                if (balance > 1) {
                    if (this.getBalance(node.left) < 0) {
                        node.left = this.rotateLeft(node.left);
                    }
                    return this.rotateRight(node);
                }

                if (balance < -1) {
                    if (this.getBalance(node.right) > 0) {
                        node.right = this.rotateRight(node.right);
                    }
                    return this.rotateLeft(node);
                }

                return node;
            }

            rotateLeft(node) {
                let newRoot = node.right;
                node.right = newRoot.left;
                newRoot.left = node;
                return newRoot;
            }

            rotateRight(node) {
                let newRoot = node.left;
                node.left = newRoot.right;
                newRoot.right = node;
                return newRoot;
            }

            getBalance(node) {
                return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
            }

            getHeight(node) {
                if (!node) return 0;
                return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
            }

            getMinNode(node) {
                while (node.left) node = node.left;
                return node;
            }

            searchAndHighlight(root, value) {
                if (!root) return false;

                root.isHighlighted = false;
                if (value === root.value) {
                    root.isHighlighted = true;
                    return true;
                }

                return this.searchAndHighlight(root.left, value) || 
                       this.searchAndHighlight(root.right, value);
            }

            renderTree(container) {
                container.innerHTML = "";
                this.positionNodes(this.root, window.innerWidth / 2, 60, 200);
                this.drawNodes(this.root, container);
            }

            positionNodes(node, x, y, spacing) {
                if (!node) return;

                node.x = x;
                node.y = y;

                this.positionNodes(node.left, x - spacing, y + this.levelSpacing, spacing / 2);
                this.positionNodes(node.right, x + spacing, y + this.levelSpacing, spacing / 2);
            }

            drawNodes(node, container) {
                if (!node) return;

                if (node.left) this.drawBranch(node, node.left, container);
                if (node.right) this.drawBranch(node, node.right, container);

                let nodeElem = document.createElement("div");
                nodeElem.className = "node";
                nodeElem.textContent = node.value;
                nodeElem.style.left = `${node.x - 25}px`;
                nodeElem.style.top = `${node.y - 25}px`;

                if (node.isHighlighted) {
                    nodeElem.classList.add("highlight");
                }

                container.appendChild(nodeElem);

                this.drawNodes(node.left, container);
                this.drawNodes(node.right, container);
            }

            drawBranch(parent, child, container) {
                let branch = document.createElement("div");
                branch.className = "branch";

                let dx = child.x - parent.x;
                let dy = child.y - parent.y;
                let length = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);

                branch.style.width = `${length}px`;
                branch.style.left = `${parent.x}px`;
                branch.style.top = `${parent.y}px`;
                branch.style.transform = `rotate(${angle}deg)`;

                container.appendChild(branch);
            }
        }

        const avl = new AVLTree();
        const treeContainer = document.getElementById("tree-container");

        function addNode() {
            const value = parseInt(document.getElementById("nodeValue").value);
            if (!isNaN(value)) {
                avl.root = avl.insert(avl.root, value);
                avl.renderTree(treeContainer);
                document.getElementById("nodeValue").value = "";
            }
        }

        function deleteNode() {
            const value = parseInt(document.getElementById("nodeValue").value);
            if (!isNaN(value)) {
                avl.root = avl.delete(avl.root, value);
                avl.renderTree(treeContainer);
                document.getElementById("nodeValue").value = "";
            }
        }

        function searchNode() {
            const value = parseInt(document.getElementById("searchValue").value);
            if (!isNaN(value)) {
                const found = avl.searchAndHighlight(avl.root, value);
                if (found) {
                    avl.renderTree(treeContainer);
                } else {
                    alert(`Node with value ${value} not found.`);
                }
                document.getElementById("searchValue").value = "";
            }
        }