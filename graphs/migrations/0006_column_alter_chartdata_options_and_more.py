# Generated by Django 4.2.1 on 2023-05-30 16:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('graphs', '0005_rename_acitvated_csvfile_activated'),
    ]

    operations = [
        migrations.CreateModel(
            name='Column',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('column_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AlterModelOptions(
            name='chartdata',
            options={'ordering': ('-id',)},
        ),
        migrations.RemoveField(
            model_name='chartdata',
            name='column_name',
        ),
        migrations.AddField(
            model_name='chartdata',
            name='csv',
            field=models.ForeignKey(default=8, on_delete=django.db.models.deletion.CASCADE, related_name='csvs_data', to='graphs.csvfile'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='chartdata',
            name='name',
            field=models.CharField(max_length=100),
        ),
        migrations.AddField(
            model_name='chartdata',
            name='column_names',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='columns_data', to='graphs.column'),
            preserve_default=False,
        ),
    ]