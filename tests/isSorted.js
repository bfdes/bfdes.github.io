export default function (arr, cmp) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (cmp(arr[i], arr[i + 1]) > 0) {
      return false;
    }
  }
  return true;
}
