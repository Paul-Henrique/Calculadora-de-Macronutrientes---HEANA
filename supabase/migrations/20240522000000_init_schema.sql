-- Create tables for DietCalc

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);

-- Foods
CREATE TABLE foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    base_qty FLOAT DEFAULT 100.0,
    base_unit VARCHAR DEFAULT 'g',
    
    -- Macros
    humidity FLOAT,
    energy_kcal FLOAT,
    energy_kj FLOAT,
    protein FLOAT,
    lipid FLOAT,
    cholesterol FLOAT,
    carbohydrate FLOAT,
    fiber FLOAT,
    ash FLOAT,
    
    -- Micros (Minerals)
    calcium FLOAT,
    magnesium FLOAT,
    manganese FLOAT,
    phosphorus FLOAT,
    iron FLOAT,
    sodium FLOAT,
    potassium FLOAT,
    copper FLOAT,
    zinc FLOAT,
    
    -- Micros (Vitamins)
    retinol FLOAT,
    re FLOAT,
    rae FLOAT,
    thiamin FLOAT,
    riboflavin FLOAT,
    pyridoxine FLOAT,
    niacin FLOAT,
    vitamin_c FLOAT
);

CREATE INDEX idx_foods_name ON foods(name);

-- Household Measures
CREATE TABLE household_measures (
    id SERIAL PRIMARY KEY,
    food_id INTEGER REFERENCES foods(id),
    unit_name VARCHAR NOT NULL,
    quantity_g FLOAT NOT NULL
);

-- Meals
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);

-- Meal Items
CREATE TABLE meal_items (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
    food_id INTEGER REFERENCES foods(id),
    quantity FLOAT NOT NULL
);

-- User Profiles
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR DEFAULT 'User',
    age INTEGER,
    weight FLOAT,
    height FLOAT,
    sex VARCHAR,
    activity_level VARCHAR,
    
    -- Goals
    goal_tmb FLOAT,
    goal_get FLOAT,
    goal_protein_g FLOAT,
    goal_carbs_g FLOAT,
    goal_fat_g FLOAT
);
