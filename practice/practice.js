// const Tour = require("./../models/tourModel");

// // // reading File and parsing it to the JS object
// // const tours = JSON.parse(
// //   // array storing the data
// //   fs.readFileSync(
// //     `${__dirname}/../dev-data/data/tours-simple.json`
// //   )
// // );

// // checking if the id is valid before hitting the handler(return statement is mandetory)
// // exports.checkId = (req, res, next, val) => {
// //   console.log(`The id is : ${val}`);
// //   // if (req.params.id * 1 > tours.length) {
// //   //   return res.json({
// //   //     Status: "fail",
// //   //     message: "Invalid Id",
// //   //   });
// //   // }
// //   next();
// // };

// /////////////////////////// Route Handler(functions)/////////////////////////////////////
// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);
//   // res.status(200).json({
//   //   Status: "Success",
//   //   requestedAT: req.requestTime,
//   //   results: tours.length, // since tours is an array
//   //   data: {
//   //     tour: tours,
//   //   },
//   // });
// };

// exports.getTour = (req, res) => {
//   // console.log(req.params); // this will assign the given value to the parameter that is present in the URL for eg: tours/5 -- { id: '5' }
//   // const id = req.params.id * 1; // converting the string into a number
//   // looping on the array and storing the data of the element into an array(tour) that matches with the given parameter
//   // const tour = tours.find((el) => el.id === id);
//   // for invalid ID
//   // res.status(200).json({
//   //   Status: "Success",
//   //   data: {
//   //     tour,
//   //   },
//   // });
// };

// exports.createTour = (req, res) => {
//   // creating new Id
//   // const newId = tours[tours.length - 1].id + 1;

//   // // Merging the objects using Object.assign()
//   // const newTour = Object.assign(
//   //   { id: newId },
//   //   req.body
//   // );

//   // // pushing the changes
//   // tours.push(newTour);

//   // // Overwriting the file
//   // fs.writeFile(
//   //   `${__dirname}/dev-data/data/tours-simple.json`,
//   //   JSON.stringify(tours),
//   //   (err) => {
//   //
//   //   }
//   // );

//   res.status(201).json({
//     status: "success",
//     // data: {
//     //   tour: newTour,
//     // },
//   });
// };

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     Status: "Success",
//     data: {
//       tour: "<Updated Tour...>",
//     },
//   });
// };

// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     Status: "Success",
//     data: null, //(data is set to null for deletion)
//   });
// };
