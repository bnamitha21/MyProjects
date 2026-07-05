import mysql.connector
from mysql.connector import Error
from config import Config

def get_db_connection():
    """
    Establish a connection to the MySQL database.
    Always ensure the connection is closed after use in blueprints.
    """
    try:
        connection = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
            charset='utf8mb4',
            collation='utf8mb4_general_ci'
        )
        return connection
    except Error as e:
        print(f"Database connection error: {e}")
        raise e

def query_db(query, args=(), one=False, commit=False):
    """
    Helper function to query the database.
    Args:
        query (str): SQL query text.
        args (tuple): Query arguments/parameters.
        one (bool): If True, returns only the first row.
        commit (bool): If True, commits the transaction (use for INSERT, UPDATE, DELETE).
    Returns:
        list of dicts, a single dict, lastrowid, or None depending on the query type.
    """
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    result = None
    try:
        cursor.execute(query, args)
        if commit:
            connection.commit()
            result = cursor.lastrowid
        else:
            rows = cursor.fetchall()
            result = rows[0] if one and rows else (rows if not one else None)
    except Error as e:
        print(f"Database query error: {e}")
        connection.rollback()
        raise e
    finally:
        cursor.close()
        connection.close()
    return result
