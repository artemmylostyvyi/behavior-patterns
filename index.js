// Базовий клас для всіх вузлів
class LightNode {
    get outerHTML() { return ''; }
    get innerHTML() { return ''; }
}

class LightTextNode extends LightNode {
    constructor(text) {
        super();
        this.text = text;
    }

    get outerHTML() { return this.text; }
    get innerHTML() { return this.text; }
}

class LightElementNode extends LightNode {
    constructor(tagName, displayType, closingType, cssClasses = []) {
        super();
        this.tagName = tagName;
        this.displayType = displayType; // 'block' або 'inline'
        this.closingType = closingType; // 'single' або 'pair'
        this.cssClasses = cssClasses;
        this.children = [];
    }

    addChild(node) {
        this.children.push(node);
    }

    get innerHTML() {
        return this.children.map(child => child.outerHTML).join('');
    }

    get outerHTML() {
        const classes = this.cssClasses.length ? ` class="${this.cssClasses.join(' ')}"` : '';

        if (this.closingType === 'single') {
            return `<${this.tagName}${classes}/>`;
        }

        return `<${this.tagName}${classes}>\n  ${this.innerHTML}\n</${this.tagName}>`;
    }

    onCreated() {
        console.log(`[Hook]: Елемент <${this.tagName}> створено.`);
    }

    onTextRendered() {
        console.log(`[Hook]: Текст елемента <${this.tagName}> відрендерено.`);
    }

    // А ЦЕ САМ ШАБЛОННИЙ МЕТОД (Скелет)
    renderFull() {
        this.onCreated();
        const result = this.outerHTML;
        this.onTextRendered();

        return result;
    }

    // Ітератор
    *[Symbol.iterator]() {
        yield this;

        for (const child of this.children) {
            if (child instanceof LightElementNode) {
                yield* child;
            } else {
                yield child;
            }
        }
    }
}

// Створюємо батьківський елемент - список <ul>
const ul = new LightElementNode('ul', 'block', 'pair', ['list', 'list-dark']);

// Створюємо два елементи списку <li>
const li1 = new LightElementNode('li', 'block', 'pair');
const li2 = new LightElementNode('li', 'block', 'pair');

// Додаємо текст всередину <li>
li1.addChild(new LightTextNode('Перший пункт списку'));
li2.addChild(new LightTextNode('Другий пункт списку'));

// Додаємо <li> всередину <ul>
ul.addChild(li1);
ul.addChild(li2);

// Виводимо результати у консоль
console.log("\nШаблоний метод: згенерований HTML:");
console.log(ul.renderFull());

console.log("\nІтератор: всі вузли в дереві:");
for (const node of ul) {
    if (node instanceof LightElementNode) {
        console.log(`Знайшов тег: <${node.tagName}>`);
    } else if (node instanceof LightTextNode) {
        console.log(`Знайшов текст: "${node.text}"`);
    }
}