const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));
const hasProperties = require('../errors/hasProperties');

const nextId = require("../utils/nextId");


// Verifies name, description, image_url, price from req.body
function validateBody(req, res, next) {
  const { data } = req.body;
  const { data: { name, description, image_url, price } } = req.body;

  const properties = ['name', 'description', 'price', 'image_url'];

//   checks to see if any property is missing or empty
  for (property of properties) {
    if (
      !data.hasOwnProperty(property) ||
      data[property] === "" ||
      data[property] === null
    ) {
      return next({ status: 400, message: `Dish must include a ${property} property` });
    }
  }

  // check to verify price is an integer greater than 0
  if (!Number.isInteger(price) || price <= 0) {
    return next({
      status: 400,
      message: `Dish must have a price that is an integer greater than 0`,
    });
  }

  // set local variables to be used in other functions
  res.locals.name = name;
  res.locals.description = description;
  res.locals.image_url = image_url;
  res.locals.price = price;

  return next();
};

function validateDishBodyId(req, res, next) {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;

	if(!id || id === dishId || !dishId || id === '' || id === null || id === undefined) {
		return next();
	}

	next({
		status: 400,
		message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
	});
};

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find(dish => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({ status: 404, message: `Dish ID '${dishId}' cannot be found.` });
}

function matchId(req, res, next) {
  const id = req.body.data.id;
//   const dishId = res.locals.dish.id;
  const { dishId } = req.params;

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
};

// POST '/dishes' 
function create(req, res) {
  const newDish = {
    id: nextId(),
    name: res.locals.name,
    description: res.locals.description,
    price: res.locals.price,
    image_url: res.locals.image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// GET all dishes '/dishes'
function list(req, res) {
    res.json({ data: dishes });
};

// GET '/dishes/:dishId'
function read(req, res) {
    const { dishId } = req.params;
    
    res.json({ data: res.locals.dish });
    
};
  
// PUT '/dishes/:dishId'
function update(req, res) {
  
    const updateDish = {
      id: req.params.dishId,
      name: req.body.data.name,
      description: req.body.data.description,
      price: req.body.data.price,
      image_url: req.body.data.image_url,
  };
  
  res.json({ data: updateDish }); 
};

module.exports = {
    read: [dishExists, read],
    list,
    create: [validateBody, create],
    update: [dishExists, matchId, validateDishBodyId, validateBody, update],
    // CANNOT DELETE - DO NOT USE DELETE METHOD!!!
};