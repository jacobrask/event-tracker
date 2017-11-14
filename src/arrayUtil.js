
const ArrayUtil = {};

ArrayUtil.removeElement = (array, from, to) => {
  const tail = array.slice((to || from) + 1 || array.length);

  array.length = from < 0 ? array.length + from : from;
  return array.push(...tail);
};

ArrayUtil.toArray = alike => {
  const arr = [];
  let i;
  const len = alike.length;

  arr.length = alike.length;

  for (i = 0; i < len; i++) {
    arr[i] = alike[i];
  }

  return arr;
};

ArrayUtil.contains = (array, el) => ArrayUtil.exists(array, e => e === el);

ArrayUtil.diff = (arr1, arr2) => {
  let i;
  let el;
  const diff = [];

  for (i = 0; i < arr1.length; i++) {
    el = arr1[i];

    if (!ArrayUtil.contains(arr2, el)) diff.push(el);
  }
  return diff;
};

ArrayUtil.exists = (array, f) => {
  for (let i = 0; i < array.length; i++) {
    if (f(array[i])) return true;
  }
  return false;
};

ArrayUtil.map = (array, f) => {
  const r = [];
  let i;

  for (i = 0; i < array.length; i++) {
    r.push(f(array[i]));
  }
  return r;
};

export default ArrayUtil;
