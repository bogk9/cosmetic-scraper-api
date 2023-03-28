import json
import psycopg2
from config import DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD


# Open the JSON file
with open('data.json') as f:
    data = json.load(f)

# Connect to the Postgres database
conn = psycopg2.connect(
    host=DATABASE_HOST,
    database=DATABASE_NAME,
    user=DATABASE_USER,
    password=DATABASE_PASSWORD,
    port=DATABASE_PORT
)

cur = conn.cursor()


# Create categories table
cur.execute('''CREATE TABLE categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE
            );''')
conn.commit()

# Create ingredients table
cur.execute('''CREATE TABLE ingredients (
                id SERIAL PRIMARY KEY,
                href VARCHAR(200),
                text VARCHAR(100),
                score VARCHAR(10),
                description VARCHAR(1000)
                );''')
conn.commit()

# Create ingredient_categories table
cur.execute('''CREATE TABLE ingredient_categories (
                ingredient_id INTEGER REFERENCES ingredients(id),
                category_id INTEGER REFERENCES categories(id),
                PRIMARY KEY (ingredient_id, category_id)
            );''')
conn.commit()



# Insert categories into categories table
categories_set = set()
for ingredient in data.values():
    for category in ingredient['categories'].values():
        categories_set.add(category)
for category_name in categories_set:
    cur.execute("INSERT INTO categories (name) VALUES (%s)", (category_name,))
conn.commit()
print('FINISHED 1ST STAGE')


# Insert ingredients into ingredients table and connect with categories in ingredient_categories table
for ingredient in data.values():
    cur.execute("INSERT INTO ingredients (href, text, score, description) VALUES (%s, %s, %s, %s) RETURNING id", (ingredient['href'], ingredient['text'], ingredient['score'], ingredient.get('desc')))
    ingredient_id = cur.fetchone()[0]
    print('added ingredient', ingredient['text'])
    for category in ingredient['categories'].values():
        cur.execute("SELECT id FROM categories WHERE name = %s", (category,))
        category_id = cur.fetchone()[0]
        cur.execute("INSERT INTO ingredient_categories (ingredient_id, category_id) VALUES (%s, %s)", (ingredient_id, category_id))
conn.commit()

# Close database connection
cur.close()
conn.close()