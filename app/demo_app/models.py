from django.contrib.postgres.fields import ArrayField
from django.db import models


class DemoModel(models.Model):
    demo_array_field = ArrayField(
        ArrayField(
            models.CharField(max_length=1000, blank=True),
            size=5,
        ),
        default=list,
    )
