from api.connectors.duck import DuckConnector
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
import os
import pandas as pd
import duckdb
import ast

class CreateBill(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def get(self, request):
        action = request.GET.get('action')

        if action == 'create_bill':
            return self._get_new_uuid(request)
        elif action == 'get_people':
            return self._get_people(request)
        elif action == 'get_expenses':
            return self._get_expenses(request)
        else:
            return Response({"status": "400", "message": "Invalid Action"}, status=400)
    
    def _get_new_uuid(self, request):
        unique_uuid = uuid.uuid4()
        directory = f"./data/{unique_uuid}/"
        os.makedirs(directory, exist_ok=True)

        duck_conn = DuckConnector(f"{directory}/bill.db")
        duck_conn.duck_execute("""CREATE SCHEMA IF NOT EXISTS split;""")
        duck_conn.duck_execute("""
                               CREATE TABLE split.people (id INTEGER PRIMARY KEY, name VARCHAR UNIQUE);
                               CREATE SEQUENCE seq_people_id START 1;
                               """)
        duck_conn.duck_execute("""
                               CREATE TABLE split.expenses (id INTEGER PRIMARY KEY, expense_name VARCHAR, paid_by_people_id INTEGER, FOREIGN KEY (paid_by_people_id) REFERENCES split.people(id), expense_amount DOUBLE, expense_division MAP(INTEGER, INTEGER));
                               CREATE SEQUENCE seq_expense_id START 1;
                               """)
        duck_conn.close_connection()

        return Response({"status": 200, "uuid": unique_uuid})
    
    def _get_people(self, request):
        uuid = request.GET.get('uuid')
        directory = f"./data/{uuid}/"
        
        duck_conn = DuckConnector(f'{directory}/bill.db')
        people = duck_conn.duck_sql_fetchdf(
            """
            FROM split.people;
            """
        )
        duck_conn.close_connection()


        return Response(people.to_dict('records'))

    def _get_expenses(self, request):
        uuid = request.GET.get('uuid')
        directory = f"./data/{uuid}/"
        
        duck_conn = DuckConnector(f'{directory}/bill.db')
        expenses = duck_conn.duck_sql_fetchdf(
            """
            FROM split.expenses;
            """
        )
        duck_conn.close_connection()

        return Response(expenses.to_dict('records'))

    def post(self, request):
        action = request.data.get('action')

        if action == 'add_people':
            return self._post_add_people(request)
        elif action == 'add_expense':
            return self._post_add_expense(request)
        elif action == 'calculate_split':
            return self._post_calculate_split(request)
        elif action == 'update_expense':
            return self._update_expense(request)
        elif action == 'delete_expense':
            return self._delete_expense(request)
        else:
            return Response({"status": "400", "message": "Invalid Action"}, status=400)

    def _post_add_people(self, request):

        try:
            name = request.data.get('name')
            directory = f"./data/{request.data.get('uuid')}"
            
            duck_conn = DuckConnector(f"{directory}/bill.db")
            duck_conn.duck_sql(
                f"""
                INSERT into split.people
                VALUES (nextval('seq_people_id'), '{name}')
                """,
                False
            )
            duck_conn.duck_sql("SELECT * FROM split.people")
            duck_conn.close_connection()

            return Response({"status": "201", "data": request.data}, status=201)

        except duckdb.ConstraintException:
            return Response({"status": "400", "message": "Name already exists in your group"}, status=400)
        
    def _post_add_expense(self, request):
        expense_name = request.data.get('expense_name')
        expense_amount = request.data.get('expense_amount')
        paid_by_people_id = request.data.get('paid_by')
        uuid = request.data.get('uuid')
        expense_division = request.data.get('expense_division')
        
        directory = f"./data/{uuid}"
        duck_conn = DuckConnector(f"{directory}/bill.db")
        duck_conn.duck_sql(f"""
                            INSERT into split.expenses
                           VALUES(nextval('seq_expense_id'), '{expense_name}', {paid_by_people_id}, {expense_amount}, MAP {expense_division});
                           """,
                           False
        )
        res = duck_conn.duck_sql_fetchdf("SELECT * FROM split.expenses ORDER BY id desc LIMIT 1")
        duck_conn.close_connection()

        return Response({"status": "201", "data": res.to_dict('records')}, status=201)

    def _update_expense(self, request):
        self._delete_expense(request)

        return self._post_add_expense(request)
    
    def _delete_expense(self, request):
        old_expense_id = request.data.get('old_expense_id')
        uuid = request.data.get('uuid')
        directory = f"./data/{uuid}"
        duck_conn = DuckConnector(f"{directory}/bill.db")
        duck_conn.duck_sql(f"""
        DELETE FROM split.expenses WHERE id = {old_expense_id};
        """, False)
        duck_conn.close_connection()

        return Response({"status": 200, "message": "deleted"})

    def _post_calculate_split(self, request):
        uuid = request.data.get('uuid')
        directory = f"./data/{uuid}"
        duck_conn = DuckConnector(f"{directory}/bill.db")

        expenses = duck_conn.duck_sql_fetchdf("""
                                    SELECT *,ROUND(expense_amount / list_reduce(map_values(expense_division), (x,y) -> x+y), 2) as per_share_expense, FROM split.expenses;
                                   """)
        people = duck_conn.duck_sql_fetchdf("""
                                            SELECT *
                                            FROM split.people;
                                            """)
        
        expense_per_person = list()
        for _, r in expenses.iterrows():
            for key,value in r['expense_division'].items():
                expense_per_person += [{
                    "expense_id": r['id'],
                    "expense_person": key,
                    "expense": r['per_share_expense'] * value
                }]

        expense_per_person = pd.json_normalize(expense_per_person)
        print(expense_per_person)

        duck_conn.duck_register("expense_per_person", expense_per_person)
        
        expense_per_person = duck_conn.duck_sql_fetchdf("""
                                   SELECT p.name as person_name, ep.expense_person, SUM(expense) as owe_amount
                                    FROM expense_per_person ep
                                    LEFT JOIN split.people p on p.id = ep.expense_person
                                    GROUP BY 1,2
                                    ORDER BY 3 desc;
                                   """)

        print(expense_per_person)
        duck_conn.duck_register("expense_per_person", expense_per_person)

        givers = duck_conn.duck_sql_fetchdf("""
                                            SELECT
                                            p.name as giver_name,
                                            p.id as giver_id,
                                            SUM(expense_amount) as given_amount
                                            FROM split.people p
                                            LEFT JOIN split.expenses e on e.paid_by_people_id = p.id
                                            GROUP BY 1,2
                                            ORDER BY 3 desc;
                                            """)
                                            
        givers.fillna(0, inplace=True)
        givers['giver_id'] = givers['giver_id'].astype(int)
        print(givers)
        duck_conn.duck_register("givers", givers)

        net_balance = duck_conn.duck_sql_fetchdf("""
        SELECT
        p.id,
        p.name,
        ROUND(g.given_amount - ep.owe_amount, 2) as net_amount
        FROM split.people p
        LEFT JOIN expense_per_person ep on ep.expense_person = p.id
        LEFT JOIN givers g on g.giver_id = p.id
        """)
        print(net_balance)
        net_balance = net_balance.to_dict('records')

        debtors = list()
        creditors = list()

        for i in net_balance:
            if i['net_amount'] < 0:
                i['net_amount'] = abs(i['net_amount'])
                debtors += [i]
            elif i['net_amount'] > 0:
                creditors += [i]

        result = list()
        d = 0
        c = 0

        debtors = sorted(debtors, key=lambda x: x["net_amount"], reverse=True)
        creditors = sorted(creditors, key=lambda x: x["net_amount"], reverse=True)

        while d < len(debtors) and c < len(creditors):
            debtor = debtors[d]
            creditor = creditors[c]

            settle_amount = min(debtor['net_amount'], creditor['net_amount'])

            result += [{
                'debtor_name': debtor['name'],
                'creditor_name': creditor['name'],
                'settle_amount': round(settle_amount, 1)
            }]

            debtors[d]['net_amount'] -= settle_amount
            creditors[c]['net_amount'] -= settle_amount

            if debtors[d]['net_amount'] == 0:
                d += 1
            
            if creditors[c]['net_amount'] == 0:
                c += 1

        duck_conn.close_connection()

        return Response({"status": "200", "data": result})