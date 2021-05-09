export default (value) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^[-_]+/g, "")
    .replace(/[-_]$/g, ""); // Adapted from Django project source
