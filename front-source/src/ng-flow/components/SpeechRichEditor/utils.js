/**
 * 元素周围包裹0宽字符
 * @param node
 */
export function warpZwnj(node) {
    const beforeContextNode = document.createTextNode("\u200c");
    const afterContextNode = document.createTextNode("\u200c");
    const parent = node.parentNode;
    parent.insertBefore(beforeContextNode, node);
    parent.insertBefore(afterContextNode, node.nextSibling);
}

/**
 * 把光标移至最后
 * @param obj
 */
export function keepLastIndex(obj) {
    if (window.getSelection) {
        obj.focus();
        const range = window.getSelection();
        range.selectAllChildren(obj);
        range.collapseToEnd();
    }
    else if (document.selection) {
        const range = document.selection.createRange();
        range.moveToElementText(obj);
        range.collapse(false);
        range.select();
    }
}

/**
 * 重排元素与零宽元素
 * @param parent
 */
export function redrawZwnj(parent) {
    if (!parent) return;
    Array.from(parent.childNodes).forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
            parent.removeChild(node);
        }
    });

    Array.from(parent.childNodes).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            warpZwnj(node);
        }
    });
}

/**
 * 禁止回车和空格，否则将其过滤
 * @param node
 */
export function filterDomSpaceWrap(node) {
    if (node.childNodes && node.childNodes.length > 0) {
        node.childNodes.forEach(node => {
            const classList = node.classList;
            if (!classList || !classList.contains("rich-tag-component")) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const reg = /\s+/g;
                    if (reg.test(node.textContent)) {
                        node.textContent = node.textContent.replace(/\s+/g, '');
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    node.parentNode.removeChild(node);
                }
            }
        });
    }
}

/**
 * 黏贴板黏入转换成纯文字
 * @param e
 */
export function pastedJustAllowText(e) {
    e.preventDefault();
    let text = null;
    if(window.clipboardData && clipboardData.setData) {
        text = window.clipboardData.getData('text'); // IE
    } else {
        text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
    }

    if (document.body.createTextRange) {
        let textRange;
        if (document.selection) {
            textRange = document.selection.createRange();
        } else if (window.getSelection) {
            const sel = window.getSelection();
            const range = sel.getRangeAt(0);
            // 创建临时元素，使得TextRange可以移动到正确的位置
            const tempEl = document.createElement("span");
            tempEl.innerHTML = "&#FEFF;";
            range.deleteContents();
            range.insertNode(tempEl);
            textRange = document.body.createTextRange();
            textRange.moveToElementText(tempEl);
            tempEl.parentNode.removeChild(tempEl);
        }

        textRange.text = text.replace(/[\r\n]/g, '');
        textRange.collapse(false);
        textRange.select();
    } else {
        // Chrome之类浏览器
        document.execCommand("insertText", false, text.replace(/[\r\n]/g, ''));
    }
}
