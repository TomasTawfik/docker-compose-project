BEGIN;

UPDATE products
SET image = '/images/burger.jpg'
WHERE name = 'Classic Burger';

UPDATE products
SET image = '/images/pizza.jpg'
WHERE name = 'Italian Pizza';

UPDATE products
SET image = '/images/chicken.jpg'
WHERE name = 'Crispy Chicken';

UPDATE products
SET image = '/images/sandwich.jpg'
WHERE name = 'Chicken Sandwich';

COMMIT;