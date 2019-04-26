const isPromise = obj => {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
};

/**
 * Try / Catch function or promise.
 * @param {*} fn - function or promise
 * @returns {Object} object with error and result properties
 */
const tryCatch = fn => {
  if (typeof fn !== 'function' && !isPromise(fn)) {
    throw new Error('Argument must be a function or Promise');
  }

  const saveFn = fn => {
    try {
      return { result: fn() };
    } catch (err) {
      return { error: err };
    }
  };

  const successFn = value => ({ result: value });
  const errorFn = err => ({ error: err });

  return isPromise(fn) ? fn.then(successFn, errorFn) : saveFn(fn);
};


const getMonths = () => {
  return [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
};

const getDays = () => {
  return ([...Array(31).keys()].map(day => {
    let item = day + 1;
    item = item >= 10 ? item : `0${item}`;
    return item;
  }));
};

const getYears = () => {
  return ([...Array(100).keys()].reverse().map(year => {
    let item = year + 1920;
    return item;
  }));
};

export { isPromise, tryCatch, getMonths, getDays, getYears };