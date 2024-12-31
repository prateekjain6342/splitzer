import duckdb
import pandas as pd

class DuckConnector:

    def __init__(self, db_file):
        self.connection = duckdb.connect(db_file)

    def duck_execute(self, query):
        self.connection.execute(query)

    def duck_register(self, table_name, df: pd.DataFrame):
        self.connection.register(table_name, df)
    
    def duck_sql(self, query, show_output: bool = True):
        if show_output:
            self.connection.sql(query).show()
        else:
            self.connection.sql(query)

    def duck_sql_fetchdf(self, query) -> pd.DataFrame:
        return self.connection.sql(query).fetchdf()
    
    def close_connection(self):
        self.connection.close()