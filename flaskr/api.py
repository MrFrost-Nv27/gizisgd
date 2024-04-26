from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Gizi
import numpy as np
import pandas as pd

api = Blueprint("api", __name__)

@api.route("/gizi", methods=["GET", "POST"])
def gizi():
    if request.method == 'POST':
        gizi = Gizi(name=request.form.get("name"),
                              age=request.form.get("age"),
                              gender=request.form.get("gender"),
                              born_weight=request.form.get("born_weight"),
                              born_height=request.form.get("born_height"),
                              weight=request.form.get("weight"),
                              height=request.form.get("height"),
                              gizi=request.form.get("gizi"))
        db.session.add(gizi)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": Gizi.serialize()}, 200
    
    data = Gizi.query.all()
    dataframe = pd.DataFrame.from_records([data.serialize() for data in data])
    # return {"data": [k.serialize() for k in data]}, 200

    return {"data": dataframe.to_dict("records")}, 200

# @api.route("/implementasi", methods=["POST"])
# def implementasi():
#     req = request.get_json()
#     aco = AntColonyOptimization(
#         routes_matrix=np.array(req.get("matrix")), ants=req.get("ants"), iteration=req.get("iteration"), evaporation_rate=req.get(
#             "evaporation"), alpha=req.get("alpha"), beta=req.get("beta"),
#     )
#     aco.run()
#     return {"routes": (aco.routes-1).tolist(), "distances": aco.distances.tolist(), "best_route": (aco.best_route - 1).tolist(), "best_distance": aco.best_distance, "distance_matrix": aco.distance_matrix.tolist(), "best_distance_matrix": aco.best_distance_matrix.tolist()}, 200
