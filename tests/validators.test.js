import {
  FieldValidator,
  TagValidator,
  TimestampValidator,
  TitleValidator,
} from "src/validators";

describe("FieldValidator", () => {
  const validator = new FieldValidator("fieldName");

  it("detects field", () => {
    const metadata = { fieldName: "" };
    expect(validator.isValid(metadata)).toBeTruthy();
  });

  it("detects missing field", () => {
    expect(validator.isValid({})).toBeFalsy();
  });
});

describe("TitleValidator", () => {
  const validator = new TitleValidator();

  it("detects string title", () => {
    const metadata = { title: "Complex numbers" };
    expect(validator.isValid(metadata)).toBeTruthy();
  });

  it("detects malformed title", () => {
    const metadata = { title: null };
    expect(validator.isValid(metadata)).toBeFalsy();
  });
});

describe("TagValidator", () => {
  const validator = new TagValidator();

  it("detects string array", () => {
    const metadata = { tags: ["Python", "Maths"] };
    expect(validator.isValid(metadata)).toBeTruthy();
  });

  it("detects malformed tags", () => {
    const metadata = { tags: [1, 2] };
    expect(validator.isValid(metadata)).toBeFalsy();
  });
});

describe("TimestampValidator", () => {
  const validator = new TimestampValidator();

  it("detects timestamp", () => {
    const metadata = { created: new Date() };
    expect(validator.isValid(metadata)).toBeTruthy();
  });

  it("detects malformed timestamp", () => {
    const metadata = { created: "" };
    expect(validator.isValid(metadata)).toBeFalsy();
  });
});
