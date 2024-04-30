from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import Gizi, Results, Models
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score
from joblib import dump, load
from sklearn.model_selection import KFold
import datetime

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


@api.route("/model", methods=["GET", "POST"])
def model():
    if request.method == 'POST':
        data = Models(loss=request.form.get("loss"),
                      alpha=request.form.get("alpha"),
                      max_iter=request.form.get("max_iter"),
                      testsize=request.form.get("testsize"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200

    data = Models.query.all()
    return {"data": [k.serialize() for k in data]}, 200


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


@api.route("/model/<id>", methods=["GET", "POST"])
def modelbyid(id):
    data = Models.query.get(id)
    if request.method == 'POST':
        # Fetch dataset as dataframe
        dataset = Gizi.query.all()
        dataframe = pd.DataFrame.from_records(
            [ds.serialize() for ds in dataset])

        # split dataset to X and y variable
        X = dataframe[['age', 'gender', 'weight', 'height']].values
        y = dataframe['status'].values  # target / label

        # initiate train and test dataset
        if data.testsize > 1:
            data.testsize = int(data.testsize)
            kf = KFold(n_splits=data.testsize)
            kf.get_n_splits(X)

            # init accuracy and clf list
            accuracy_scores = [None] * data.testsize
            clfs = [None] * data.testsize

            for i, (train_index, test_index) in enumerate(kf.split(X)):
                clf = SGDClassifier(loss=data.loss, alpha=data.alpha,
                                    max_iter=data.max_iter, shuffle=False)
                clf = clf.fit(X[train_index, :], y[train_index])
                y_pred = clf.predict(X[test_index, :])
                accuracy_scores[i] = accuracy_score(y[test_index], y_pred)
                clfs[i] = clf

                for j in range(len(X[test_index, :])):
                    r = Results(model_id=data.id,
                                actual=y[test_index][j],
                                predicted=y_pred[j], fold=i)
                    db.session.add(r)
                    db.session.commit()

            # get best accuracy
            highest_accuracy = max(accuracy_scores)
            index = accuracy_scores.index(highest_accuracy)

            # dump best model to file
            dump(clfs[index], f'models/{data.id}.joblib')

            # safe accuracy and return response
            data.accuracy = highest_accuracy
            data.learning_at = datetime.datetime.now()
            db.session.commit()
            return {"toast": {
                "icon": "success",
                "title": "Model berhasil di latih"
            }, "data": data.serialize()}, 200
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=data.testsize, shuffle=False)
            clf = SGDClassifier(loss=data.loss, alpha=data.alpha,
                                max_iter=data.max_iter, shuffle=False)
            clf = clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)

            # safe y_pred to database
            for i in range(len(X_test)):
                r = Results(model_id=data.id,
                            actual=y_test[i],
                            predicted=y_pred[i])
                db.session.add(r)
                db.session.commit()

            # dump model to file
            dump(clf, f'models/{data.id}.joblib')

            # safe accuracy and return response
            data.accuracy = accuracy_score(y_test, y_pred)
            data.learning_at = datetime.datetime.now()
            db.session.commit()
            return {"toast": {
                "icon": "success",
                "title": "Model berhasil di latih"
            }, "data": data.serialize()}, 200

    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/model/data/<id>", methods=["GET"])
def modelDatabyid(id):
    data = Models.query.get(id)
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data tidak ditemukan"
        }}, 404
    dataset = Results.query.filter_by(model_id=data.id).all()
    return {"data": [ds.serialize() for ds in dataset]}, 200


@api.route("/model/predict/<id>", methods=["POST"])
def modelPredict(id):
    data = Models.query.get(id)
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Model tidak ditemukan"
        }}, 404
    clf = load(f'models/{data.id}.joblib')
    gender = request.form.get("gender").lower() in [
        'true', '1', 't', 'y', 'yes', 'yeah', 'yup', 'certainly', 'uh-huh']
    age = int(request.form.get("age"))
    weight = float(request.form.get("weight"))
    height = float(request.form.get("height"))
    dataset = pd.DataFrame.from_records([[age, gender, weight, height]]).values
    predict = clf.predict(dataset)

    return {"toast": {
            "icon": "success",
            "title": "Data Berhasil diprediksi",
            }, "data": predict.tolist(), }, 200
