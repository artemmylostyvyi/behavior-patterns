// Базовий клас для всіх вузлів
class LightNode {
    get outerHTML() { return ''; }
    get innerHTML() { return ''; }

    // Метод для відвідувача (Visitor Pattern)
    accept(visitor) {}
}

class LightTextNode extends LightNode {
    constructor(text) {
        super();
        this.text = text;
    }

    get outerHTML() { return this.text; }
    get innerHTML() { return this.text; }

    // Реалізація методу відвідувача
    accept(visitor) {
        visitor.visitTextNode(this);
    }
}

class LightElementNode extends LightNode {
    constructor(tagName, displayType, closingType, cssClasses = []) {
        super();
        this.tagName = tagName;
        this.displayType = displayType; // 'block' або 'inline'
        this.closingType = closingType; // 'single' або 'pair'
        this.cssClasses = cssClasses;
        this.children = [];

        this.state = new VisibleState();
    }

    addChild(node) {
        this.children.push(node);
    }

    setState(state) {
        this.state = state;
    }

    get innerHTML() {
        return this.children.map(child => child.outerHTML).join('');
    }

    // Використовуємо стан для генерації outerHTML
    get outerHTML() {
        return this.state.render(this);
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
    * [Symbol.iterator]() {
        yield this;

        for (const child of this.children) {
            if (child instanceof LightElementNode) {
                yield* child;
            } else {
                yield child;
            }
        }
    }

    accept(visitor) {
        visitor.visitElementNode(this);

        // До дітей відправляємо того ж відвідувача
        for (const child of this.children) {
            child.accept(visitor);
        }
    }
}

// Відвідувач
class TagCounterVisitor {
    constructor() {
        this.count = 0;
    }

    visitElementNode(node) {
        this.count++;
    }

    visitTextNode(node) {
        // Нічо не робимо
    }
}

// Базовий клас стану
class VisibilityState {
    render(node) {
        throw new Error("Метод render() має бути реалізований");
    }
}

// Стан 1: Видимий
class VisibleState extends VisibilityState {
    render(node) {
        const classes = node.cssClasses.length ? ` class="${node.cssClasses.join(' ')}"` : '';
        if (node.closingType === 'single') {
            return `<${node.tagName}${classes}/>`;
        }
        return `<${node.tagName}${classes}>\n  ${node.innerHTML}\n</${node.tagName}>`;
    }
}

// Стан 2: Прихований
class HiddenState extends VisibilityState {
    render(node) {
        return ``;
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
console.log("\nШаблоний метод: згенерований HTML");
console.log(ul.renderFull());

console.log("\nІтератор: всі вузли в дереві");
for (const node of ul) {
    if (node instanceof LightElementNode) {
        console.log(`Знайшов тег: <${node.tagName}>`);
    } else if (node instanceof LightTextNode) {
        console.log(`Знайшов текст: "${node.text}"`);
    }
}

console.log("\nВідвідувач: Підрахунок тегів");
const counterVisitor = new TagCounterVisitor();

ul.accept(counterVisitor);
console.log(`Кількість знайдених тегів у дереві: ${counterVisitor.count}`);


console.log("\nСтан: Приховуємо перший пункт списку");
li1.setState(new HiddenState());

console.log(ul.renderFull());
