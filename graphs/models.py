from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django import forms

class User(AbstractUser):

    def __str__(self):
        return f"{self.username}"
    

class CsvFile (models.Model):
    file_name = models.FileField(upload_to="csvFiles")
    uploaded_time = models.DateTimeField(auto_now_add=True)
    activated = models.BooleanField(default=False)

    def __str__(self):
        return f"Csv File ID: {self.id}"


class CsvForm(forms.ModelForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
            visible.field.widget.attrs['aria-describedby'] = 'input-file'
            visible.field.widget.attrs['aria-label'] = 'Upload'

    class Meta:
        model = CsvFile
        fields = ('file_name',)
        labels = {
            "file_name": ""
        }


class ChartData(models.Model):
    class Meta:
        ordering = ('-id',)
    
    name = models.CharField(max_length=100)
    csv = models.ForeignKey(CsvFile, on_delete=models.CASCADE, related_name="csvs_data")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="data_users")

    def __str__(self):
        return f"Id: {self.id} - Name: {self.name}"


class Label(models.Model):
    label_name = models.CharField(max_length=100)
    chart_data = models.ForeignKey(ChartData, on_delete=models.CASCADE, related_name="labels")

    def __str__(self):
        return f"{self.label_name}"


class Row(models.Model):
    row_number = models.PositiveBigIntegerField(blank=True, null=True)
    chart_data = models.ForeignKey(ChartData, on_delete=models.CASCADE, related_name="rows")
    
    def __str__(self):
        return f"{self.id}"


class Data(models.Model):
    label = models.ForeignKey(Label, on_delete=models.CASCADE, related_name="label_data", blank=True, null=True)
    row = models.ForeignKey(Row, on_delete=models.CASCADE, related_name="row_data")
    value = models.CharField(max_length=255, blank=True, null=True)
    chart_data = models.ForeignKey(ChartData, on_delete=models.CASCADE, related_name="chart_datas")
    

class Chart(models.Model):
    class Meta:
        ordering = ('name',)

    name = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    subtitle = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chart_users")
    chart_data = models.ForeignKey(ChartData, on_delete=models.CASCADE, related_name="chart_data_chart")
    xName = models.CharField(max_length=100, blank=True, null=True)
    yName = models.CharField(max_length=100, blank=True, null=True)
    BAR = "Bar"
    LINE = "Line"
    PIE = "Pie"
    TYPE_CHOICES = [
        (BAR, "Bar"),
        (LINE, "Line"),
        (PIE, "Pie"),
    ]
    type = models.CharField(max_length=4, choices=TYPE_CHOICES, default=BAR)

    def __str__(self):
        return f"{self.name}"


class ChartTemplate(models.Model):
    class Meta:
        ordering = ('name',)

    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="template_users")

    def __str__(self):
        return f"{self.name} by {self.user.username}"