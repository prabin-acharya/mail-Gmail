# Generated by Django 3.2.4 on 2021-06-24 02:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0004_remove_email_archived'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='timestamp',
            field=models.DateTimeField(blank=True),
        ),
    ]