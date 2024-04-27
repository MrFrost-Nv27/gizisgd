from sqlalchemy import Column, Integer
from sqlalchemy.orm import declarative_base
from sqlalchemy_easy_softdelete.hook import IgnoredTable
from sqlalchemy_easy_softdelete.mixin import generate_soft_delete_mixin_class
from sqlalchemy.inspection import inspect
from . import db
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask import url_for
from sqlalchemy_serializer import SerializerMixin
import json
from datetime import datetime
import locale
locale.setlocale(locale.LC_TIME, "id_ID")


# Create a Class that inherits from our class builder

class SoftDeleteMixin(generate_soft_delete_mixin_class(
    # This table will be ignored by the hook
    # even if the table has the soft-delete column
    ignored_tables=[IgnoredTable(table_schema="public", name="cars"),]
)):
    # type hint for autocomplete IDE support
    deleted_at: datetime


# Apply the mixin to your Models
Base = declarative_base()


class Gizi(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "gizi"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.Boolean, nullable=False)
    born_weight = db.Column(db.Double, nullable=False)
    born_height = db.Column(db.Double, nullable=False)
    weight = db.Column(db.Double, nullable=False)
    height = db.Column(db.Double, nullable=False)
    status = db.Column(db.Text, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "born_weight": self.born_weight,
            "born_height": self.born_height,
            "weight": self.weight,
            "height": self.height,
            "status": self.status,
        }


class Models(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "models"
    id = db.Column(db.Integer, primary_key=True)
    loss = db.Column(db.Text, nullable=False)
    alpha = db.Column(db.Double, nullable=False)
    max_iter = db.Column(db.Integer, nullable=False)
    testsize = db.Column(db.Double, nullable=True, default=0)
    accuracy = db.Column(db.Double, nullable=True, default=0)
    results = db.relationship("Results", back_populates="model")

    def serialize(self):
        return {
            "id": self.id,
            "loss": self.loss,
            "alpha": self.alpha,
            "max_iter": self.max_iter,
            "testsize": self.testsize,
            "accuracy": self.accuracy,
            "results": [res.serialize() for res in self.results]
        }


class Results(db.Model, SerializerMixin, SoftDeleteMixin):
    __tablename__ = "results"
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey("models.id"))
    model = db.relationship("Models", back_populates="results")
    fold = db.Column(db.Integer, nullable=True)
    actual = db.Column(db.Text, nullable=True)
    predicted = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "model_id": self.model_id,
            "model": self.model.serialize(),
            "fold": self.fold,
            "actual": self.actual,
            "predicted": self.predicted,
        }
