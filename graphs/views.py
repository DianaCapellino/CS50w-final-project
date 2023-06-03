from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse
from django.core.files import File
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from pathlib import Path
from .models import User, CsvFile, ChartData, Data, Label, Row, Chart, ChartTemplate
from .models import CsvForm
import json
import csv


def index(request):
    # Form to upload csv file
    form = CsvForm(request.POST or None, request.FILES or None)
    new_csv_obj = None

    # If the form is valid it will read the file
    if form.is_valid():
        form.save()
        form = CsvForm
        new_csv_obj = CsvFile.objects.get(activated=False)
        upload_data(new_csv_obj, request.user)

        # Display the page with the specific chart data
        new_chart_data = ChartData.objects.get(csv=new_csv_obj)
        return HttpResponseRedirect(reverse("display_data", args=[new_chart_data.id]))

    # Render the index page with the form
    return render(request, "graphs/index.html", {
        "form": form
    })


# Login implementation
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "graphs/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "graphs/login.html")


# Logout implementation
@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


# Register implementation
def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "graphs/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "graphs/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "graphs/register.html")
    

def upload_data(csv_obj, user):

    chart_data = ChartData.objects.create(
        name=csv_obj.file_name,
        csv= csv_obj,
        user=user
    )
    
    with open(csv_obj.file_name.path, "r") as f:
        reader = csv.reader(f)

        labels = []
        rows = []
        row_number = 1

        for i, row in enumerate(reader):
            if i == 0:
                chart_data.name = row[0]
                chart_data.save()
            elif i == 1:
                for col in row:
                    label = Label.objects.create(
                        label_name=col,
                        chart_data=chart_data
                    )
                    labels.append(label)
            else:
                new_row = Row.objects.create(
                    row_number=row_number,
                    chart_data=chart_data
                )
                rows.append(new_row)

                col_number = 0
                for col in row:
                    Data.objects.create(
                        label=labels[col_number],
                        row=new_row,
                        value=col,
                        chart_data=chart_data
                    )
                    col_number = col_number + 1
                row_number = row_number + 1
    
    csv_obj.activated = True
    csv_obj.save()

# Bring all the data to the site to manage it
def display_data(request, data_id):

    chart_data = ChartData.objects.get(pk=data_id)
    values = Data.objects.filter(chart_data=chart_data)
    labels = Label.objects.filter(chart_data=chart_data)
    rows = Row.objects.filter(chart_data=chart_data)

    return render(request, "graphs/data.html", {
        "data": chart_data,
        "values": values,
        "labels": labels,
        "rows": rows
    })


# Display for all the information at once
def all_data(request, data_id):
    chart_data = ChartData.objects.get(pk=data_id)
    values = Data.objects.filter(chart_data=chart_data)
    labels = Label.objects.filter(chart_data=chart_data)
    rows = Row.objects.filter(chart_data=chart_data)

    return render(request, "graphs/all_data.html", {
        "data": chart_data,
        "values": values,
        "labels": labels,
        "rows": rows
    })


def json_data(request, data_id):
    
    # Query for data item
    try:
        data_obj = ChartData.objects.get(pk=data_id)
        data = model_to_dict(data_obj)
    except ChartData.DoesNotExist:
        return JsonResponse({"error": "Data not found."}, status=404)
    
    # Return data contents
    if request.method == "GET":
        return JsonResponse(data, safe=False)


def json_labels(request, data_id):
    
    # Query for list of labels
    try:
        data_obj = ChartData.objects.get(pk=data_id)
        label_list = Label.objects.filter(chart_data=data_obj)
        labels = list(label_list.values())
    except ChartData.DoesNotExist:
        return JsonResponse({"error": "Data not found."}, status=404)
    
    # Return labels
    if request.method == "GET":
        return JsonResponse(labels, safe=False)


def json_rows(request, data_id):
    
    # Query for list of rows
    try:
        data_obj = ChartData.objects.get(pk=data_id)
        row_list = Row.objects.filter(chart_data=data_obj)
        rows = list(row_list.values())
    except ChartData.DoesNotExist:
        return JsonResponse({"error": "Data not found."}, status=404)
    
    # Return rows
    if request.method == "GET":
        return JsonResponse(rows, safe=False)


def json_values(request, data_id):
    
    # Query for list of rows
    try:
        data_obj = ChartData.objects.get(pk=data_id)
        values_list = Data.objects.filter(chart_data=data_obj)
        values = list(values_list.values())
    except ChartData.DoesNotExist:
        return JsonResponse({"error": "Data not found."}, status=404)
    
    # Return rows
    if request.method == "GET":
        return JsonResponse(values, safe=False)


# It brings the items in one specific row
def json_row_items(request, data_id, row_nmb):
    
    # Query for list of rows
    try:
        data_obj = ChartData.objects.get(pk=data_id)
        row_obj = Row.objects.get(row_number=row_nmb)
        row_items_list = Data.objects.filter(chart_data=data_obj).filter(row=row_obj)
        row_items = list(row_items_list.values())
        
    except ChartData.DoesNotExist:
        return JsonResponse({"error": "Data not found."}, status=404)
    
    # Return row values
    if request.method == "GET":
        return JsonResponse(row_items, safe=False)
    

def remove_currency(currency, value):
    pass


@login_required
def create_chart(request, data):
    pass