// function to catch async error( to avoid try catch block)
// eslint-disable-next-line arrow-body-style
module.exports = (fn) => {
  // this catchAsync will recieve a fn()
  return (req, res, next) => {
    // since the fn is an async func so if there is an error it should be catched here and the next will pass it to the global Error ...
    fn(req, res, next).catch(next);
  };
};
