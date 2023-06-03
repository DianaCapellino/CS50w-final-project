from django.contrib import admin
from .models import CsvFile, ChartData, Data, Label, Row

admin.site.register(CsvFile)
admin.site.register(ChartData)
admin.site.register(Data)
admin.site.register(Label)
admin.site.register(Row)