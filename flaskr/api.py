from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Gizi, Results, Models
import numpy as np
import pandas as pd

api = Blueprint("api", __name__)


@api.route("/gizi", methods=["GET", "POST", "DELETE"])
def gizi():
    if request.method == 'POST':
        gender = request.form.get("gender").lower() in [
            'true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly', 'uh-huh']
        gizi = Gizi(name=request.form.get("name"),
                    age=request.form.get("age"),
                    gender=gender,
                    born_weight=request.form.get("born_weight"),
                    born_height=request.form.get("born_height"),
                    weight=request.form.get("weight"),
                    height=request.form.get("height"),
                    status=request.form.get("status"))
        db.session.add(gizi)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": gizi.serialize()}, 200

    data = Gizi.query.all()
    dataframe = pd.DataFrame.from_records([data.serialize() for data in data])
    # return {"data": [k.serialize() for k in data]}, 200

    return {"data": dataframe.to_dict("records")}, 200

@api.route("/model", methods=["GET"])
def model():
    # if request.method == 'POST':
    #     db.session.add(gizi)
    #     db.session.commit()
    #     return {"toast": {
    #         "icon": "success",
    #         "title": "Data baru berhasil ditambahkan"
    #     }, "data": gizi.serialize()}, 200

    data = Models.query.all()
    dataframe = pd.DataFrame.from_records([data.serialize() for data in data])
    # return {"data": [k.serialize() for k in data]}, 200

    return {"data": dataframe.to_dict("records")}, 200


@api.route("/gizi/<id>", methods=["GET", "POST", "DELETE"])
def gizibyid(id):
    data = Gizi.query.get(id)
    if request.method == 'POST':
        data.name = request.form.get("name")
        data.age = request.form.get("age")
        data.gender = request.form.get("gender").lower() in [
            'true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly', 'uh-huh']
        data.born_weight = request.form.get("born_weight")
        data.born_height = request.form.get("born_height")
        data.weight = request.form.get("weight")
        data.height = request.form.get("height")
        data.status = request.form.get("status")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200
