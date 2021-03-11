export class Attributes extends Map {
  toString() {
    return Array.from(this.entries())
      .map(([key, value]) => `${key}="${value}" `)
      .join("")
      .trim();
  }

  static empty() {
    return new Attributes();
  }
}

export class Leaf {
  constructor(name, content, attributes = Attributes.empty()) {
    this.name = name;
    this.content = content;
    this.attributes = attributes;
  }
  toString() {
    const { name, content, attributes } = this;
    if (content && attributes.size) {
      return `<${name} ${attributes}>${content}</${name}>`;
    }
    if (content) {
      return `<${name}>${content}</${name}>`;
    }
    if (attributes.size) {
      return `<${name} ${attributes} />`;
    }
    return `<${name} />`;
  }
}

export class Branch {
  constructor(name, children, attributes = Attributes.empty()) {
    this.name = name;
    this.children = children;
    this.attributes = attributes;
  }
  toString() {
    const { name, attributes, children } = this;
    const content = children.join("");
    const openingTag = attributes.size
      ? `<${name} ${attributes}>`
      : `<${name}>`; // Handle whitespace
    const closingTag = `</${name}>`;
    return `${openingTag}${content}${closingTag}`;
  }
}

export function node(name, content, attributes = Attributes.empty()) {
  if (Array.isArray(content)) {
    return new Branch(name, content, attributes);
  }
  return new Leaf(name, content, attributes);
}
