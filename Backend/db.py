import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "finlit.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create Users
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                balance REAL DEFAULT 100000.0,
                is_ca_subscribed BOOLEAN DEFAULT 0
            )
        ''')
        
        # Create Holdings
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS holdings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                symbol TEXT,
                quantity INTEGER,
                average_price REAL,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        # Create Transactions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                symbol TEXT,
                transaction_type TEXT,
                quantity INTEGER,
                price REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        # Create dummy user if not exists
        cursor.execute('SELECT count(*) FROM users')
        if cursor.fetchone()[0] == 0:
            cursor.execute('INSERT INTO users (username, balance) VALUES (?, ?)', ('player1', 100000.0))
            
        conn.commit()

init_db()
