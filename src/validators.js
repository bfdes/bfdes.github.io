export const isString = (maybeStr) =>
  typeof maybeStr === "string" || maybeStr instanceof String;

export class FieldValidator {
  constructor(fieldName) {
    this.fieldName = fieldName;
  }

  isValid(metadata) {
    return this.fieldName in metadata;
  }
}

export class TitleValidator extends FieldValidator {
  constructor() {
    super("title");
  }

  isValid(metadata) {
    return super.isValid(metadata) && isString(metadata[this.fieldName]);
  }
}

export class SummaryValidator extends FieldValidator {
  constructor() {
    super("summary");
  }

  isValid(metadata) {
    return super.isValid(metadata) && isString(metadata[this.fieldName]);
  }
}

export class TagValidator extends FieldValidator {
  constructor() {
    super("tags");
  }

  isValid(metadata) {
    if (super.isValid(metadata)) {
      const maybeTags = metadata[this.fieldName];
      return Array.isArray(maybeTags) && maybeTags.every(isString);
    }
    return false;
  }
}

export class TimestampValidator extends FieldValidator {
  constructor() {
    super("created");
  }

  isValid(metadata) {
    if (super.isValid(metadata)) {
      const maybeDate = metadata[this.fieldName];
      return maybeDate instanceof Date; // Good enough for use-case
    }
    return false;
  }
}
