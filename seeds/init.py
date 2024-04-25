from flask_seeder import Seeder, Faker, generator
from flaskr.models import Gizi
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd


class InitSeeder(Seeder):
    def run(self):
        gizi = pd.read_csv("dataset/gizi.csv")
        for index, row in gizi.iterrows():
            self.db.session.add(
                Gizi(name=row["name"], age=row["age"], gender=row["gender"], born_weight=row["born_weight"], born_height=row["born_height"], weight=row["weight"], height=row["height"], status=row["status"]))
