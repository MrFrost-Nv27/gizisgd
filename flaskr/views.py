from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from .models import Gizi
from . import db

views = Blueprint("views", __name__)


@views.route("/")
def index():
    return render_template(
        "page/index.html",
        page="dashboard",
    )


@views.route("/home")
def home():
    return render_template(
        "page/index.html",
        page="dashboard",
    )

@views.route("/gizi")
def gizi():
    return render_template(
        "page/gizi.html",
        page="gizi",
    )

@views.route("/model")
def model():
    return render_template(
        "page/model.html",
        page="model",
    )